import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  answer: string; 
  isMultiple?: boolean;
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
    isMultiple: { type: Boolean, default: false },
  }],
});

export default mongoose.model<IExam>('Exam', examSchema);