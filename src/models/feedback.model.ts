import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true },
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;
