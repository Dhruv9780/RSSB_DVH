import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { dashboardController } from './dashboard.controller.js';

const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/summary', asyncHandler(dashboardController.getSummary));

export { dashboardRouter };
