import expess from 'express';
import upload from '../middlewares/upload';
import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';
import { uploadAvatar, uploadImageUrl } from '../controllers/upload.controller';

const router = expess.Router();

router
  .post('/', upload.single('file'), verifyToken, uploadImageUrl)
  .post('/avatar', upload.single('file'), verifyToken, uploadAvatar)
  .post(
    '/course-thumbanil/:slug',
    [upload.single('file'), verifyToken, checkPermission('instructor')],
    uploadAvatar,
  );

export default router;
