import express from 'express';
import { getInstructorRequests, rejectInstructor, approveInstructor, requestInstructor } from '../controllers/user.controller';

const router = express.Router();

router
    .get('/requests', getInstructorRequests)
    .post('/reject', rejectInstructor)
    .post('/approve', approveInstructor)
    .post('/request', requestInstructor);

export default router;
