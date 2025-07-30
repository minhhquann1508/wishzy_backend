import mongoose from 'mongoose';

const OrderDetailSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  coursePrice: {
    type: Number,
    required: true,
  },
});

const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);

export default OrderDetail;
