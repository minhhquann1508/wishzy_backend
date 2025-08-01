import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  dbUrl: string;
  baseUrl: string;
  jwtSecret: string;
  cloudinaryName: string;
  cloudinaryKey: string;
  cloudinarySecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/wishzy',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || '',
  cloudinaryName: process.env.CLOUDINARY_NAME as string,
  cloudinaryKey: process.env.CLOUDINARY_KEY as string,
  cloudinarySecret: process.env.CLOUDINARY_SECRET as string,
};

export default config;
