import express from 'express';
import {
  createNewGrade,
  deleteGradeBySlug,
  getAllGrades,
  getGradeBySlug,
  updateGradeBySlug,
} from '../controllers/grade.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade/Class level management endpoints
 */

/**
 * @swagger
 * /api/grade:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
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
 *         description: List of grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 grades:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getAllGrades)
/**
 * @swagger
 * /api/grade/{slug}:
 *   get:
 *     summary: Get grade details by slug
 *     tags: [Grades]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade slug
 *     responses:
 *       200:
 *         description: Grade details retrieved successfully
 *       404:
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .get('/:slug', getGradeBySlug)
/**
 * @swagger
 * /api/grade:
 *   post:
 *     summary: Create a new grade (Admin only)
 *     tags: [Grades]
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
 *               - gradeName
 *             properties:
 *               gradeName:
 *                 type: string
 *                 example: Lớp 10
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .post('/', [verifyToken, checkPermission('admin')], createNewGrade)
/**
 * @swagger
 * /api/grade/{slug}:
 *   put:
 *     summary: Update grade by slug (Admin only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gradeName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .put('/:slug', [verifyToken, checkPermission('admin')], updateGradeBySlug)
/**
 * @swagger
 * /api/grade/{slug}:
 *   delete:
 *     summary: Delete grade by slug (Admin only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade slug
 *     responses:
 *       200:
 *         description: Grade deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .delete('/:slug', [verifyToken, checkPermission('admin')], deleteGradeBySlug);

export default router;
