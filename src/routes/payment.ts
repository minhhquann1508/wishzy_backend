import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { createPayment, ipnHandler, verifyReturn as verifyReturnController, returnHandler, getPaymentDetail } from '../controllers/payment.controller';

const router = express.Router();

// POST /api/payment/create: Tạo URL thanh toán (gọi từ frontend khi user mua course)
router.post('/create', verifyToken, createPayment);

// POST /api/payment/ipn: Nhận IPN từ VNPay (webhook, verify và update DB)
router.post('/ipn', ipnHandler);

router.get('/verify', verifyReturnController);

// GET /api/payment/detail?txnRef=... : lấy thông tin khóa học đã mua theo txnRef
router.get('/detail', getPaymentDetail);

// GET /api/payment/return: Hứng VNPay trả về (user redirect)
router.get('/return', returnHandler);

export default router;