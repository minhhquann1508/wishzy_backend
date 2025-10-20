import express from 'express';
import { getQuestions, getQuestionsByCourse, submitAndGrade, initializeExam, getAllExams } from '../controllers/testExam.controller'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam and quiz management endpoints
 */

/**
 * @swagger
 * /api/exams/initialize:
 *   get:
 *     summary: Initialize exam data
 *     tags: [Exams]
 *     description: Initialize or seed exam questions into database
 *     responses:
 *       200:
 *         description: Exam initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Khởi tạo bài thi thành công
 */
// router.get('/initialize', initializeExam);
// router.get('/questions/:examId', getQuestions); // API lấy câu hỏi theo examId
// router.get('/questions', getQuestionsByCourse); // API lấy câu hỏi theo courseId (query)
// router.post('/submit',submitAndGrade); // API submit và chấm điểm
// router.get('/all', getAllExams); // API lấy tất cả đề
/**
 * @swagger
 * /api/exams/questions/{examId}:
 *   get:
 *     summary: Get exam questions by exam ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                       correctAnswer:
 *                         type: string
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/getAllExams', getAllExams);
router.get('/questions/:examId', getQuestions);
/**
 * @swagger
 * /api/exams/questions:
 *   get:
 *     summary: Get exam questions by course ID
 *     tags: [Exams]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to get exam questions
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Course ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/questions', getQuestionsByCourse);
/**
 * @swagger
 * /api/exams/submit:
 *   post:
 *     summary: Submit exam answers and get grade
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - answers
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *                 example: 507f1f77bcf86cd799439011
 *               answers:
 *                 type: array
 *                 description: Array of user answers
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *                 example:
 *                   - questionId: "q1"
 *                     answer: "A"
 *                   - questionId: "q2"
 *                     answer: "B"
 *     responses:
 *       200:
 *         description: Exam graded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Chấm điểm thành công
 *                 score:
 *                   type: number
 *                   description: Score percentage (0-100)
 *                   example: 85
 *                 correctAnswers:
 *                   type: integer
 *                   description: Number of correct answers
 *                 totalQuestions:
 *                   type: integer
 *                   description: Total number of questions
 *                 passed:
 *                   type: boolean
 *                   description: Whether the exam was passed
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/submit',submitAndGrade);

export default router;