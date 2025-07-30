import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false'],
    default: 'multiple_choice',
  },
  score: {
    type: Number,
    required: true,
  },
});

const Question = mongoose.model('Question', QuestionSchema);

export default Question;
