import { Application } from 'express';
import authRoute from './auth';
import gradeRoute from './grade';
import instuctorRoute from './instructor'; 


export const useRoute = (app: Application) => {
  app.use('/api/auth', authRoute);
  app.use('/api/grade', gradeRoute);
  app.use('/api/instructor', instuctorRoute);
};
