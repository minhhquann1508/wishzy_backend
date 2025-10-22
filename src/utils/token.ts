import jwt from 'jsonwebtoken';
import config from '../configs/config';

type Data = {
  id: string;
  role: 'user' | 'admin' | 'instructor' | 'staff' | 'manager' | 'marketing' | 'content' ;
};

export const generateAccessToken = (data: Data) => {
  return jwt.sign(data, config.jwtSecret, { expiresIn: '7d' });
};

export const generateRefreshToken = (data: Data) => {
  return jwt.sign(data, config.jwtSecret, { expiresIn: '30d' });
};
