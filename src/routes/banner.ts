import express from 'express';
import {
  createBanner,
  getAllBanners,
  getBannerDetail,
  updateBanner,
  deleteBanner,
  getCourseBannersOnly, // ✅ thêm controller mới
} from '../controllers/banner.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Tạo banner
router.post('/', verifyToken, checkPermission('admin'), createBanner);

// Lấy tất cả banner
router.get('/', getAllBanners);

// Lấy banner chỉ gắn với khoá học
router.get('/course-only', getCourseBannersOnly);

// Chi tiết banner
router.get('/:id', getBannerDetail);

// Cập nhật banner
router.put('/:id', verifyToken, checkPermission('admin'), updateBanner);

// Xoá banner
router.delete('/:id', verifyToken, checkPermission('admin'), deleteBanner);

export default router;
