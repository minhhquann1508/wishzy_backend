import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { createPayment, ipnHandler, verifyReturn as verifyReturnController, returnHandler, getPaymentDetail } from '../controllers/payment.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing with VNPay integration
 */

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create payment URL for course purchase
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - amount
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID to purchase
 *                 example: 507f1f77bcf86cd799439011
 *               amount:
 *                 type: number
 *                 description: Payment amount in VND
 *                 example: 500000
 *               bankCode:
 *                 type: string
 *                 description: Bank code (optional)
 *                 example: NCB
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 paymentUrl:
 *                   type: string
 *                   description: VNPay payment URL
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', verifyToken, createPayment);

/**
 * @swagger
 * /api/payment/ipn:
 *   post:
 *     summary: VNPay IPN handler (webhook)
 *     tags: [Payment]
 *     description: Receives instant payment notification from VNPay
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: IPN processed successfully
 */
router.post('/ipn', ipnHandler);

/**
 * @swagger
 * /api/payment/verify:
 *   get:
 *     summary: Verify payment return from VNPay
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Transaction reference
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: VNPay response code
 *     responses:
 *       200:
 *         description: Payment verification result
 */
router.get('/verify', verifyReturnController);

/**
 * @swagger
 * /api/payment/detail:
 *   get:
 *     summary: Get payment details by transaction reference
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: txnRef
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference number
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 payment:
 *                   type: object
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/detail', getPaymentDetail);

/**
 * @swagger
 * /api/payment/return:
 *   get:
 *     summary: Handle VNPay return (user redirect after payment)
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to success/failure page
 */
router.get('/return', returnHandler);

export default router;