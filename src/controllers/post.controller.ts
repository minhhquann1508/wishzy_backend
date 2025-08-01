import http from 'http-status-codes';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import Post from '../models/post.model';
import PostCategory from '../models/post-category.model';
import { CONST } from '../utils/constant';
import { CustomError } from '../errors/error';
import { CustomRequest } from '../types/request';

interface Queries {
  title?: { $regex: string; $options: 'i' };
  category?: string;
  status?: boolean;
  isFeatured?: boolean;
  createdBy?: string;
}

export const createNewPost = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { title, content, category } = req.body;

    if (!title || !content || !category)
      throw new CustomError(http.BAD_REQUEST, 'Vui lòng nhập đủ thông tin');

    if (!user)
      throw new CustomError(http.UNAUTHORIZED, 'Không tìm thấy người dùng');

    const post = await Post.create({
      ...req.body,
      title,
      content,
      category,
      createdBy: user.id,
    });

    res.status(http.CREATED).json({ msg: 'Tạo bài viết thành công', post });
  },
);

export const getDetailPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug bài viết');

    const allowedCategoryDocs = await PostCategory.find({
      status: false,
    }).select('_id');
    const allowedCategoryIds = allowedCategoryDocs.map((cat) => cat._id);

    const post = await Post.findOne({
      slug,
      status: true,
      category: { $in: allowedCategoryIds },
    });

    if (!post)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy bài viết');

    res.status(http.OK).json({ msg: 'Lấy bài viết thành công', post });
  },
);

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = CONST.pageLimit } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const queries: Queries = {};

  if (req.query.title) {
    queries.title = { $regex: String(req.query.title), $options: 'i' };
  }

  if (req.query.category) {
    queries.category = String(req.query.category);
  }

  if (req.query.status) {
    queries.status = Boolean(req.query.status);
  }

  if (req.query.isFeatured) {
    queries.isFeatured = Boolean(req.query.isFeatured);
  }

  const [posts, totalPosts] = await Promise.all([
    Post.find(queries)
      .populate('createdBy', 'fullName')
      .populate('category', 'categoryName')
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(queries),
  ]);

  res.status(http.OK).json({
    msg: 'Lấy danh sách danh mục bài viết thành công',
    posts,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(Number(totalPosts) / Number(limit)),
      pageSizes: Number(limit),
      totalItems: Number(totalPosts),
    },
  });
});

export const getMyPosts = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { page = 1, limit = CONST.pageLimit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const { user } = req;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const queries: Queries = {
      createdBy: user.id,
    };

    if (req.query.title) {
      queries.title = { $regex: String(req.query.title), $options: 'i' };
    }

    if (req.query.category) {
      queries.category = String(req.query.category);
    }

    if (req.query.status) {
      queries.status = Boolean(req.query.status);
    }

    if (req.query.isFeatured) {
      queries.isFeatured = Boolean(req.query.isFeatured);
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(queries)
        .populate('createdBy', 'fullName')
        .populate('category', 'categoryName')
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách danh mục bài viết của bạn thành công',
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(Number(totalPosts) / Number(limit)),
        pageSizes: Number(limit),
        totalItems: Number(totalPosts),
      },
    });
  },
);

export const updatePost = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { slug } = req.params;
    const { title, category, description } = req.body;

    if (!title || !category || !status || !description)
      throw new CustomError(
        http.UNAUTHORIZED,
        'Vui lòng nhập đầy đủ các trường',
      );

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const post = await Post.findOne({ slug, createdBy: user.id });
    if (!post)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy khóa học');

    post.title = title;
    post.category = category;
    post.description = description;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('category', 'categoryName')
      .populate('createdBy', 'fullName');

    res
      .status(http.OK)
      .json({ msg: 'Chỉnh sửa thành công', post: updatedPost });
  },
);

export const deletePost = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { slug } = req.params;

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const post = await Post.findOne({ slug, createdBy: user.id });
    if (!post)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy bài viêt');

    post.status = !post.status;
    await post.save();

    const deletedPost = await Post.findOne({ slug, createdBy: user.id })
      .populate('category', 'categoryName')
      .populate('createdBy', 'fullName');

    res
      .status(http.OK)
      .json({ msg: 'Ẩn sản phẩm thành công', post: deletedPost });
  },
);
