import express from 'express';
import {
  getInstructorRequests,
  rejectInstructor,
  approveInstructor,
  requestInstructor,
} from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Người dùng gửi yêu cầu làm giảng viên
router.post('/request', verifyToken, requestInstructor);

// Admin duyệt hoặc từ chối yêu cầu
router.post('/approve/:id', verifyToken, checkPermission('admin'), approveInstructor);
router.post('/reject/:id', verifyToken, checkPermission('admin'), rejectInstructor);

// Admin lấy danh sách yêu cầu
router.get('/requests', verifyToken, checkPermission('admin'), getInstructorRequests);

export default router;
