import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const FAQ = mongoose.model('FAQ', FAQSchema);

export default FAQ;
