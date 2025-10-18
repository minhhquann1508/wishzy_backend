import express from 'express';
import {
  createBanner,
  getAllBanners,
  getBannerDetail,
  updateBanner,
  deleteBanner,
  getCourseBannersOnly, 
} from '../controllers/banner.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banner management for homepage and courses
 */

/**
 * @swagger
 * /api/banner:
 *   post:
 *     summary: Create a new banner (Admin only)
 *     tags: [Banners]
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
 *               - title
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: Khuyến mãi mùa hè
 *               imageUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/xxx/image/upload/banner.jpg
 *               courseId:
 *                 type: string
 *                 description: Optional course ID to link banner to
 *               link:
 *                 type: string
 *                 description: External link URL
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, checkPermission('admin'), createBanner);

/**
 * @swagger
 * /api/banner:
 *   get:
 *     summary: Get all banners
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/', getAllBanners);

/**
 * @swagger
 * /api/banner/course-only:
 *   get:
 *     summary: Get banners linked to courses only
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Course banners retrieved successfully
 */
router.get('/course-only', getCourseBannersOnly);

/**
 * @swagger
 * /api/banner/{id}:
 *   get:
 *     summary: Get banner detail
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner detail retrieved successfully
 *       404:
 *         description: Banner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getBannerDetail);

/**
 * @swagger
 * /api/banner/{id}:
 *   put:
 *     summary: Update banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               courseId:
 *                 type: string
 *               link:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', verifyToken, checkPermission('admin'), updateBanner);

/**
 * @swagger
 * /api/banner/{id}:
 *   delete:
 *     summary: Delete banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', verifyToken, checkPermission('admin'), deleteBanner);

export default router;
