import { NextFunction, Response } from 'express';
import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../../types/request';
import { CustomError } from '../errors/error';

export const checkPermission = (...roles: string[]) => {
  return asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const { user } = req;
      if (!roles.includes(user?.role as string))
        throw new CustomError(http.FORBIDDEN, 'Bạn không được phép truy cập');

      next();
    },
  );
};
