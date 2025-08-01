import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import User from '../models/user.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';
import uploadImage from '../helper/uploadFile';
import { CloudinaryUploadResult } from '../types/cloudinaryResponse';

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
