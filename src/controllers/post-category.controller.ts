import http from 'http-status-codes';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { CONST } from '../utils/constant';
import { CustomError } from '../errors/error';
import { CustomRequest } from '../types/request';
import PostCategory from '../models/post-category.model';

interface Queries {
  categoryName?: { $regex: string; $options: 'i' };
  status?: boolean;
  createdBy?: string;
}

export const createNewPostCategory = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { categoryName } = req.body;

    if (!categoryName)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng nhập tên danh mục');

    if (!user)
      throw new CustomError(
        http.UNAUTHORIZED,
        'Không tìm thấy dữ liệu người dùng',
      );

    const postCategory = await PostCategory.create({
      categoryName,
      createdBy: user,
    });

    res.status(http.CREATED).json({ msg: 'Tạo mới thành công', postCategory });
  },
);

export const getDetailPostCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const postCategory = await PostCategory.findOne({
      slug,
      status: true,
    }).populate('createdBy', 'fullName');
    if (!postCategory)
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy danh mục bài viết',
      );

    res
      .status(http.OK)
      .json({ msg: 'Lấy danh mục bài viết thành công', postCategory });
  },
);

export const getAllPostCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const queries: Queries = {};

    if (req.query.categoryName) {
      queries.categoryName = {
        $regex: String(req.query.categoryName),
        $options: 'i',
      };
    }

    if (req.query.status) {
      queries.status = Boolean(req.query.status);
    }

    if (req.query.createdBy) {
      queries.createdBy = String(req.query.createdBy);
    }

    const [postCategories, totalCategories] = await Promise.all([
      PostCategory.find(queries)
        .populate('createdBy', 'fullName')
        .skip(skip)
        .limit(Number(limit)),
      PostCategory.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách danh mục bài viết thành công',
      postCategories,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(Number(totalCategories) / Number(limit)),
        pageSizes: Number(limit),
        totalItems: Number(totalCategories),
      },
    });
  },
);

export const updatePostCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { categoryName } = req.body;
    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    if (!categoryName)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng nhập dữ liệu');

    const postCategory = await PostCategory.findOne({ slug });
    if (!postCategory)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy dữ liệu');

    postCategory.categoryName = categoryName;
    await postCategory.save();

    res.status(http.OK).json({ msg: 'Cập nhật thành công', postCategory });
  },
);

export const deletePostCategory = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { slug } = req.params;

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const postCategory = await PostCategory.findOne({ slug });
    if (!postCategory)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy danh mục');

    postCategory.status = !postCategory.status;
    await postCategory.save();

    const updatedPostCategory = await PostCategory.findOne({ slug });

    res
      .status(http.OK)
      .json({ msg: 'Ẩn thành công', postCategory: updatedPostCategory });
  },
);
