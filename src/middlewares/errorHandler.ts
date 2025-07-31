import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../errors/error';
import http from 'http-status-codes';

export interface AppError extends Error {
  status?: number;
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
  } else if (err) {
  } else {
    console.error(err);
    res.status(http.INTERNAL_SERVER_ERROR).json({
      msg: err || 'Lỗi phía server',
    });
  }
};
