import type { Request, Response } from 'express';

import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getSummary(_req: Request, res: Response): Promise<void> {
    const summary = await dashboardService.getSummary();
    res.status(200).json(summary);
  },
};
