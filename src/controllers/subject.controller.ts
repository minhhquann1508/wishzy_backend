import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Subject from '../models/subject.model';
import Grade from '../models/grade.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';

interface Queries {
  subjectName?: { $regex: string; $options: 'i' };
  status?: boolean;
  grade?: string;
}

export const createNewSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const { subjectName, grade } = req.body;

    if (!subjectName || !grade)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền đủ thông tin');

    const gradeData = await Grade.findOne({ _id: grade, status: true }).select('gradeName');

    const subject = await Subject.create({
      subjectName: `${subjectName} - ${gradeData?.gradeName}`,
      grade,
    });
    res.status(http.CREATED).json({ msg: 'Tạo môn học thành công', subject });
  },
);

export const getDetailSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const subject = await Subject.findOne({ slug }).populate(
      'grade',
      'gradeName slug',
    );
    if (!subject)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy môn học');

    res
      .status(http.OK)
      .json({ msg: 'Lấy chi tiết môn học thành công', subject });
  },
);

export const getAllSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queries: Queries = {};

    if (req.query.subjectName) {
      queries.subjectName = {
        $regex: String(req.query.subjectName),
        $options: 'i',
      };
    }

    if (req.query.status) {
      queries.status = Boolean(req.query.status);
    }

    if (req.query.grade) {
      queries.grade = String(req.query.grade);
    }

    const [subjects, totalSubjects] = await Promise.all([
      Subject.find(queries)
        .populate('grade', 'gradeName slug')
        .skip(skip)
        .limit(Number(limit)),
      Subject.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách danh mục bài viết thành công',
      subjects,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(Number(totalSubjects) / Number(limit)),
        pageSizes: Number(limit),
        totalItems: Number(totalSubjects),
      },
    });
  },
);

export const updateSubjectBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { subjectName, grade } = req.body;

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    if (!subjectName || !grade)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền đủ thông tin');

    const gradeData = await Grade.findById(grade).select('gradeName');

    const subject = await Subject.findOne({ slug });
    if (!subject)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy môn học');

    subject.subjectName = `${subjectName} - ${gradeData?.gradeName}`;
    subject.grade = grade;
    await subject.save();

    res.status(http.OK).json({ msg: 'Cập nhật thành công', subject });
  },
);

export const deleteSubjectBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const subject = await Subject.findOne({ slug });
    if (!subject)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy môn học');

    subject.status = !subject.status;
    await subject.save();

    res.status(http.OK).json({ msg: 'Đổi trạng thái thành công', subject });
  },
);
