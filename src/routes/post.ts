import express from 'express';

import { checkPermission } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';

import {
  createNewPost,
  getDetailPost,
  getAllPosts,
  getMyPosts,
  updatePost,
  deletePost,
} from '../controllers/post.controller';

const router = express.Router();

router
  .get('/', getAllPosts) // lấy toàn bộ bài viết
  .get(
    '/my-blog',
    [verifyToken, checkPermission('instructor', 'admin')],
    getMyPosts,
  ) // lấy toàn bộ bài viết của tôi
  .get('/:slug', getDetailPost) // lấy chi tiết bài viết
  .post(
    '/',
    [verifyToken, checkPermission('instructor', 'admin')],
    createNewPost,
  ) // đăng bài viết
  .put(
    '/:slug',
    [verifyToken, checkPermission('instructor', 'admin')],
    updatePost,
  ) // Sửa bài viết
  .delete(
    '/:slug',
    [verifyToken, checkPermission('instructor', 'admin')],
    deletePost,
  ); // Xóa bài viết

export default router;
