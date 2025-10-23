import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';
import Lecture from '../models/lecture.model';

export const createNewChapter = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { chapterName, courseSlug } = req.body;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!courseSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

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

// Lấy toàn bộ chapter và lecture của 1 khóa học
export const getAllChapterOfCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseSlug } = req.params;
    if (!courseSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const course = await Course.findOne({ slug: courseSlug });
    if (!course)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khóa học');

    const chapters = await Chapter.find({
      course: course._id,
      status: true,
    })
      .populate('course', 'courseName slug')
      .lean();

    const chaptersWithLectures = await Promise.all(
      chapters.map(async (chapter) => {
        const lectures = await Lecture.find({
          chapter: chapter._id,
          status: true,
        }).lean();
        return {
          ...chapter,
          lectures,
        };
      }),
    );

    res.status(http.OK).json({
      message: 'Lấy danh sách chương và bài giảng thành công',
      chapters: chaptersWithLectures,
    });
  },
);

export const updateChapterBySlug = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { chapterSlug } = req.params;
    const { chapterName } = req.body;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!chapterSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const chapter = await Chapter.findOne({ slug: chapterSlug }).populate(
      'course',
      'courseName createdBy',
    );
    if (!chapter)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy chương học');

    const course: any = chapter.course;
    if (!course.createdBy) {
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy thông tin người tạo khóa học',
      );
    }

    if (user.id !== course.createdBy.toString())
      throw new CustomError(
        http.BAD_REQUEST,
        'Bạn không có quyền chỉnh sửa khóa học này',
      );

    if (!chapterName)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy tên chương học');

    chapter.chapterName = chapterName;
    await chapter.save();

    res.status(http.OK).json({ msg: 'Cập nhật thành công', chapter });
  },
);

export const deleteChapterBySlug = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { chapterSlug } = req.params;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!chapterSlug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const chapter = await Chapter.findOne({ slug: chapterSlug }).populate(
      'course',
      'courseName createdBy',
    );
    if (!chapter)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy chương học');

    const course: any = chapter.course;
    if (!course.createdBy) {
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy thông tin người tạo khóa học',
      );
    }

    if (user.id !== course.createdBy.toString())
      throw new CustomError(
        http.BAD_REQUEST,
        'Bạn không có quyền chỉnh sửa khóa học này',
      );

    chapter.status = !chapter.status;
    await chapter.save();

    res.status(http.OK).json({ msg: 'Cập nhật thành công', chapter });
  },
);
