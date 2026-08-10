import type { Request, Response } from 'express';

import { activityService } from '../activity/activity.service.js';

import { catalogService } from './catalog.service.js';

export const catalogController = {
  async listCategories(_req: Request, res: Response): Promise<void> {
    const categories = await catalogService.getCategories();
    res.status(200).json({ categories });
  },

  async listLocations(_req: Request, res: Response): Promise<void> {
    const locations = await catalogService.getLocations();
    res.status(200).json({ locations });
  },

  async upsertCategory(req: Request, res: Response): Promise<void> {
    const category = await catalogService.upsertCategory(req.body);

    await activityService.logActivity({
      userId: req.user?.id,
      action: 'CATEGORY_UPSERT',
      entity: 'Category',
      entityId: String(category.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ category });
  },

  async upsertLocation(req: Request, res: Response): Promise<void> {
    const location = await catalogService.upsertLocation(req.body);

    await activityService.logActivity({
      userId: req.user?.id,
      action: 'LOCATION_UPSERT',
      entity: 'Location',
      entityId: String(location.id),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ location });
  },
};
