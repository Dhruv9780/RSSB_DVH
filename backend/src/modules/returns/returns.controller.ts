import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';

import { returnsService } from './returns.service.js';

export const returnsController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const returnEntry = await returnsService.create(req.body, req.user.id);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'ITEM_RETURNED',
      entity: 'ReturnHistory',
      entityId: String(returnEntry.id),
      metadata: {
        foundItemId: req.body.foundItemId,
        lostReportId: req.body.lostReportId,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({ returnEntry });
  },
};
