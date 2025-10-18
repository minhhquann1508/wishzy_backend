import express from 'express';
import {
  createNewChapter,
  deleteChapterBySlug,
  getAllChapterOfCourse,
  updateChapterBySlug,
} from '../controllers/chapter.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Course chapter management endpoints
 */

/**
 * @swagger
 * /api/chapter/{courseSlug}:
 *   get:
 *     summary: Get all chapters of a course
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: courseSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Chapters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy danh sách chương thành công
 *                 chapters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       chapterName:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       lectures:
 *                         type: array
 *                         items:
 *                           type: object
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:courseSlug', getAllChapterOfCourse)
/**
 * @swagger
 * /api/chapter/{chapterSlug}:
 *   put:
 *     summary: Update chapter by slug (Instructor only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterName:
 *                 type: string
 *                 example: Chương 1 - Giới thiệu
 *               order:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .put(
    '/:chapterSlug',
    [verifyToken, checkPermission('instructor')],
    updateChapterBySlug,
  )
/**
 * @swagger
 * /api/chapter:
 *   post:
 *     summary: Create a new chapter (Instructor/Admin only)
 *     tags: [Chapters]
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
 *               - chapterName
 *               - courseId
 *             properties:
 *               chapterName:
 *                 type: string
 *                 example: Chương 1 - Giới thiệu
 *               courseId:
 *                 type: string
 *                 description: Course ID
 *                 example: 507f1f77bcf86cd799439011
 *               order:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chapter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tạo chương thành công
 *                 chapter:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .post('/', verifyToken, checkPermission('admin', 'instructor'), createNewChapter)
/**
 * @swagger
 * /api/chapter/{chapterSlug}:
 *   delete:
 *     summary: Delete chapter by slug (Instructor only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter slug
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .delete(
    '/chapterSlug',
    verifyToken,
    checkPermission('instructor'),
    deleteChapterBySlug,
  );

export default router;
