import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';

import type { ListActivityQuery, ListUsersQuery } from './admin.dto.js';
import { adminService } from './admin.service.js';

export const adminController = {
  async listUsers(req: Request, res: Response): Promise<void> {
    const result = await adminService.listUsers(req.query as unknown as ListUsersQuery);
    res.status(200).json(result);
  },

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const userId = Number(req.params.id);
    const { isActive } = req.body as { isActive: boolean };

    if (req.user.id === userId && !isActive) {
      throw new HttpError('You cannot deactivate your own account', 400);
    }

    const user = await adminService.setUserActiveStatus(userId, isActive);

    await activityService.logActivity({
      userId: req.user.id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'User',
      entityId: String(user.id),
      metadata: { targetUserId: user.id, isActive },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ user });
  },

  async createUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const user = await adminService.createUser(req.body);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: String(user.id),
      metadata: { targetUserId: user.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({ user });
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const userId = Number(req.params.id);
    const input = req.body as {
      role?: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
      isActive?: boolean;
    };

    if (req.user.id === userId && input.isActive === false) {
      throw new HttpError('You cannot deactivate your own account', 400);
    }

    if (req.user.id === userId && input.role && input.role !== 'SUPER_ADMIN') {
      throw new HttpError('You cannot change your own role', 400);
    }

    const user = await adminService.updateUser(userId, req.body);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: String(user.id),
      metadata: { targetUserId: user.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ user });
  },

  async listActivity(req: Request, res: Response): Promise<void> {
    const result = await adminService.listActivity(req.query as unknown as ListActivityQuery);
    res.status(200).json(result);
  },

  async exportUsers(req: Request, res: Response): Promise<void> {
    const csv = await adminService.exportUsersCsv(req.query as unknown as ListUsersQuery);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
    res.status(200).send(csv);
  },

  async exportActivity(req: Request, res: Response): Promise<void> {
    const csv = await adminService.exportActivityCsv(req.query as unknown as ListActivityQuery);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="activity-${Date.now()}.csv"`);
    res.status(200).send(csv);
  },
};