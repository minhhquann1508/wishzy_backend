import expess from 'express';
import upload from '../middlewares/upload';
import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';
import {  uploadImageUrl, uploadVideo } from '../controllers/upload.controller';

const router = expess.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints (Images & Videos)
 */

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload an image file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (jpg, jpeg, png, gif)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Upload ảnh thành công
 *                 url:
 *                   type: string
 *                   description: Cloudinary image URL
 *                   example: https://res.cloudinary.com/xxx/image/upload/v123/sample.jpg
 *       400:
 *         description: Bad request - No file or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/image', upload.single('image'), uploadImageUrl);

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload a video file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload (mp4, avi, mov, etc.)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Upload video thành công
 *                 url:
 *                   type: string
 *                   description: Cloudinary video URL
 *                   example: https://res.cloudinary.com/xxx/video/upload/v123/sample.mp4
 *                 duration:
 *                   type: number
 *                   description: Video duration in seconds
 *       400:
 *         description: Bad request - No file or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/video', upload.single('video'), uploadVideo);
  

export default router;
