import { Request, Response } from 'express';
import { vnpay } from '../configs/vnpay';
import Order from '../models/order.model';
import OrderDetail from '../models/order-detail.model';
import Course from '../models/course.model';
import Enrollment from '../models/enrollments.model';
import { CustomRequest } from '../types/request';

export const createPayment = async (req: CustomRequest, res: Response) => {
  try {
    const { courseId, courseIds, courseSlug, orderInfo } = req.body as { courseId?: string; courseIds?: string[]; courseSlug?: string; orderInfo?: string };
    if (!courseId && !courseSlug && (!courseIds || courseIds.length === 0)) {
      return res.status(400).json({ success: false, error: 'Thiếu courseIds hoặc courseId/courseSlug' });
    }
    if (!req.user?.id) return res.status(401).json({ success: false, error: 'Bạn chưa đăng nhập' });

    // Build course list
    let courses: Array<typeof Course.prototype> = [] as any;
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      // Dedupe incoming ids
      const uniqIds = Array.from(new Set(courseIds));
      courses = await Course.find({ _id: { $in: uniqIds } });
      if (courses.length === 0) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy khóa học nào hợp lệ' });
      }
    } else {
      const single = courseId
        ? await Course.findById(courseId)
        : await Course.findOne({ slug: courseSlug });
      if (!single) return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
      courses = [single];
    }

    // Lọc bỏ khóa học đã sở hữu (Enrollment)
    const allCourseIds = courses.map(c => c._id);
    const owned = await Enrollment.find({ user: req.user.id, course: { $in: allCourseIds } }).select('course');
    const ownedSet = new Set(owned.map(e => String(e.course)));
    const filteredCourses = courses.filter(c => !ownedSet.has(String(c._id)));
    const excludedCourseIds = courses.filter(c => ownedSet.has(String(c._id))).map(c => String(c._id));

    if (filteredCourses.length === 0) {
      return res.status(400).json({ success: false, error: 'Bạn đã sở hữu tất cả các khóa học đã chọn', excludedCourseIds });
    }

    // Tính giá sau khuyến mãi cho từng khóa (theo server, tránh lệch giá với client)
    const now = new Date();
    const priceOf = (c: any) => {
      let p = c.price;
      if (
        c.sale &&
        c.sale.value &&
        ((c.sale.saleStartDate && c.sale.saleStartDate <= now) || !c.sale.saleStartDate) &&
        ((c.sale.saleEndDate && c.sale.saleEndDate >= now) || !c.sale.saleEndDate)
      ) {
        if (c.sale.saleType === 'percent') p = Math.max(0, Math.round(c.price * (1 - c.sale.value / 100)));
        else if (c.sale.saleType === 'fixed') p = Math.max(0, c.price - c.sale.value);
      }
      return p;
    };

    const finalPrices = filteredCourses.map(c => priceOf(c));
    const totalAmount = finalPrices.reduce((s, v) => s + v, 0);

    const txnRef = `ORDER_${Date.now()}_${req.user.id}`;  // Mã giao dịch unique

    // Tạo order ở trạng thái processing (chờ thanh toán)
    const order = await Order.create({
      user: req.user.id,
      txnRef,
      totalAmount,
      paymentMethod: 'vnpay',
      status: 'processing',
      provider: 'vnpay',
    });

    // Tạo nhiều order detail cho từng khóa
    await Promise.all(
      filteredCourses.map((c, idx) =>
        OrderDetail.create({
          order: order._id,
          course: c._id,
          coursePrice: finalPrices[idx],
        })
      )
    );

    const firstName = filteredCourses[0].courseName;
    const extraCount = filteredCourses.length - 1;
    const composedInfo = extraCount > 0 ? `${firstName} +${extraCount} khóa khác` : firstName;

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: (req.ip as string) || (req.connection as any)?.remoteAddress || '127.0.0.1',
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo || `Thanh toán khóa học: ${composedInfo}`,
      vnp_BankCode: 'NCB',
    });
    
    return res.json({ success: true, paymentUrl, orderId: order._id, txnRef, excludedCourseIds });
  } catch (error) {
    console.error('Lỗi tạo payment:', error);
    return res.status(500).json({ success: false, error: 'Lỗi tạo thanh toán' });
  }
};

export const ipnHandler = async (req: Request, res: Response) => {
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

      const details = await OrderDetail.find({ order: order._id });
      const userId = order.user as any;
      for (const d of details) {
        const courseId = d.course as any;
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
      console.log('Thanh toán thất bại:', (verification as any).message);
      return res.json({ RspCode: '01', Message: 'fail' });
    }
  } catch (error) {
    console.error('Lỗi IPN:', error);
    return res.json({ RspCode: '99', Message: 'error' });
  }
};

export const verifyReturn = (req: Request, res: Response) => {
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
};

export const returnHandler = (req: Request, res: Response) => {
  try {
    const verification = vnpay.verifyReturnUrl(req.query as any);

    const frontendReturn = process.env.FRONTEND_RETURN_URL;
    if (frontendReturn) {
      const url = new URL(frontendReturn);
      const original = req.query as Record<string, unknown>;
      for (const [k, v] of Object.entries(original)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
      url.searchParams.set('isSuccess', String(!!verification.isSuccess));
      if ((verification as any).message) url.searchParams.set('message', (verification as any).message);

      return res.redirect(302, url.toString());
    }

    return res.json(verification);
  } catch (error) {
    console.error('Lỗi return:', error);
    return res.status(500).json({ success: false, error: 'Lỗi xử lý return' });
  }
};

export const getPaymentDetail = async (req: Request, res: Response) => {
  try {
    const { txnRef } = req.query as { txnRef?: string };
    if (!txnRef) return res.status(400).json({ success: false, error: 'Thiếu txnRef' });

    const order = await Order.findOne({ txnRef });
    if (!order) return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });

    const detail = await OrderDetail.findOne({ order: order._id }).populate('course');
    if (!detail) return res.status(404).json({ success: false, error: 'Không tìm thấy chi tiết đơn hàng' });

    return res.json({
      success: true,
      order: {
        _id: order._id,
        txnRef: order.txnRef,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
      course: detail.course,
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết payment:', error);
    return res.status(500).json({ success: false, error: 'Lỗi lấy chi tiết thanh toán' });
  }
};
