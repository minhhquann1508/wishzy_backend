import mongoose from 'mongoose';
import slugify from 'slugify';

const GradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    slug: String,
  },
  { timestamps: true },
);

GradeSchema.pre('save', async function () {
  if (!this.isModified('gradeName')) return;
  this.slug = slugify(this.gradeName, {
    replacement: '-',
    lower: true,
    strict: true,
  });
});

const Grade = mongoose.model('Grade', GradeSchema);

export default Grade;
