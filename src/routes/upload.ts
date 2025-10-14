import expess from 'express';
import upload from '../middlewares/upload';
import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';
import {  uploadImageUrl, uploadVideo } from '../controllers/upload.controller';

const router = expess.Router();

router
  .post('/image', upload.single('image'), uploadImageUrl)
  .post('/video', upload.single('video'), uploadVideo);
  

export default router;
