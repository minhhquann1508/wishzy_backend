import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import http from 'http-status-codes';
import crypto from 'crypto';

import { CustomError } from '../errors/error';
import { comparePassword } from '../utils/helper';
import { generateAccessToken, generateRefreshToken } from '../utils/token';

import User from '../models/user.model';
import { sendEmail } from '../utils/sendEmail';
import { verifyRefreshToken } from '../middlewares/verifyToken';

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

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  });

  res.status(http.NO_CONTENT).json({ msg: 'Đăng xuất thành công' });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      throw new CustomError(http.UNAUTHORIZED, 'Hết phiên đăng nhập');

    const isTokenValid = await verifyRefreshToken(refreshToken);
    if (!isTokenValid)
      throw new CustomError(http.UNAUTHORIZED, 'Hết phiên đăng nhập');

    const accessToken = generateAccessToken(isTokenValid);

    res.status(http.OK).json({ msg: 'Lấy token mới thành công', accessToken });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy email');

    const user = await User.findOne({ email });
    if (!user)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy tài khoản');

    const resetPasswordExp = new Date(Date.now() + 15 * 60 * 1000); // Thời hạn 15p

    user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordExp = resetPasswordExp;
    await user.save();

    const resetLink = '';
    const html = `<a href="${resetLink}">Cập nhật lại mật khẩu</a>`;

    const isSendEmail = await sendEmail(user.email, 'Cập nhật mật khẩu', html);
    if (!isSendEmail)
      throw new CustomError(http.BAD_REQUEST, 'Gửi mail không thành công');

    res.status(http.OK).json({ msg: 'Email lấy lại mật khẩu đã được gửi.' });
  },
);

