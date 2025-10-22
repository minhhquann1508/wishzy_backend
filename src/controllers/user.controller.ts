import http from 'http-status-codes';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import User from '../models/user.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';

interface QueriesType {
  fullName?: { $regex: string; $options: string };
  email?: { $regex: string; $options: string };
  role?: string | string[];
  isInstructorActive?: boolean;
  verified?: boolean;
}

export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = CONST.pageLimit } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

const queries: QueriesType = {role: ['admin', 'manager', 'marketing', 'staff', 'content'] };

  if (req.query.fullName) {
    queries.fullName = { $regex: String(req.query.fullName), $options: 'i' };
  }

  if (req.query.email) {
    queries.email = { $regex: String(req.query.email), $options: 'i' };
  }

  const [users, totalUsers] = await Promise.all([
    User.find(queries)
      .select('email fullName avatar role age createdAt')
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

// lấy người dùng theo id quản lí
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');
    res.status(http.OK).json({ msg: 'Lấy người dùng thành công', user });
  }catch (err) {
    if (err instanceof Error && (err as any).name === 'CastError') {
      throw new CustomError(http.BAD_REQUEST, 'ID người dùng không hợp lệ');
    }
    throw err;
  }
});


// lấy sinh học sinh

export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = CONST.pageLimit } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const queries: QueriesType = { role: 'user' };

  if (req.query.fullName) {
    queries.fullName = { $regex: String(req.query.fullName), $options: 'i' };
  }

  if (req.query.email) {
    queries.email = { $regex: String(req.query.email), $options: 'i' };
  }

  if (req.query.verified) {
    queries.verified = Boolean(req.query.verified);
  }
  const [students, totalStudents] = await Promise.all([
    User.find(queries)
      .select('email fullName avatar age createdAt')
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(Number(limit)),

    User.countDocuments(queries),
  ]);

  res.status(http.OK).json({
    msg: 'Lấy danh sách học sinh thành công',
    students,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(Number(totalStudents) / Number(limit)),
      pageSizes: Number(limit),
      totalItems: Number(totalStudents),
    },
  });
});

export const getUserProfile = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    if (!user)
      throw new CustomError(http.BAD_REQUEST, 'Không thể truy cập thông tin');
    const userData = await User.findById(user.id).select('-password');

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
    const { fullName, phone, dob, gender } = req.body;

    if (!fullName )
      throw new CustomError(
        http.BAD_REQUEST,
        'Vui lòng nhập đầy đủ họ và tên người dùng',
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
        dob,
        gender,
      },
      { new: true },
    );

    res.status(http.OK).json({ msg: 'Cập nhật thành công', user: updatedUser });
  },
);

// ================== TẠO USER ==================
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, fullName, password, dob, phone, role, address, gender  } = req.body;

  if (!email || !fullName || !password || !dob || !phone || !role || !address || !gender) {
    throw new CustomError(http.BAD_REQUEST, 'Vui lòng nhập đầy đủ thông tin bắt buộc');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError(http.BAD_REQUEST, 'Email đã tồn tại');
  }

  const user = await User.create({
    email,
    fullName,
    password,
    dob,
    phone,
    role,
    address,
    gender,
    verified: true,
  });

  res.status(http.CREATED).json({
    msg: 'Tạo người dùng thành công',
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

// ================== CẬP NHẬT USER ==================
export const updateUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, phone, role, address, gender, dob, password } = req.body;

  const user = await User.findById(id);
  if (!user) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');

  user.fullName = fullName || user.fullName;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  user.address = address || user.address; 
  user.gender = gender || user.gender;
  user.dob = dob || user.dob;
  if (password) user.password = password;

  await user.save();

  res.status(http.OK).json({ msg: 'Cập nhật thành công', user });
});

// ================== XÓA USER ==================
export const deleteUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');

  await user.deleteOne();

  res.status(http.OK).json({ msg: 'Xóa người dùng thành công' });
});
