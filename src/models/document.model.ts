import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    dataSource: {
      type: String,
      required: true,
    },
    description: String,
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Document = mongoose.model('Document', DocumentSchema);

export default Document;
