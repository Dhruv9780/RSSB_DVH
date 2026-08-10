import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { matchingController } from './matching.controller.js';

const matchingRouter = Router();

matchingRouter.use(authenticate);
matchingRouter.get(
  '/lost-reports/:lostReportId/suggestions',
  asyncHandler(matchingController.getSuggestionsForLostReport),
);

export { matchingRouter };
