import { Application } from 'express';
import authRoute from './auth';

export const useRoute = (app: Application) => {
  app.use('/api/auth', authRoute);
};
