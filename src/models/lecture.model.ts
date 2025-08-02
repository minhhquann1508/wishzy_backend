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

  const baseSlug = slugify(this.lectureName, {
    replacement: '-',
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  while (
    await Lecture.exists({
      slug,
      _id: { $ne: this._id },
      chapter: this.chapter,
    })
  ) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  this.slug = slug;
});

const Lecture = mongoose.model('Lecture', LectureSchema);

export default Lecture;
