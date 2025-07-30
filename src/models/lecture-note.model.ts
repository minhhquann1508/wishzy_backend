import mongoose from 'mongoose';

const LectureNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
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
  },
  { timestamps: true },
);

const LectureNote = mongoose.model('LectureNote', LectureNoteSchema);

export default LectureNote;
