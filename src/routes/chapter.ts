import express from 'express';
import {
  createNewChapter,
  deleteChapterBySlug,
  getAllChapterOfCourse,
  updateChapterBySlug,
} from '../controllers/chapter.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router
  .get('/:courseSlug', getAllChapterOfCourse)
  .put(
    '/:chapterSlug',
    [verifyToken, checkPermission('instructor')],
    updateChapterBySlug,
  )
  .post('/', verifyToken, checkPermission('instructor'), createNewChapter)
  .delete(
    '/chapterSlug',
    verifyToken,
    checkPermission('instructor'),
    deleteChapterBySlug,
  );

export default router;
