import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
  },
  remindAt: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
    default: 'Bạn có khóa học chưa hoàn thành',
  },
  isSent: {
    type: Boolean,
    default: false,
  },
});

const Reminder = mongoose.model('Reminder', ReminderSchema);

export default Reminder;
