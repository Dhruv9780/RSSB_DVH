import type { NextFunction, Request, Response } from 'express';

import type { AppRole } from '../constants/roles.js';

import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/http-error.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new HttpError('Unauthorized', 401));
    return;
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    const userId = Number(payload.sub);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      next(new HttpError('Unauthorized', 401));
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch {
    next(new HttpError('Invalid token', 401));
  }
};

export const authorize = (...allowedRoles: AppRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError('Unauthorized', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new HttpError('Forbidden', 403));
      return;
    }

    next();
  };
};
