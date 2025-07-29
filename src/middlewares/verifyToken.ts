import { NextFunction, Response } from 'express';
import http from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { CustomRequest, PayloadData } from '../types/request';
import { CustomError } from '../errors/error';
import asyncHandler from 'express-async-handler';
import config from '../configs/config';

export const verifyToken = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const decode = jwt.verify(token, config.jwtSecret);
    if (!decode) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');
    req.user = decode as PayloadData;
    next();
  },
);

export const verifyRefreshToken = async (token: string) => {
  try {
    jwt.verify(token, config.jwtSecret, (err, decode) => {
      if (err) return null;
      return decode as PayloadData;
    });
  } catch (error) {
    return null;
  }
};
