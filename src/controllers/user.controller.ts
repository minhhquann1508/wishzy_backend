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
// ======================= REQUEST 
// gửi lên yêu cầu
export const requestInstructor = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    if (!user?.id) {
      throw new CustomError(http.UNAUTHORIZED, 'Không có thông tin người dùng');
    }

    const foundUser = await User.findById(user.id);
    if (!foundUser) {
      throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');
    }

    if (foundUser.role === 'instructor') {
      throw new CustomError(http.BAD_REQUEST, 'Bạn đã là giảng viên');
    }

    if (foundUser.isInstructorActive) {
      throw new CustomError(http.BAD_REQUEST, 'Yêu cầu của bạn đang chờ xét duyệt');
    }

    foundUser.isInstructorActive = true;
    await foundUser.save();

    res.status(http.OK).json({
      msg: 'Yêu cầu làm giảng viên đã được gửi thành công',
    });
  }
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

    const user = await User.findById(id);
    if (!user) {
      throw new CustomError(http.NOT_FOUND, 'Không tìm thấy người dùng');
    }

    if (!user.isInstructorActive) {
      throw new CustomError(
        http.BAD_REQUEST,
        'Người dùng này chưa gửi yêu cầu làm giảng viên hoặc đã bị từ chối trước đó'
      );
    }

    user.isInstructorActive = false;
    await user.save();

    res.status(http.OK).json({ msg: 'Yêu cầu làm giảng viên đã bị từ chối' });
  }
);

// Lấy danh sách người dùng yêu cầu
export const getInstructorRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      role: 'user',
      isInstructorActive: true,
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
  }
);
// người dùng đổi mật khẩu

// ======== Thống Kê người dùng và yêu cầu 
export const getUserStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { fromDate, toDate } = req.query;

    // Thời gian lọc cho thằng Quốc với ỐC ghiền tự tính :))))
    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) {
        dateFilter.createdAt.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        dateFilter.createdAt.$lte = new Date(toDate as string);
      }
    }

    const [totalUsers, totalInstructors, totalPendingRequests, usersCreatedInRange] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'user', isInstructorActive: true }),
      User.countDocuments({ ...dateFilter }),
    ]);

    const totalNormalUsers = totalUsers - totalInstructors;

    res.status(http.OK).json({
      msg: 'Thống kê người dùng thành công',
      stats: {
        totalUsers,
        totalInstructors,
        totalNormalUsers,
        totalPendingRequests,
        usersCreatedInRange,
      },
    });
  }
);

