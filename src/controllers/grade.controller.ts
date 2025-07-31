import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Grade from '../models/grade.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';

interface Queries {
  gradeName?: { $regex: string; $options: 'i' };
  status?: boolean;
}

export const createNewGrade = asyncHandler(
  async (req: Request, res: Response) => {
    const { gradeName } = req.body;
    if (!gradeName)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng điền tên khối lớp');

    const grade = await Grade.create({ gradeName });
    res.status(http.CREATED).json({ msg: 'Tạo mới thành công', grade });
  },
);

export const getGradeBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const grade = await Grade.findOne({ slug });
    if (!grade)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khối lớp');

    res
      .status(http.OK)
      .json({ msg: 'Lấy chi tiết khối lớp thành công', grade });
  },
);

export const getAllGrades = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queries: Queries = {};

    if (req.query.gradeName) {
      queries.gradeName = {
        $regex: String(req.query.gradeName),
        $options: 'i',
      };
    }

    if (req.query.status) {
      queries.status = Boolean(req.query.status);
    }

    const [grades, totalGrades] = await Promise.all([
      Grade.find(queries).skip(skip).limit(Number(limit)),
      Grade.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách khối lớp thành công',
      grades,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(Number(totalGrades) / Number(limit)),
        pageSizes: Number(limit),
        totalItems: Number(totalGrades),
      },
    });
  },
);

export const updateGradeBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { gradeName } = req.body;

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    if (!gradeName)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy tên khối lớp');

    const grade = await Grade.findOne({ slug });
    if (!grade)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khối lớp');

    grade.gradeName = gradeName;
    await grade.save();

    res.status(http.OK).json({ msg: 'Cập nhật thành công', grade });
  },
);

export const deleteGradeBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const grade = await Grade.findOne({ slug });
    if (!grade)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khối lớp');

    grade.status = !grade.status;
    await grade.save();

    res.status(http.OK).json({ msg: 'Thay đổi trạng thái thành công', grade });
  },
);
