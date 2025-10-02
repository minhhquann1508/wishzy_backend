import express from 'express';
import {
  getInstructorRequests,
  rejectInstructor,
  approveInstructor,
  requestInstructor,
  getAllInstructors,   
  getInstructorDetail, 
  cancelInstructorRequest,
} from '../controllers/instructor.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Admin lấy danh sách yêu cầu giảng viên
router.get(
  '/request-instructor',
  verifyToken,
  checkPermission('admin'),
  getInstructorRequests,
);

// Người dùng gửi yêu cầu làm giảng viên
router.post('/request', requestInstructor);

// Admin duyệt hoặc từ chối yêu cầu
router.put('/approve/:id', verifyToken, checkPermission('admin'), approveInstructor);
router.put('/reject/:id', verifyToken, checkPermission('admin'), rejectInstructor);

// ✅ Lấy danh sách giảng viên
router.get(
  '/',
  verifyToken,
  checkPermission('admin'), // Nếu chỉ admin xem được thì giữ, còn muốn public thì bỏ
  getAllInstructors,
);

// ✅ Lấy chi tiết giảng viên
router.get(
  '/:id',
  verifyToken,
  getInstructorDetail,
);

// ✅ Hủy yêu cầu làm giảng viên
router.put(
  '/cancel/:id',
  verifyToken,
  cancelInstructorRequest,
);

export default router;
