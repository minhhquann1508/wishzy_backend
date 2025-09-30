import express from 'express';
import { vnpay } from '../configs/vnpay';
import { verifyToken } from '../middlewares/verifyToken';  // Nếu cần auth
import Order from '../models/order.model';
import OrderDetail from '../models/order-detail.model';
import Course from '../models/course.model';
import Enrollment from '../models/enrollments.model';
import { CustomRequest } from '../types/request';

const router = express.Router();

// POST /api/payment/create: Tạo URL thanh toán (gọi từ frontend khi user mua course)
router.post('/create', verifyToken, async (req: CustomRequest, res) => {  // Thêm auth nếu cần
  try {
    const { courseId, courseSlug, orderInfo } = req.body as { courseId?: string; courseSlug?: string; orderInfo?: string };
    if (!courseId && !courseSlug) return res.status(400).json({ success: false, error: 'Thiếu courseId hoặc courseSlug' });
    if (!req.user?.id) return res.status(401).json({ success: false, error: 'Bạn chưa đăng nhập' });

    const course = courseId
      ? await Course.findById(courseId)
      : await Course.findOne({ slug: courseSlug });
    if (!course) return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });

    // Tính giá sau khuyến mãi (nếu hợp lệ trong thời gian)
    let finalPrice = course.price;
    const now = new Date();
    if (
      course.sale &&
      course.sale.value &&
      ((course.sale.saleStartDate && course.sale.saleStartDate <= now) || !course.sale.saleStartDate) &&
      ((course.sale.saleEndDate && course.sale.saleEndDate >= now) || !course.sale.saleEndDate)
    ) {
      if (course.sale.saleType === 'percent') {
        finalPrice = Math.max(0, Math.round(course.price * (1 - course.sale.value / 100)));
      } else if (course.sale.saleType === 'fixed') {
        finalPrice = Math.max(0, course.price - course.sale.value);
      }
    }

    const txnRef = `ORDER_${Date.now()}_${req.user.id}`;  // Mã giao dịch unique

    // Tạo order ở trạng thái processing (chờ thanh toán)
    const order = await Order.create({
      user: req.user.id,
      txnRef,
      totalAmount: finalPrice,
      paymentMethod: 'vnpay',
      status: 'processing',
      provider: 'vnpay',
    });

    await OrderDetail.create({
      order: order._id,
      course: course._id,
      coursePrice: finalPrice,
    });

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: finalPrice * 100,  // VNPay yêu cầu x100
      vnp_IpAddr: (req.ip as string) || (req.connection as any)?.remoteAddress || '127.0.0.1',
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo || `Thanh toán khóa học: ${course.courseName}`,
      vnp_BankCode: 'NCB',  // optional
    });
    
    res.json({ success: true, paymentUrl, orderId: order._id, txnRef });
  } catch (error) {
    console.error('Lỗi tạo payment:', error);
    res.status(500).json({ success: false, error: 'Lỗi tạo thanh toán' });
  }
});

// POST /api/payment/ipn: Nhận IPN từ VNPay (webhook, verify và update DB)
router.post('/ipn', async (req, res) => {
  try {
    const verification = vnpay.verifyIpnCall(req.body);
    const txnRef = verification.vnp_TxnRef;

    if (!txnRef) {
      return res.json({ RspCode: '01', Message: 'Missing txnRef' });
    }

    const order = await Order.findOne({ txnRef });
    if (!order) {
      return res.json({ RspCode: '01', Message: 'Order not found' });
    }

    // Lưu meta từ VNPay
    order.providerMeta = verification as any;

    if (verification.isSuccess && verification.vnp_ResponseCode === '00') {
      if (order.status === 'completed') {
        // Idempotent
        return res.json({ RspCode: '00', Message: 'already processed' });
      }

      order.status = 'completed';
      await order.save();

      const detail = await OrderDetail.findOne({ order: order._id });
      if (detail) {
        const courseId = detail.course;
        const userId = order.user;

        // Enroll user nếu chưa có
        const existingEnroll = await Enrollment.findOne({ user: userId, course: courseId });
        if (!existingEnroll) {
          await Enrollment.create({ user: userId, course: courseId });
        }
      }

      console.log('Thanh toán thành công:', txnRef);
      return res.json({ RspCode: '00', Message: 'success' });
    } else {
      order.status = 'cancelled';
      await order.save();
      console.log('Thanh toán thất bại:', verification.message);
      return res.json({ RspCode: '01', Message: 'fail' });
    }
  } catch (error) {
    console.error('Lỗi IPN:', error);
    return res.json({ RspCode: '99', Message: 'error' });
  }
});

router.get('/verify', (req, res) => {
  try {
    const q = req.query as any;
    // If VNPay signature exists, perform strict verify
    if (q && (q.vnp_SecureHash || q.vnp_SecureHashType)) {
      const verification = vnpay.verifyReturnUrl(q);
      return res.json(verification);
    }

    // Fallback: return a tolerant result based on provided params to avoid 500
    const isSuccess = String(q?.isSuccess ?? '').toLowerCase() === 'true' || q?.vnp_ResponseCode === '00';
    return res.json({
      isSuccess,
      vnp_ResponseCode: q?.vnp_ResponseCode,
      vnp_TxnRef: q?.vnp_TxnRef,
      message: q?.message || (isSuccess ? 'success' : 'unverified'),
    });
  } catch (error) {
    console.error('Lỗi verify:', error);
    return res.status(500).json({ success: false, error: 'Lỗi xác thực return' });
  }
});

// GET /api/payment/return: Hứng VNPay trả về (user redirect)
router.get('/return', (req, res) => {
  try {
    const verification = vnpay.verifyReturnUrl(req.query as any);

    // Nếu có FRONTEND_RETURN_URL thì redirect người dùng về FE
    const frontendReturn = process.env.FRONTEND_RETURN_URL;
    if (frontendReturn) {
      // Redirect về FE, forward toàn bộ query gốc của VNPay để FE có đủ tham số
      const url = new URL(frontendReturn);
      const original = req.query as Record<string, unknown>;
      for (const [k, v] of Object.entries(original)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
      // Thêm một số flag tiện cho FE
      url.searchParams.set('isSuccess', String(!!verification.isSuccess));
      if (verification.message) url.searchParams.set('message', verification.message);

      return res.redirect(302, url.toString());
    }

    // Mặc định trả JSON nếu không cấu hình redirect
    return res.json(verification);
  } catch (error) {
    console.error('Lỗi return:', error);
    return res.status(500).json({ success: false, error: 'Lỗi xử lý return' });
  }
});

export default router;