import { v2 as cloudinary } from 'cloudinary';
import config from './config';

cloudinary.config({
  secure: true,
  api_key: config.cloudinaryKey,
  cloud_name: config.cloudinaryName,
  api_secret: config.cloudinarySecret,
});

export default cloudinary;
