import 'express-async-errors';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalhost = /^https?:\/\/localhost:\d+$/i.test(origin);
      const isVercelApp = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
      const isAllowedProdOrigin = origin === env.CLIENT_ORIGIN;

      if ((env.NODE_ENV !== 'production' && isLocalhost) || isAllowedProdOrigin || isVercelApp) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin blocked'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'taskboard-hub-api' });
});

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API ejecutandose' });
});

app.use('/api', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
