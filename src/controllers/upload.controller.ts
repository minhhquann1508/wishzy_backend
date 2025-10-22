import { Request, Response } from 'express';
import http from 'http-status-codes';
import asyncHandler from 'express-async-handler';

import { CustomError } from '../errors/error';
import { CustomRequest } from '../types/request';
import uploadImage from '../helper/uploadFile';
import { CloudinaryUploadResult } from '../types/cloudinaryResponse';
import axios from 'axios';
import config from '../configs/config';

export const uploadImageUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file)
      throw new CustomError(http.BAD_REQUEST, 'Không có file được tải lên');

    const result = (await uploadImage(file.buffer)) as CloudinaryUploadResult;
    if (!result)
      throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');

    res.json({ message: 'Upload avatar thành công', url: result.secure_url });
  },
);

export const uploadVideo = asyncHandler(async (req: CustomRequest, res: Response) => {
  const libraryId = config.BUNNY_LIBRARY_ID;
  const file = req.file;

  if (!file)
    throw new CustomError(http.BAD_REQUEST, 'Không có file được tải lên');

  console.log(config.BUNNY_URL);

  const result = await axios.post(`${config.BUNNY_URL}/library/${libraryId}/videos`,
    {
      title: file.originalname, 
    },
    {
      headers: {
        AccessKey: config.BUNNY_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  if (result.status !== 200) throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');
  
  const videoId = result.data.guid;

  const uploadResult = await axios.put(`${config.BUNNY_URL}/library/${libraryId}/videos/${videoId}`, file.buffer,
  {
    headers: {
      AccessKey: config.BUNNY_API_KEY,
      "Content-Type": "application/octet-stream",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (uploadResult.status !== 200)
    throw new CustomError(http.BAD_REQUEST, 'Upload ảnh không thành công');

  
  res.json({ message: 'Upload video thành công', data: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}` });
})
