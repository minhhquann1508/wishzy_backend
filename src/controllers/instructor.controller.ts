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
  role?: string;
  isInstructorActive?: boolean;
  verified?: boolean;
}

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

// duyệt yêu cầu
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

// không chấp nhận
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

    const queries: QueriesType = {
      role: 'instructor',
      isInstructorActive: false,
      verified: true,
    };

    if (req.query.fullName) {
      queries.fullName = { $regex: String(req.query.fullName), $options: 'i' };
    }

    if (req.query.email) {
      queries.email = { $regex: String(req.query.email), $options: 'i' };
    }

    const [requests, total] = await Promise.all([
      User.find(queries)
        .select('email fullName avatar role dob requestedAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(queries),
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

// Lấy danh sách người dùng giảng viên
export const getAllInstructors = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queries: QueriesType = { role: 'instructor' };

    if (req.query.fullName) {
      queries.fullName = { $regex: String(req.query.fullName), $options: 'i' };
    }

    if (req.query.email) {
      queries.email = { $regex: String(req.query.email), $options: 'i' };
    }

    if (req.query.isInstructorActive) {
      queries.isInstructorActive = Boolean(req.query.isInstructorActive);
    }

    const [instructors, totalInstructors] = await Promise.all([
      User.find(queries)
        .select('email fullName avatar role dob createdAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách giảng viên',
      instructors,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalInstructors / Number(limit)),
        pageSizes: Number(limit),
        totalItems: Number(totalInstructors),
      },
    });
  },
);

// Lấy chi tiết người dùng giảng viên
export const getInstructorDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, role: 'instructor' });
    if (!user) {
      throw new CustomError(http.NOT_FOUND, 'Không tìm thấy giảng viên');
    }
    res.status(http.OK).json({ instructor: user });
  }
);

// Hủy yêu cầu làm giảng viên
export const cancelInstructorRequest = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'instructor' || user.isInstructorActive) {
      throw new CustomError(http.BAD_REQUEST, 'Không thể huỷ yêu cầu');
    }
    user.role = 'user';
    user.isInstructorActive = false;
    await user.save();
    res.status(http.OK).json({ msg: 'Đã huỷ yêu cầu làm giảng viên' });
  }
);
