import mongoose from 'mongoose';
import slugify from 'slugify';

const LectureSchema = new mongoose.Schema(
  {
    lectureName: {
      type: String,
      required: true,
    },
    videoUrl: String,
    description: String,
    duration: {
      type: Number,
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    slug: String,
  },
  { timestamps: true },
);

LectureSchema.pre('save', async function () {
  if (!this.isModified('lectureName')) return;
  this.slug = slugify(this.lectureName, {
    replacement: '-',
    lower: true,
    strict: true,
  });
});

const Lecture = mongoose.model('Lecture', LectureSchema);

export default Lecture;
