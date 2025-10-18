import express from 'express';
import {
  sendFeedback,
  getFeedbacksByCourseId,
  getAllFeedbacks,
  getFeedbackDetail,
  deleteFeedback,
  getMyFeedbacks,
} from '../controllers/feedback.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Course feedback and review management
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Send feedback for a course
 *     tags: [Feedback]
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
 *               - rating
 *               - comment
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Khóa học rất hay và bổ ích
 *     responses:
 *       201:
 *         description: Feedback sent successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, sendFeedback);

/**
 * @swagger
 * /api/feedback/course/{courseId}:
 *   get:
 *     summary: Get all feedbacks for a course
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 */
router.get('/course/:courseId', getFeedbacksByCourseId);

/**
 * @swagger
 * /api/feedback/all:
 *   get:
 *     summary: Get all feedbacks (Admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: All feedbacks retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all', verifyToken, checkPermission('admin'), getAllFeedbacks);

/**
 * @swagger
 * /api/feedback/detail/{id}:
 *   get:
 *     summary: Get feedback detail (Admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/detail/:id', verifyToken, checkPermission('admin'), getFeedbackDetail);

/**
 * @swagger
 * /api/feedback/my:
 *   get:
 *     summary: Get my feedbacks
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: My feedbacks retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my', verifyToken, getMyFeedbacks);

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Delete my feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', verifyToken, deleteFeedback);

export default router;
