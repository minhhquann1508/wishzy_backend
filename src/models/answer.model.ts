import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Answer = mongoose.model('Answer', AnswerSchema);

export default Answer;
