import express from 'express';
import { getQuestions, getQuestionsByCourse, submitAndGrade, initializeExam } from '../controllers/testExam.controller'

const router = express.Router();

router.get('/initialize', initializeExam);
router.get('/questions/:examId', getQuestions); // API lấy câu hỏi theo examId
router.get('/questions', getQuestionsByCourse); // API lấy câu hỏi theo courseId (query)
router.post('/submit',submitAndGrade); // API submit và chấm điểm

export default router;