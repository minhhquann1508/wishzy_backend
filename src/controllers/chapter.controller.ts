import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';

export const createNewChapter = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { courseSlug } = req.params;
    const { chapterName } = req.body;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!courseSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khóa học');

    const course = await Course.findOne({
      slug: courseSlug,
      createdBy: user.id,
    });
    if (!course)
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy khóa học phù hợp',
      );

    if (!chapterName || !course._id)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền đủ thông tin');

    const chapter = await Chapter.create({ chapterName, course: course._id });

    res
      .status(http.CREATED)
      .json({ msg: 'Tạo chương học mới thành công', chapter });
  },
);
