import mongoose from 'mongoose';
import config from './config';

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_CLOUD_URL);
    if (conn.connection.readyState === 1) {
      console.log('Kết nối thành công');
    } else {
      console.log('Không kết nối được với db');
    }
  } catch (error) {
    console.log('Không kết nối được với db');
  }
};
