import http from 'http-status-codes';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import User from '../models/user.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';

// gửi lên yêu cầu
export const requestInstructor = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền đủ thông tin');

    const isUserExisting = await User.findOne({ email });
    if (isUserExisting)
      throw new CustomError(
        http.BAD_REQUEST,
        'Tài khoản này đã được đăng ký trước đó',
      );

    await User.create({
      email,
      password,
      fullName,
      role: 'instructor',
    });

    res.status(http.CREATED).json({
      msg: 'Bạn đã đăng ký tài khoản giảng viên thành công. Chúng tôi sẽ phản hồi qua email của bạn sau',
    });
  },
);

export const approveInstructor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, role: 'instructor' });

    if (!user)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy người dùng');

    user.isInstructorActive = true;
    await user.save();

    res.status(http.OK).json({ msg: 'Duyệt giảng viên thành công' });
  },
);

export const rejectInstructor = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: 'instructor' });
    if (!user) {
      throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');
    }

    user.isInstructorActive = false;
    await user.save();

    res.status(http.OK).json({ msg: 'Không chấp nhận làm giảng viên' });
  },
);

// Lấy danh sách người dùng yêu cầu
export const getInstructorRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      role: 'instructor',
      isInstructorActive: false,
    };

    const [requests, total] = await Promise.all([
      User.find(filter)
        .select('email fullName avatar role age')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách yêu cầu làm giảng viên thành công',
      users: requests,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        pageSizes: Number(limit),
        totalItems: total,
      },
    });
  },
);
