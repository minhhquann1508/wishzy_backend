import expess from 'express';
import upload from '../middlewares/upload';
import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';
import { uploadAvatar } from '../controllers/upload.controller';

const router = expess.Router();

router.post('/testing', upload.single('file'), verifyToken, uploadAvatar);

export default router;
