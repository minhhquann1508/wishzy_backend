import express from 'express';
import {
  createNewCourse,
  getAllCourseByUser,
  getDetailCourseBySlug,
  getHotCourse,
  getInstructorCourse,
} from '../controllers/course.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/course:
 *   get:
 *     summary: Get all courses for users
 *     tags: [Courses]
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
 *       - in: query
 *         name: courseName
 *         schema:
 *           type: string
 *         description: Search by course name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: orderDate
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *         description: Sort by date (1 for ascending, -1 for descending)
 *     responses:
 *       200:
 *         description: List of courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy danh sách khóa học thành công
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllCourseByUser);

/**
 * @swagger
 * /api/course/my-course:
 *   get:
 *     summary: Get courses created by the instructor
 *     tags: [Courses]
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
 *       - in: query
 *         name: courseName
 *         schema:
 *           type: string
 *         description: Search by course name
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by course status
 *       - in: query
 *         name: orderDate
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *         description: Sort by date (1 for ascending, -1 for descending)
 *     responses:
 *       200:
 *         description: Instructor courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy danh sách khóa học thành công
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
router.get(
  '/my-course',
  [verifyToken, checkPermission('instructor')],
  getInstructorCourse,
);

/**
 * @swagger
 * /api/course/hot-course:
 *   get:
 *     summary: Get hot/popular courses
 *     tags: [Courses]
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
 *         description: Hot courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy danh sách khóa học hot thành công
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/hot-course', getHotCourse);

/**
 * @swagger
 * /api/course/{slug}:
 *   get:
 *     summary: Get course details by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Lấy chi tiết khóa học thành công
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', getDetailCourseBySlug);

/**
 * @swagger
 * /api/course:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
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
 *               - courseName
 *               - price
 *               - subject
 *             properties:
 *               courseName:
 *                 type: string
 *                 description: Course name
 *                 example: Toán học lớp 10
 *               price:
 *                 type: number
 *                 description: Course price
 *                 example: 500000
 *               subject:
 *                 type: string
 *                 description: Subject ID
 *                 example: 507f1f77bcf86cd799439011
 *               description:
 *                 type: string
 *                 description: Course description
 *               thumbnail:
 *                 type: string
 *                 description: Course thumbnail URL
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 description: Course difficulty level
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Course requirements
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tạo mới khóa học thành công
 *                 course:
 *                   $ref: '#/components/schemas/Course'
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
router.post(
  '/',
  [verifyToken, checkPermission('instructor', 'admin')],
  createNewCourse,
);

export default router;
