import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['zalopay', 'vnpay'],
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true },
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
