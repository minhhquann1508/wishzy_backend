import mongoose from 'mongoose';

const FavoriteCourseSchema = new mongoose.Schema(
  {
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

FavoriteCourseSchema.index({ user: 1, course: 1 }, { unique: true });

const FavoriteCourse = mongoose.model('FavoriteCourse', FavoriteCourseSchema);

export default FavoriteCourse;
