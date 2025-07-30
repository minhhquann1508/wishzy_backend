import mongoose from 'mongoose';
import slugify from 'slugify';

const SubjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    slug: String,
  },
  { timestamps: true },
);

SubjectSchema.pre('save', async function () {
  if (!this.isModified('subjectName')) return;
  this.slug = slugify(this.subjectName, {
    replacement: '-',
    lower: true,
    strict: true,
  });
});

const Subject = mongoose.model('Subject', SubjectSchema);

export default Subject;
