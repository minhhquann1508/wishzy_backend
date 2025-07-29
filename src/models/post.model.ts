import mongoose from 'mongoose';
import slugify from 'slugify';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: String,
    content: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostCategory',
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Để SEO
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slug: String,
  },
  { timestamps: true },
);

PostSchema.pre('save', async function () {
  if (!this.isModified('title')) return;
  this.title = slugify(this.title, {
    replacement: '-',
    lower: true,
  });
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
