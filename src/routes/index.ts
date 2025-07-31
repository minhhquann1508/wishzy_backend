import { Application } from 'express';
import authRoute from './auth';
import gradeRoute from './grade';

export const useRoute = (app: Application) => {
  app.use('/api/auth', authRoute);
  app.use('/api/grade', gradeRoute);
};
