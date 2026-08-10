import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';

import { matchingService } from './matching.service.js';

export const matchingController = {
  async getSuggestionsForLostReport(req: Request, res: Response): Promise<void> {
    const lostReportId = Number(req.params.lostReportId);
    const result = await matchingService.suggestForLostReport(lostReportId);

    if (!result) {
      throw new HttpError('Lost report not found', 404);
    }

    res.status(200).json(result);
  },
};
