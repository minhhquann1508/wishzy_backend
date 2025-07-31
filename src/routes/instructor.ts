import express from 'express';
import {
  getInstructorRequests,
  rejectInstructor,
  approveInstructor,
  requestInstructor,
} from '../controllers/instructor.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Người dùng gửi yêu cầu làm giảng viên
router
  // Admin lấy danh sách yêu cầu
  .get(
    '/requests',
    verifyToken,
    checkPermission('admin'),
    getInstructorRequests,
  )
  .post('/request', requestInstructor)
  // Admin duyệt hoặc từ chối yêu cầu
  .put('/approve/:id', verifyToken, checkPermission('admin'), approveInstructor)
  .put('/reject/:id', verifyToken, checkPermission('admin'), rejectInstructor);

export default router;
