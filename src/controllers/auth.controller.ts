import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import http from 'http-status-codes';

import { CustomError } from '../errors/error';
import { comparePassword } from '../utils/helper';
import { generateAccessToken, generateRefreshToken } from '../utils/token';

import User from '../models/user.model';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    throw new CustomError(http.BAD_REQUEST, 'Thiếu dữ liệu nạp vào');

  const isUserExisting = await User.findOne({ email });
  if (isUserExisting)
    throw new CustomError(http.BAD_REQUEST, 'Tài khoản này đã tồn tại');

  await User.create({ fullName, email, password });

  res.status(http.CREATED).json({ msg: 'Đăng ký thành công' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new CustomError(http.BAD_REQUEST, 'Vui lòng nhập email lẫn mật khẩu');

  const user = await User.findOne({ email }).lean();
  if (!user) throw new CustomError(http.BAD_REQUEST, 'Tài khoản không tồn tại');

  const isPasswordCorrect = comparePassword(password, user.password as string);
  if (!isPasswordCorrect)
    throw new CustomError(
      http.BAD_REQUEST,
      'Thông tin đăng nhập không chính xác',
    );

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    role: user.role,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(http.OK).json({
    msg: 'Đăng nhập thành công',
    accessToken,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      age: user.age,
    },
  });
});
