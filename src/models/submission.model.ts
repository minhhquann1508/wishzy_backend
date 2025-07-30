import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: Date,
    durationTaken: Number,
  },
  { timestamps: true },
);

const Submission = mongoose.model('Submission', SubmissionSchema);

export default Submission;
