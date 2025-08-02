import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import http from 'http-status-codes';

import Banner from '../models/banner.model';
import Course from '../models/course.model';
import { CustomError } from '../errors/error';
import { CustomRequest } from '../types/request';

// Tạo banner mới
export const createBanner = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { imageUrl, title, description, course, courseSlug, position } = req.body;
  const createdBy = req.user?.id;

  if (!imageUrl) {
    throw new CustomError(http.BAD_REQUEST, 'Vui lòng cung cấp đường dẫn ảnh');
  }

  let finalCourseSlug = courseSlug;

  if (course) {
    const foundCourse = await Course.findById(course);
    if (!foundCourse) {
      throw new CustomError(http.NOT_FOUND, 'Không tìm thấy khóa học');
    }
    if (!finalCourseSlug) {
      finalCourseSlug = `/course/${foundCourse.slug}`;
    }
  }

  const banner = await Banner.create({
    imageUrl,
    title,
    description,
    course: course || null,
    courseSlug: finalCourseSlug || null,
    createdBy,
    position,
  });

  res.status(http.CREATED).json({
    msg: 'Tạo banner thành công',
    banner,
  });
});

// Lấy tất cả banner
export const getAllBanners = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await Banner.find()
    .populate('course', 'courseName slug')
    .sort({ position: 1, createdAt: -1 });

  res.status(http.OK).json({
    msg: 'Lấy danh sách tất cả banner thành công',
    banners,
  });
});

// Lấy các banner chỉ gắn với khóa học
export const getCourseBannersOnly = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await Banner.find({ course: { $ne: null } }) // chỉ lấy nếu course tồn tại
    .populate('course', 'courseName slug')
    .sort({ position: 1, createdAt: -1 });

  res.status(http.OK).json({
    msg: 'Lấy danh sách banner có gắn khoá học thành công',
    banners,
  });
});


// Lấy chi tiết banner
export const getBannerDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const banner = await Banner.findById(id).populate('course', 'courseName slug');
  if (!banner) {
    throw new CustomError(http.NOT_FOUND, 'Không tìm thấy banner');
  }

  res.status(http.OK).json({ banner });
});

// Cập nhật banner
export const updateBanner = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const { imageUrl, title, description, course, courseSlug, position } = req.body;

  const banner = await Banner.findById(id);
  if (!banner) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy banner');

  if (imageUrl !== undefined) banner.imageUrl = imageUrl;
  if (title !== undefined) banner.title = title;
  if (description !== undefined) banner.description = description;
  if (position !== undefined) banner.position = position;

  if (course !== undefined) {
    const foundCourse = await Course.findById(course);
    if (!foundCourse) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy khóa học');
    banner.course = foundCourse._id;

    // nếu courseSlug không được truyền thì lấy từ khóa học
    if (!courseSlug) {
      banner.courseSlug = `/course/${foundCourse.slug}`;
    }
  }

  if (courseSlug !== undefined) banner.courseSlug = courseSlug;

  await banner.save();

  res.status(http.OK).json({
    msg: 'Cập nhật banner thành công',
    banner,
  });
});

// Xóa banner
export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);
  if (!banner) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy banner');

  await banner.deleteOne();

  res.status(http.OK).json({
    msg: 'Xóa banner thành công',
  });
});
