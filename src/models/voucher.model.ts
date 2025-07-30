import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['percent', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Voucher = mongoose.model('Voucher', VoucherSchema);

export default Voucher;
