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
  BUNNY_URL: string;
  BUNNY_API_KEY: string;
  MONGO_TEMP_USER: string;
  MONGO_TEMP_PASSWORD: string;
  MONGO_DB_COMPASS: string;
  MONGO_CLOUD_URL: string;
  BUNNY_LIBRARY_ID: string;
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
  BUNNY_URL: process.env.BUNNY_URL as string,
  BUNNY_API_KEY: process.env.BUNNY_API_KEY as string,
  MONGO_TEMP_USER: process.env.MONGO_TEMP_USER as string,
  MONGO_TEMP_PASSWORD: process.env.MONGO_TEMP_PASSWORD as string,
  MONGO_DB_COMPASS: process.env.MONGO_DB_COMPASS as string,
  MONGO_CLOUD_URL: process.env.MONGO_CLOUD_URL as string,
  BUNNY_LIBRARY_ID: process.env.BUNNY_LIBRARY_ID as string,
};

export default config;
