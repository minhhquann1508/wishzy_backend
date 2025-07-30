import mongoose from 'mongoose';

const TestcaseSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Testcase = mongoose.model('Testcase', TestcaseSchema);

export default Testcase;
