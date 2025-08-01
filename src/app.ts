import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { connectDb } from './configs/db';
import { useRoute } from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

connectDb();

useRoute(app);

app.use(errorHandler);
app.use(notFound);

export default app;
