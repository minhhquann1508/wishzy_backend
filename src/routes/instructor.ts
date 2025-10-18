import express from 'express';
import {
  getInstructorRequests,
  rejectInstructor,
  approveInstructor,
  requestInstructor,
  getAllInstructors,   
  getInstructorDetail, 
  cancelInstructorRequest,
} from '../controllers/instructor.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Instructors
 *   description: Instructor management and registration
 */

/**
 * @swagger
 * /api/instructor/request-instructor:
 *   get:
 *     summary: Get all instructor requests (Admin only)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: Instructor requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/request-instructor',
  verifyToken,
  checkPermission('admin'),
  getInstructorRequests,
);

/**
 * @swagger
 * /api/instructor/request:
 *   post:
 *     summary: Request to become an instructor
 *     tags: [Instructors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - experience
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: instructor@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "0123456789"
 *               experience:
 *                 type: string
 *                 example: 5 năm kinh nghiệm giảng dạy Toán học
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request submitted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/request', requestInstructor);

/**
 * @swagger
 * /api/instructor/approve/{id}:
 *   put:
 *     summary: Approve instructor request (Admin only)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Instructor approved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/approve/:id', verifyToken, checkPermission('admin'), approveInstructor);

/**
 * @swagger
 * /api/instructor/reject/{id}:
 *   put:
 *     summary: Reject instructor request (Admin only)
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Instructor rejected successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/reject/:id', verifyToken, checkPermission('admin'), rejectInstructor);

/**
 * @swagger
 * /api/instructor:
 *   get:
 *     summary: Get all instructors (Admin only)
 *     tags: [Instructors]
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
 *         description: Instructors retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  verifyToken,
  checkPermission('admin'),
  getAllInstructors,
);

/**
 * @swagger
 * /api/instructor/{id}:
 *   get:
 *     summary: Get instructor detail
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instructor ID
 *     responses:
 *       200:
 *         description: Instructor detail retrieved successfully
 *       404:
 *         description: Instructor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  verifyToken,
  getInstructorDetail,
);

/**
 * @swagger
 * /api/instructor/cancel/{id}:
 *   put:
 *     summary: Cancel instructor request
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/cancel/:id',
  verifyToken,
  cancelInstructorRequest,
);

export default router;
