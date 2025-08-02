import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Lecture from '../models/lecture.model';
import { CustomError } from '../errors/error';
import { CONST } from '../utils/constant';
import { CustomRequest } from '../types/request';

// export const createNewLecture = asyncHandler(async (req: CustomRequest, res: Response) => {
//     const { user } = req;
//     const { chapterSlug } = req.params;
//     const {lectureName}
// })
