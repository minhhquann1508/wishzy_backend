import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { getMyCourses } from '../controllers/enrollment.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Enrollment
 *   description: Course enrollment management endpoints
 */

/**
 * @swagger
 * /api/enrollment/my-courses:
 *   get:
 *     summary: Get courses enrolled by current user
 *     tags: [Enrollment]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of enrolled courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy danh sách khóa học đã đăng ký thành công
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-courses', verifyToken, getMyCourses);

export default router;
