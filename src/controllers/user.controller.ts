import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';

import User from '../models/user.model';
import { CustomError } from '../errors/error';
import { Request, Response } from 'express';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../../types/request';

interface QueriesType {
  fullName?: { $regex: string; $options: string };
  email?: { $regex: string; $options: string };
  role?: string;
  isInstructorActive?: boolean;
}

export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = CONST.pageLimit } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const queries: QueriesType = {};

  if (req.query.fullName) {
    queries.fullName = { $regex: String(req.query.fullName), $options: 'i' };
  }

  if (req.query.email) {
    queries.email = { $regex: String(req.query.email), $options: 'i' };
  }

  if (req.query.role) {
    queries.role = String(req.query.role);
  }

  if (req.query.isInstructorActive) {
    queries.isInstructorActive = Boolean(req.query.isInstructorActive);
  }

  const [users, totalUsers] = await Promise.all([
    User.find(queries)
      .select('email fullName avatar role age')
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(queries),
  ]);

  res.status(http.OK).json({
    msg: 'Lấy danh sách thành công',
    users,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(Number(totalUsers) / Number(limit)),
      pageSizes: Number(limit),
      totalItems: Number(totalUsers),
    },
  });
});

export const getUserProfile = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    if (!user)
      throw new CustomError(http.BAD_REQUEST, 'Không thể truy cập thông tin');
    const userData = await User.findById(user.id).select(
      'email avatar fullName age phone role',
    );

    if (!userData)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy người dùng');

    res
      .status(http.OK)
      .json({ msg: 'Lấy thông tin người dùng thành công', user: userData });
  },
);

export const updateUserData = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { fullName, phone, age, password } = req.body;

    if (!fullName || !phone || !age || !password)
      throw new CustomError(
        http.BAD_REQUEST,
        'Vui lòng nhập đủ các trường bắt buộc',
      );

    if (!user)
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy thông tin đăng nhập',
      );

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        fullName,
        phone,
        age,
        password,
      },
      { new: true },
    );

    res.status(http.OK).json({ msg: 'Cập nhật thành công', user: updatedUser });
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
