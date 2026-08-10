import type { Request, Response } from 'express';

import { activityService } from '../activity/activity.service.js';

import { authService } from './auth.service.js';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);

    await activityService.logActivity({
      userId: result.user.id,
      action: 'AUTH_LOGIN',
      entity: 'User',
      entityId: String(result.user.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      user: req.user,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await activityService.logActivity({
        userId: req.user.id,
        action: 'AUTH_LOGOUT',
        entity: 'User',
        entityId: String(req.user.id),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  },
};
