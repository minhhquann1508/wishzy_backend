import express from 'express';
import {
  createNewCourse,
  getAllCourseByUser,
  getDetailCourseBySlug,
  getInstructorCourse,
} from '../controllers/course.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router
  .get('/', getAllCourseByUser)
  .get(
    '/my-course',
    [verifyToken, checkPermission('instructor')],
    getInstructorCourse,
  )
  .get('/:slug', getDetailCourseBySlug)
  .post(
    '/',
    [verifyToken, checkPermission('instructor', 'admin')],
    createNewCourse,
  );

export default router;
