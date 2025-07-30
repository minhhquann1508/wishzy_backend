import mongoose from 'mongoose';
import slugify from 'slugify';
import http from 'http-status-codes';

import { CustomError } from '../errors/error';

const SaleSchema = new mongoose.Schema(
  {
    saleType: {
      type: String,
      enum: ['percent', 'fixed'],
    },
    value: {
      type: Number,
      min: 0,
    },
    saleStartDate: {
      type: Date,
      default: null,
    },
    saleEndDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const CourseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    thumbnail: String,
    price: {
      type: Number,
      required: true,
    },
    sale: SaleSchema,
    status: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    requirements: [String],
    totalDuration: {
      type: Number,
      default: 0,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
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

CourseSchema.pre('save', async function () {
  if (this.isModified('courseName')) {
    this.slug = slugify(this.courseName, {
      replacement: '-',
      lower: true,
      strict: true,
    });
  }

  if (
    this.sale &&
    this.sale.saleType === 'percent' &&
    typeof this.sale.value === 'number' &&
    this.sale.value > 50
  ) {
    throw new CustomError(http.BAD_REQUEST, 'Giá không được vượt quá 50%');
  }
});

const Course = mongoose.model('Course', CourseSchema);

export default Course;
