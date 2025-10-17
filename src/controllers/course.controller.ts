import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Course from '../models/course.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';
import { useLookup, useProjectStage } from '../helper/aggregation';

export const createNewCourse = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { user } = req;
    const { courseName, price, subject } = req.body;

    if (!courseName || !price || !subject)
      throw new CustomError(http.BAD_REQUEST, 'Chưa đủ thông tin nhập vào');

    if (!user) throw new CustomError(http.UNAUTHORIZED, 'Bạn chưa đăng nhập');

    const course = await Course.create({
      ...req.body,
      courseName,
      price,
      subject,
      createdBy: user.id,
    });

    res
      .status(http.CREATED)
      .json({ msg: 'Tạo mới khóa học thành công', course });
  },
);

export const getDetailCourseBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy slug');

    const course = await Course.findOne({ slug, status: true })
      .populate('createdBy', 'fullName email avatar')
      .populate({
        path: 'subject',
        match: { status: true },
        select: 'subjectName slug',
        populate: {
          path: 'grade',
          select: 'gradeName',
          match: { status: true },
        },
      })
      .then((course) => {
        if (
          !course ||
          !course.subject ||
          typeof course.subject !== 'object' ||
          !('grade' in course.subject) ||
          !course.subject.grade
        )
          return null;
        return course;
      });
    if (!course)
      throw new CustomError(
        http.BAD_REQUEST,
        'Không tìm thấy khóa học phù hợp',
      );

    res
      .status(http.OK)
      .json({ msg: 'Lấy chi tiết khóa học thành công', course });
  },
);

// Gọi toàn bộ sản phẩm theo user - tránh gọi các khóa học bị ẩn bởi subject hoặc grade
export const getAllCourseByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || CONST.pageLimit;
    const skip = (page - 1) * limit;

    const queries: any = {};

    if (req.query.courseName) {
      queries.courseName = {
        $regex: String(req.query.courseName),
        $options: 'i',
      };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queries.price = {};
      if (req.query.minPrice) queries.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queries.price.$lte = Number(req.query.maxPrice);
    }

    const basePipeline = [
      { $match: { ...queries, status: true } },
      useLookup('subjects', 'subject', 'subject'),
      { $unwind: '$subject' },
      { $match: { 'subject.status': true } },
      // // Tìm theo biến grade và lọc nó theo grade nào có hiện hoặc ẩn
      useLookup('grades', 'subject.grade', 'grade'),
      { $unwind: '$grade' },
      { $match: { 'grade.status': true } },
      // // Tìm theo biến user
      useLookup('users', 'createdBy', 'createdBy'),
      { $unwind: '$createdBy' },
      {
        $project: {
          _id: 1,
          courseName: 1,  
          price: 1,
          thumbnail: 1,
          description: 1,
          status: 1,
          level: 1,
          numberOfStudents: 1,
          totalDuration: 1,
          rating: 1,
          averageRating: { $ifNull: ['$rating', 0] },
          sale: 1,
          createdAt: 1,
          updatedAt: 1,
          slug: 1,
          __v: 1,
          requirements: 1,
          subject: {
            _id: '$subject._id',
            subjectName: '$subject.subjectName',
            slug: '$subject.slug',
            grade: {
              _id: '$grade._id',
              gradeName: '$grade.gradeName'
            }
          },
          createdBy: {
            _id: '$createdBy._id',
            fullName: '$createdBy.fullName',
            email: '$createdBy.email',
            avatar: '$createdBy.avatar'
          }
        }
      }
    ];

    const sortOrder = Number(req.query.orderDate) === 1 ? 1 : -1;

    const [courses, totalResult] = await Promise.all([
      Course.aggregate([
        ...basePipeline,
        { $sort: { createdAt: sortOrder } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Course.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const totalCourses = totalResult[0]?.total || 0;

    res.status(http.OK).json({
      msg: 'Lấy danh sách khóa học thành công',
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        pageSizes: limit,
        totalItems: totalCourses,
      },
    });
  },
);

// Lấy ra danh sách khóa học của giảng viên
export const getInstructorCourse = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || CONST.pageLimit;
    const skip = (page - 1) * limit;
    const { user } = req;
    const queries: any = { createdBy: user?.id };

    if (!user)
      throw new CustomError(http.BAD_REQUEST, 'Không tìm thấy người dùng');

    if (req.query.courseName) {
      queries.courseName = { $regex: req.query.courseName, $options: 'i' };
    }

    if (req.query.status) {
      queries.status = Boolean(req.query.status);
    }

    const sortOrder = Number(req.query.orderDate) === 1 ? 1 : -1;

    const [courses, totalCourses] = await Promise.all([
      Course.find(queries)
        .populate('createdBy', 'fullName email avatar')
        .populate({
          path: 'subject',
          match: { status: true },
          select: 'subjectName slug',
          populate: {
            path: 'grade',
            select: 'gradeName',
            match: { status: true },
          },
        })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(queries),
    ]);

    res.status(http.OK).json({
      msg: 'Lấy danh sách khóa học thành công',
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        pageSizes: limit,
        totalItems: totalCourses,
      },
    });
  },
);

// Lấy danh sách khóa học - admin
export const getAllCourseByAdmin = asyncHandler(
  async (req: Request, res: Response) => {},
);

// Lấy khóa học hot
export const getHotCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || CONST.pageLimit;
    const skip = (page - 1) * limit;

    const basePipeline = [
      { $match: { status: true } },
      useLookup('subjects', 'subject', 'subject'),
      { $unwind: '$subject' },
      { $match: { 'subject.status': true } },
      // Tìm theo biến grade và lọc nó theo grade nào có hiện hoặc ẩn
      useLookup('grades', 'subject.grade', 'grade'),
      { $unwind: '$grade' },
      { $match: { 'grade.status': true } },
      // Tìm theo biến user
      useLookup('users', 'createdBy', 'createdBy'),
      { $unwind: '$createdBy' },
      useProjectStage([
        'courseName',
        'price',
        'thumbnail',
        'status',
        'level',
        'numberOfStudents',
        'totalDuration',
        'rating',
        'sale',
        'createdAt',
        'slug',
        'subject.subjectName',
        'subject.slug',
        'grade.gradeName',
        'createdBy.fullName',
        'createdBy.email',
        'createdBy.avatar',
      ]),
    ];

    const [courses, totalResult] = await Promise.all([
      Course.aggregate([
        ...basePipeline,
        { $sort: { numberOfStudents: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Course.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const totalCourses = totalResult[0]?.total || 0;

    res.status(http.OK).json({
      msg: 'Lấy danh sách khóa học hot thành công',
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        pageSizes: limit,
        totalItems: totalCourses,
      },
    });
  },
);
