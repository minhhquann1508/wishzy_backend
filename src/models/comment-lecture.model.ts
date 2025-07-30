import mongoose from 'mongoose';

const CommentLectureSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const CommentLecture = mongoose.model('CommentLecture', CommentLectureSchema);

export default CommentLecture;
