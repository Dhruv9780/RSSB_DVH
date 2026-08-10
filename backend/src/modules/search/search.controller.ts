import type { Request, Response } from 'express';

import type { GlobalSearchQuery } from './search.dto.js';
import { searchService } from './search.service.js';

export const searchController = {
  async global(req: Request, res: Response): Promise<void> {
    const result = await searchService.globalSearch(req.query as unknown as GlobalSearchQuery);
    res.status(200).json(result);
  },
};
