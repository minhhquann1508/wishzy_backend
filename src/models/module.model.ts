import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  order: Number,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
});

const Module = mongoose.model('Module', ModuleSchema);

export default Module;
