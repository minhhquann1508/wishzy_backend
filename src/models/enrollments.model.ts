import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
  },
  { timestamps: true },
);

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

export default Enrollment;
