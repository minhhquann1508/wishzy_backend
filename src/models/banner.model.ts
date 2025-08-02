import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true, // URL ảnh là bắt buộc
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false, // KHÔNG bắt buộc
    },
    courseSlug: {
      type: String,
      trim: true, // Cho phép nhập slug/link tuỳ ý
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    position: {
      type: Number, //sắp xếp vị trí
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Banner = mongoose.model('Banner', BannerSchema);
export default Banner;
