import express from 'express';
import {
  createNewSubject,
  getDetailSubject,
  getAllSubject,
  updateSubjectBySlug,
  deleteSubjectBySlug,
} from '../controllers/subject.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router
  .get('/', getAllSubject)
  .get('/:slug', getDetailSubject)
  .post('/', [verifyToken, checkPermission('admin')], createNewSubject)
  .put('/:slug', [verifyToken, checkPermission('admin')], updateSubjectBySlug)
  .delete(
    '/:slug',
    [verifyToken, checkPermission('admin')],
    deleteSubjectBySlug,
  );

export default router;
