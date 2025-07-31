import express from 'express';
import {
  createNewGrade,
  deleteGradeBySlug,
  getAllGrades,
  getGradeBySlug,
  updateGradeBySlug,
} from '../controllers/grade.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router
  .get('/', getAllGrades)
  .get('/:slug', getGradeBySlug)
  .post('/', [verifyToken, checkPermission('admin')], createNewGrade)
  .put('/:slug', [verifyToken, checkPermission('admin')], updateGradeBySlug)
  .delete('/:slug', [verifyToken, checkPermission('admin')], deleteGradeBySlug);

export default router;
