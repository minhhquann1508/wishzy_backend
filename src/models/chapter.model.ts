import mongoose from 'mongoose';
import slugify from 'slugify';

const ChapterSchema = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
    },
    totalLesson: {
      type: Number,
      default: 0,
      min: 0,
    },
    chapterDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    slug: String,
  },
  { timestamps: true },
);

ChapterSchema.pre('save', async function () {
  if (!this.isModified('chapterName')) return;
  this.slug = slugify(this.chapterName, {
    replacement: '-',
    lower: true,
    strict: true,
  });
});

const Chapter = mongoose.model('Chapter', ChapterSchema);

export default Chapter;
