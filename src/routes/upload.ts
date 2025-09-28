import expess from 'express';
import upload from '../middlewares/upload';
import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';
import {  uploadImageUrl, uploadVideo } from '../controllers/upload.controller';

const router = expess.Router();

router
  .post('/image', upload.single('file'), verifyToken, uploadImageUrl)
  .post('/video', upload.single('file'), uploadVideo);
  

export default router;
