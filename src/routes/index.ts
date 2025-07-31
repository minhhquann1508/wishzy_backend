import { Application } from 'express';
import authRoute from './auth';
import gradeRoute from './grade';
import subjectRoute from './subject';
import courseRoute from './course';

export const useRoute = (app: Application) => {
  app.use('/api/auth', authRoute);
  app.use('/api/grade', gradeRoute);
  app.use('/api/subject', subjectRoute);
  app.use('/api/course', courseRoute);
};
