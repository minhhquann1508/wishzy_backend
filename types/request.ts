import { Request } from 'express';

export interface PayloadData {
  id: string;
  role: 'admin' | 'user' | 'intructor';
}

export interface CustomRequest extends Request {
  user?: PayloadData;
}
