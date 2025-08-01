import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import User from '../models/user.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';
import uploadImage from '../helper/uploadFile';
import { CloudinaryUploadResult } from '../types/cloudinaryResponse';
import Course from '../models/course.model';

export const uploadImageUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file)
      throw new CustomError(http.BAD_REQUEST, 'Không có file được tải lên');

    const result = (await uploadImage(file.buffer)) as CloudinaryUploadResult;
    if (!result)
      throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');

    res.json({ message: 'Upload avatar thành công', url: result.secure_url });
  },
);

export const uploadAvatar = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const userData = await User.findById(user.id).select(
      '-password -isInstructorActive -loginType',
    );
    if (!userData)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy người dùng');

    const file = req.file;

    if (!file)
      throw new CustomError(http.BAD_REQUEST, 'Không có file được tải lên');

    const result = (await uploadImage(file.buffer)) as CloudinaryUploadResult;
    if (!result)
      throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');

    userData.avatar = result.secure_url;
    await userData.save();

    res.json({ message: 'Upload avatar thành công', user: userData });
  },
);

export const uploadCourseThumbnail = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { slug } = req.params;
    const { user } = req;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const file = req.file;
    if (!file) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy file');

    const course = await Course.findOne({ slug, createdBy: user.id });
    if (!course)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khóa học');

    const result = (await uploadImage(file.buffer)) as CloudinaryUploadResult;
    if (!result)
      throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');

    course.thumbnail = result.secure_url;
    await course.save();

    res.json({ message: 'Upload avatar thành công', course });
  },
);
