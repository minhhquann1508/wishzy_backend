import express from 'express';

import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';

import {
  createNewPostCategory,
  getDetailPostCategory,
  getAllPostCategory,
  updatePostCategory,
  deletePostCategory,
  updateStatusPostCategory 
} from '../controllers/post-category.controller';

const router = express.Router();

router
  .get('/', getAllPostCategory) // Lấy toàn bộ danh mục
  .get('/:slug', [verifyToken, checkPermission('admin')], getDetailPostCategory) // Lấy chi tiết danh mục
  .post('/', [verifyToken, checkPermission('admin')], createNewPostCategory) // Tạo danh mục
  .put('/:slug', [verifyToken, checkPermission('admin')], updatePostCategory) // Sửa danh mục
  .put('/:slug/status', [verifyToken, checkPermission('admin')], updateStatusPostCategory) // Cập nhật trạng thái danh mục
  .delete(
    '/:slug',
    [verifyToken, checkPermission('admin')],
    deletePostCategory,
  ); // ẩn danh mục

export default router;
