import mongoose from 'mongoose';
import slugify from 'slugify';

const RouteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    thumbnail: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: Boolean,
      default: false,
    },
    slug: String,
  },
  { timestamps: true },
);

RouteSchema.pre('save', async function () {
  if (!this.isModified('title')) return;
  this.slug = slugify(this.title, {
    replacement: '-',
    lower: true,
    strict: true,
  });
});

const Route = mongoose.model('Route', RouteSchema);

export default Route;
