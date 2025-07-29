import mongoose from 'mongoose';
import slugify from 'slugify';

const PostCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
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

PostCategorySchema.pre('save', async function () {
  if (!this.isModified('categoryName')) return;
  this.categoryName = slugify(this.categoryName, {
    replacement: '-',
    lower: true,
  });
});

const PostCategory = mongoose.model('PostCategory', PostCategorySchema);

export default PostCategory;
