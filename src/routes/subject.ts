import express from 'express';
import {
  createNewSubject,
  getDetailSubject,
  getAllSubject,
  updateSubjectBySlug,
  deleteSubjectBySlug,
} from '../controllers/subject.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management endpoints
 */

/**
 * @swagger
 * /api/subject:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
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
 *       - in: query
 *         name: subjectName
 *         schema:
 *           type: string
 *         description: Search by subject name
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: Filter by grade ID
 *     responses:
 *       200:
 *         description: List of subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getAllSubject)
/**
 * @swagger
 * /api/subject/{slug}:
 *   get:
 *     summary: Get subject details by slug
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject slug
 *     responses:
 *       200:
 *         description: Subject details retrieved successfully
 *       400:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .get('/:slug', getDetailSubject)
/**
 * @swagger
 * /api/subject:
 *   post:
 *     summary: Create a new subject (Admin only)
 *     tags: [Subjects]
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
 *               - subjectName
 *               - grade
 *             properties:
 *               subjectName:
 *                 type: string
 *                 example: Toán học
 *               grade:
 *                 type: string
 *                 description: Grade ID
 *                 example: 507f1f77bcf86cd799439011
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .post('/', [verifyToken, checkPermission('admin')], createNewSubject)
/**
 * @swagger
 * /api/subject/{slug}:
 *   put:
 *     summary: Update subject by slug (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectName:
 *                 type: string
 *               grade:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .put('/:slug', [verifyToken, checkPermission('admin')], updateSubjectBySlug)
/**
 * @swagger
 * /api/subject/{slug}:
 *   delete:
 *     summary: Delete subject by slug (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject slug
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
  .delete(
    '/:slug',
    [verifyToken, checkPermission('admin')],
    deleteSubjectBySlug,
  );

export default router;
