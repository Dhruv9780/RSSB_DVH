import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';
import { matchingService } from '../matching/matching.service.js';

import type { ListLostReportsQuery } from './lost-reports.dto.js';
import { lostReportsService } from './lost-reports.service.js';

export const lostReportsController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const report = await lostReportsService.create(req.body, req.user.id);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'LOST_REPORT_CREATE',
      entity: 'LostReport',
      entityId: String(report.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    const matchResult = await matchingService.suggestForLostData({
      itemName: report.itemName,
      categoryId: report.categoryId ?? undefined,
      brand: report.brand ?? undefined,
      color: report.color ?? undefined,
      description: report.description ?? undefined,
    });

    res.status(201).json({ report, suggestions: matchResult });
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await lostReportsService.list(req.query as unknown as ListLostReportsQuery);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const report = await lostReportsService.getById(id);

    if (!report) {
      throw new HttpError('Lost report not found', 404);
    }

    res.status(200).json({ report });
  },

  async uploadPhoto(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const file = req.file;
    if (!file) {
      throw new HttpError('Photo is required', 400);
    }

    const reportId = Number(req.params.id);
    const report = await lostReportsService.attachPhoto(reportId, file);

    if (!report) {
      throw new HttpError('Lost report not found', 404);
    }

    await activityService.logActivity({
      userId: req.user.id,
      action: 'LOST_REPORT_PHOTO_UPLOAD',
      entity: 'LostReport',
      entityId: String(report.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ report });
  },
};
