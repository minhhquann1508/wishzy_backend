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
  if (this.isModified('chapterName')) {
    const baseSlug = slugify(this.chapterName, {
      replacement: '-',
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let count = 1;

    while (
      await Chapter.exists({
        slug,
        _id: { $ne: this._id },
        course: this.course,
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }
});

const Chapter = mongoose.model('Chapter', ChapterSchema);

export default Chapter;
