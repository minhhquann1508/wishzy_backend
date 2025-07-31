import express from 'express';
import {
  createNewGrade,
  deleteGradeBySlug,
  getAllGrades,
  getGradeBySlug,
  updateGradeBySlug,
} from '../controllers/grade.controller';

const router = express.Router();

router
  .get('/', getAllGrades)
  .get('/:slug', getGradeBySlug)
  .post('/', createNewGrade)
  .put('/:slug', updateGradeBySlug)
  .post('/:slug', deleteGradeBySlug);

export default router;
