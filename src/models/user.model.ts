import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dob: Date,
    gender: String,
    verified: {
      type: Boolean,
      default: false,
    },
    address: String,
    password: String,
    avatar: String,
    age: Number,
    phone: String,
    loginType: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'instructor', 'staff' , 'manager', 'marketing', 'content'],
      default: 'user',
    },
    isInstructorActive: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExp: Date,
  },
  { timestamps: true },
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

const User = mongoose.model('User', UserSchema);

export default User;
