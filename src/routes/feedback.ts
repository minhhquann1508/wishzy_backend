import express from 'express';
import {
  sendFeedback,
  getFeedbacksByCourseId,
  getAllFeedbacks,
  getFeedbackDetail,
  deleteFeedback,
  getMyFeedbacks,
} from '../controllers/feedback.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Gửi feedback (body chứa courseId)
router.post('/', verifyToken, sendFeedback);

// Lấy feedback theo courseId (public)
router.get('/course/:courseId', getFeedbacksByCourseId);

// Admin: lấy tất cả feedback
router.get('/all', verifyToken, checkPermission('admin'), getAllFeedbacks);

// Admin: chi tiết feedback
router.get('/detail/:id', verifyToken, checkPermission('admin'), getFeedbackDetail);

// Người dùng: lấy feedback của mình
router.get('/my', verifyToken, getMyFeedbacks);

// Người dùng: xóa feedback
router.delete('/:id', verifyToken, deleteFeedback);

export default router;
