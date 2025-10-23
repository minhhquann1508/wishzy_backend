import express from 'express';
import {
  getAllUser,
  getAllStudents,
  updateUserData,
  createUser,
  getUserById,
  getUserProfile,
  updateUserById,
  deleteUserById,
} from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
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
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, checkPermission('admin'), createUser);
/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', verifyToken, checkPermission('admin'), updateUserById);
/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', verifyToken, checkPermission('admin'), deleteUserById);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', verifyToken, checkPermission('admin'), getAllUser);
/**
 * @swagger
 * /api/user/students:
  *   get:
  *   summary: Get all students (Admin only)
  *   tags: [Users]
  *   security:
  *     - bearerAuth: []
  *     - cookieAuth: []
  *   responses:
  *     200:
  *       description: List of students
  *     401:
  *       description: Unauthorized
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/Error'
  */
router.get('/students', verifyToken, checkPermission('admin'), getAllStudents);
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', verifyToken, checkPermission('instructor', 'admin', 'staff'), getUserById);


/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/profile', verifyToken, getUserProfile);
/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Update current user data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User data updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:  
 *               $ref: '#/components/schemas/Error'
 */
router.put('/update', verifyToken, updateUserData);

export default router;
