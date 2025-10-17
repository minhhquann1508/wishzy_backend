import express from 'express';
import { createNewLecture } from '../controllers/lecture.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

router.post('/', [verifyToken, checkPermission('instructor', 'admin')], createNewLecture);

export default router;
