import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import http from 'http-status-codes';

import Feedback from '../models/feedback.model';
import OrderDetail from '../models/order-detail.model';
import Course from '../models/course.model';
import { CustomRequest } from '../types/request';
import { CustomError } from '../errors/error';

// Gửi feedback theo courseId
export const sendFeedback = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { courseId, content, rating } = req.body;
  const userId = req.user?.id;

  if (!courseId || !content || rating == null) {
    throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền đủ nội dung và số sao đánh giá');
  }

  const course = await Course.findById(courseId);
  if (!course) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy khóa học');

  const purchased = await OrderDetail.findOne({ course: courseId }).populate({
    path: 'order',
    match: { user: userId, status: 'completed' },
  });

  if (!purchased || !purchased.order) {
    throw new CustomError(http.FORBIDDEN, 'Bạn cần mua khóa học trước khi đánh giá');
  }

  const existed = await Feedback.findOne({ user: userId, course: courseId });
  if (existed) {
    throw new CustomError(http.BAD_REQUEST, 'Bạn đã đánh giá khóa học này rồi');
  }

  const feedback = await Feedback.create({
    user: userId,
    course: courseId,
    content,
    rating,
  });

  // Tính điểm trung bình bằng aggregation
  const result = await Feedback.aggregate([
    { $match: { course: course._id } },
    { $group: { _id: '$course', averageRating: { $avg: '$rating' } } },
  ]);

  const avgRating = result[0]?.averageRating || 0;
  course.rating = avgRating;
  await course.save();

  res.status(http.CREATED).json({
    msg: 'Gửi đánh giá thành công',
    feedback,
    averageRating: avgRating.toFixed(2),
  });
});

// Lấy feedback theo courseId (public + lọc)
export const getFeedbacksByCourseId = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { rating, user } = req.query;

  const course = await Course.findById(courseId);
  if (!course) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy khóa học');

  const filter: any = { course: courseId };
  if (rating) filter.rating = Number(rating);
  if (user) filter.user = user;

  const feedbacks = await Feedback.find(filter)
    .populate('user', 'fullName avatar')
    .sort({ createdAt: -1 });

  const result = await Feedback.aggregate([
    { $match: { course: course._id } },
    { $group: { _id: '$course', averageRating: { $avg: '$rating' } } },
  ]);

  const avgRating = result[0]?.averageRating || 0;

  res.status(http.OK).json({
    msg: 'Lấy feedback thành công',
    feedbacks,
    averageRating: avgRating.toFixed(2),
  });
});

// Admin lấy tất cả feedback (phân trang + lọc)
export const getAllFeedbacks = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, rating, course, user } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query: any = {};
  if (rating) query.rating = Number(rating);
  if (course) query.course = course;
  if (user) query.user = user;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(query)
      .populate('user', 'fullName email')
      .populate('course', 'courseName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Feedback.countDocuments(query),
  ]);

  res.status(http.OK).json({
    msg: 'Lấy tất cả feedback thành công',
    feedbacks,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
    },
  });
});

// Lấy chi tiết feedback
export const getFeedbackDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id)
    .populate('user', 'fullName avatar')
    .populate('course', 'courseName');

  if (!feedback) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy feedback');

  res.status(http.OK).json({ feedback });
});

// Xóa feedback
export const deleteFeedback = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy feedback');

  if (feedback.user.toString() !== req.user?.id.toString()) {
    throw new CustomError(http.FORBIDDEN, 'Bạn không có quyền xóa feedback này');
  }

  await feedback.deleteOne();
  res.status(http.OK).json({ msg: 'Xóa feedback thành công' });
});

// Người dùng lấy feedback của mình
export const getMyFeedbacks = asyncHandler(async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  const feedbacks = await Feedback.find({ user: userId })
    .populate('course', 'courseName slug')
    .sort({ createdAt: -1 });

  res.status(http.OK).json({
    msg: 'Lấy danh sách feedback của bạn thành công',
    feedbacks,
  });
});
