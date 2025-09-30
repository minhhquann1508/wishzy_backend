import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { getMyCourses } from '../controllers/enrollment.controller';

const router = express.Router();

// GET /api/enrollment/my-courses: Danh sách khóa học đã mua/đăng ký của user hiện tại
router.get('/my-courses', verifyToken, getMyCourses);

export default router;
