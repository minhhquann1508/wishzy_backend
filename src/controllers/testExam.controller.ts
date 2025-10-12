import { Request, Response } from 'express';
import TestExam from '../models/testExam';

const sampleExam = {
  title: 'Đề toán lớp 1 mẫu',
  questions: [
    { question: '1 + 1 = ?', options: ['A) 1', 'B) 2', 'C) 3', 'D) 0'],isMultiple: true, answer: 'B' },
    { question: '3 - 1 = ?', options: ['A) 2', 'B) 4', 'C) 1', 'D) 3'], isMultiple: true, answer: 'A' },
    { question: 'Số nào lớn hơn 5?', options: ['A) 4', 'B) 6', 'C) 5', 'D) 3'], answer: 'B' },
    { question: '2 + 2 = ?', options: ['A) 3', 'B) 5', 'C) 4', 'D) 6'], answer: 'C' },
    { question: '5 - 2 = ?', options: ['A) 3', 'B) 2', 'C) 4', 'D) 1'], answer: 'A' },
  ],
};

export const initializeExam = async (req: Request, res: Response) => {
  try {
    const existingExam = await TestExam.findOne({ courseId: "math-grade1-2025" });
    if (!existingExam) {
      const newExam = new TestExam({
        courseId: "math-grade1-2025",
        title: "Đề thi trắc nghiệm Toán lớp 1 - Kỳ 1",
        questions: [
          { question: "1 + 2 = ?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], isMultiple: true, answer: "C,B" },
          { question: "5 - 3 = ?", options: ["A) 1", "B) 2", "C) 3", "D) 4"], isMultiple: true, answer: "B,C" },
          { question: "Số nào lớn hơn 4?", options: ["A) 3", "B) 5", "C) 4", "D) 2"], answer: "B" },
          { question: "2 + 3 = ?", options: ["A) 4", "B) 5", "C) 6", "D) 7"], answer: "B" },
          { question: "Số nhỏ nhất trong các số sau là: 6, 1, 4, 3?", options: ["A) 6", "B) 1", "C) 4", "D) 3"], answer: "B" },
        ],
      });
      await newExam.save();
      res.status(201).json({ message: 'Đề thi đã được khởi tạo', exam: newExam });
    } else {
      res.status(200).json({ message: 'Đề thi đã tồn tại', exam: existingExam });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Helpers cho multi-answer
function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const A = new Set(a);
  for (const x of b) if (!A.has(x)) return false;
  return true;
}
function inferIsMultipleFromAnswer(ans: unknown): boolean {
  if (typeof ans === 'string') return ans.includes(',');
  return false;
}

// API 1: Lấy câu hỏi (GET /api/exam/questions/:examId) - Không trả đáp án
export const getQuestions = async (req: Request, res: Response) => {
  try {
    let exam = await TestExam.findById(req.params.examId);
    if (!exam) {
      exam = new TestExam({ ...sampleExam, courseId: req.query.courseId || 'default' });
      await exam.save();
    }
    // Trả về chỉ question + options + isMultiple (không trả đáp án)
    const questions = exam.questions.map(q => ({
      question: q.question,
      options: q.options,
      isMultiple: (q as any).isMultiple === true || inferIsMultipleFromAnswer((q as any).answer),
    }));
    res.json({ examId: exam._id, questions });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
// Không trả đáp án
export const getQuestionsByCourse = async (req: Request, res: Response) => {
  try {
    const courseId = String(req.query.courseId || 'default');
    let exam = await TestExam.findOne({ courseId });
    if (!exam) {
      exam = new TestExam({ ...sampleExam, courseId });
      await exam.save();
    }
    const questions = exam.questions.map(q => ({
      question: q.question,
      options: q.options,
      isMultiple: (q as any).isMultiple === true || inferIsMultipleFromAnswer((q as any).answer),
    }));
    res.json({ examId: exam._id, questions });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// API 2: Submit và chấm điểm (POST /api/exam/submit)
export const submitAndGrade = async (req: Request, res: Response) => {
  const { examId, userAnswers } = req.body as { examId: string; userAnswers: Array<{ index: number; answer: string | string[] }>; };
  try {
    const exam = await TestExam.findById(examId);
    if (!exam) return res.status(404).json({ error: 'Không tìm thấy đề' });

    let score = 0;
    const total = exam.questions.length;
    const results = exam.questions.map((q, i) => {
      const found = userAnswers.find((ans) => ans.index === i);
      const userAnsArr = toArray(found?.answer);
      const correctArr = toArray((q as any).answer);
      const isCorrect = sameSet(userAnsArr, correctArr);
      if (isCorrect) score++;
      return {
        question: q.question,
        userAnswer: userAnsArr.length <= 1 ? (userAnsArr[0] ?? '') : userAnsArr,
        correctAnswer: correctArr.length <= 1 ? (correctArr[0] ?? '') : correctArr,
        isCorrect,
      };
    });

    const percentage = Math.round((score / total) * 100);
    res.json({ score, percentage, total, results });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};