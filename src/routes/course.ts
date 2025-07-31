import express from 'express';
import {
  createNewCourse,
  getAllCourseByUser,
  getDetailCourseBySlug,
} from '../controllers/course.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router
  .get('/', getAllCourseByUser)
  .get('/:slug', getDetailCourseBySlug)
  .post(
    '/',
    [verifyToken, checkPermission('instructor', 'admin')],
    createNewCourse,
  );

export default router;
