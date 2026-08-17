import { Request, Response, NextFunction } from 'express';
import { apiRouter } from './apiRouter';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/api/sql', apiRouter);

export const sqlDevMiddleware = (req: any, res: any, next: any) => {
  if (req.url?.startsWith('/api/sql')) {
    return app(req, res, next);
  }
  next();
};
