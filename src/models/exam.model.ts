import mongoose from 'mongoose';
import slugify from 'slugify';

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    description: String,
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
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
    status: {
      type: Boolean,
      default: true,
    },
    slug: String,
  },
  { timestamps: true },
);

ExamSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, {
    replacement: '-',
    lower: true,
    strict: true,
  });
  next();
});

const Exam = mongoose.model('Exam', ExamSchema);

export default Exam;
