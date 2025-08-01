import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../errors/error';
import http from 'http-status-codes';

export interface AppError extends Error {
  status?: number;
  code?: number;
  keyValue: {
    [key: string]: string;
  };
}

export const notFound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => res.status(http.NOT_FOUND).json({ msg: 'Không tìm thấy đường dẫn' });

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    res.status(Number(err.statusCode)).json({ msg: err.message });
  } else if (err.code === 11000) {
    const duplicatedField = Object.entries(err.keyValue)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    res.status(http.BAD_REQUEST).json({
      msg: `Giá trị đã tồn tại: (${duplicatedField})`,
    });
  } else {
    console.error(err);
    res.status(http.INTERNAL_SERVER_ERROR).json({
      msg: err.message || 'Lỗi phía server',
    });
  }
};
