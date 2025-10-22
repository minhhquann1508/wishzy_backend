import { Request } from 'express';

export interface PayloadData {
  id: string;
  role: 'admin' | 'user' | 'instructor' | 'staff' | 'manager' | 'marketing' | 'content';
}

export interface CustomRequest extends Request {
  user?: PayloadData;
}
