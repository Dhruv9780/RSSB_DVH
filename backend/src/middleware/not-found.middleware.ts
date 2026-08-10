import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/http-error.js';

export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError('Resource not found', 404));
};
