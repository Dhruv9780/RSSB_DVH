import path from 'node:path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { apiRouter } from './routes/index.js';

dotenv.config();

export const app = express();

const enableLocalUploads = process.env.ENABLE_LOCAL_UPLOADS !== 'false';

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

if (enableLocalUploads) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}
app.use('/api/v1', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
