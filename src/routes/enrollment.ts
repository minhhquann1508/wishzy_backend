import express from 'express';
import Enrollment from '../models/enrollments.model';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// GET /api/enrollment/my-courses: Danh sách khóa học đã mua/đăng ký của user hiện tại
router.get('/my-courses', verifyToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Bạn chưa đăng nhập' });

    const enrollments = await Enrollment.find({ user: userId })
      .populate('course')
      .sort({ createdAt: -1 });

    const courses = enrollments
      .map((e: any) => e.course)
      .filter(Boolean);

    return res.json({ success: true, courses });
  } catch (error) {
    console.error('Lỗi lấy my-courses:', error);
    return res.status(500).json({ success: false, error: 'Lỗi lấy danh sách khóa học' });
  }
});

export default router;
