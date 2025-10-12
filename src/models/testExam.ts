import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  answer: string; 
}

export interface IExam extends Document {
  courseId: string;
  title: string;
  questions: IQuestion[];
}

const examSchema: Schema = new Schema({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
  }],
});

export default mongoose.model<IExam>('Exam', examSchema);