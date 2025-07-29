import { Request } from 'express';

export interface PayloadData {
  id: string;
  role: 'admin' | 'user' | 'instructor';
}

export interface CustomRequest extends Request {
  user?: PayloadData;
}
