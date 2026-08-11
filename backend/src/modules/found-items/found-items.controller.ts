import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';

import type { ExportFoundItemsQuery, ListFoundItemsQuery } from './found-items.dto.js';
import { foundItemsService } from './found-items.service.js';

export const foundItemsController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const item = await foundItemsService.create(req.body, req.user.id);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'FOUND_ITEM_CREATE',
      entity: 'FoundItem',
      entityId: String(item.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({ item });
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await foundItemsService.list(req.query as unknown as ListFoundItemsQuery);
    res.status(200).json(result);
  },

  async exportCsv(req: Request, res: Response): Promise<void> {
    const csv = await foundItemsService.exportFoundItemsCsv(req.query as unknown as ExportFoundItemsQuery);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="found-items-${Date.now()}.csv"`);
    res.status(200).send(csv);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const item = await foundItemsService.getById(id);

    if (!item) {
      throw new HttpError('Found item not found', 404);
    }

    res.status(200).json({ item });
  },

  async uploadImages(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      throw new HttpError('At least one image is required', 400);
    }

    const itemId = Number(req.params.id);
    const item = await foundItemsService.addImages(itemId, files);

    if (!item) {
      throw new HttpError('Found item not found', 404);
    }

    await activityService.logActivity({
      userId: req.user.id,
      action: 'FOUND_ITEM_IMAGES_UPLOAD',
      entity: 'FoundItem',
      entityId: String(item.id),
      metadata: { uploadedCount: files.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ item });
  },
};
