import express from 'express';
import { createNewLecture } from '../controllers/lecture.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lectures
 *   description: Lecture management endpoints
 */

/**
 * @swagger
 * /api/lecture:
 *   post:
 *     summary: Create a new lecture (Instructor/Admin only)
 *     tags: [Lectures]
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
 *               - lectureName
 *               - chapterId
 *             properties:
 *               lectureName:
 *                 type: string
 *                 example: Bài 1 - Giới thiệu về Toán học
 *               chapterId:
 *                 type: string
 *                 description: Chapter ID
 *                 example: 507f1f77bcf86cd799439011
 *               videoUrl:
 *                 type: string
 *                 description: Video URL (from Cloudinary)
 *                 example: https://res.cloudinary.com/xxx/video/upload/v123/lecture.mp4
 *               duration:
 *                 type: number
 *                 description: Lecture duration in minutes
 *                 example: 45
 *               order:
 *                 type: integer
 *                 description: Lecture order in chapter
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: Lecture description
 *               isFree:
 *                 type: boolean
 *                 description: Whether lecture is free to preview
 *                 default: false
 *     responses:
 *       201:
 *         description: Lecture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tạo bài giảng thành công
 *                 lecture:
 *                   type: object
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', [verifyToken, checkPermission('instructor', 'admin')], createNewLecture);

export default router;
