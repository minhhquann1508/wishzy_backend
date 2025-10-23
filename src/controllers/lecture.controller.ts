import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Lecture from '../models/lecture.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';

export const createNewLecture = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { chapterSlug, lectureName } = req.body;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!chapterSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khóa học');

    const chapter = await Chapter.findOne({ slug: chapterSlug });

    if (!chapter)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy chương học');

    if (!lectureName)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền tên bài học');

    const lecture = await Lecture.create({
      ...req.body,
      lectureName,
      chapter: chapter._id,
    });

    res
      .status(http.CREATED)
      .json({ msg: 'Tạo bài học mới thành công', lecture });
  },
);
