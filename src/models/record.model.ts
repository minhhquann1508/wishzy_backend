import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const Record = mongoose.model('Record', RecordSchema);

export default Record;
