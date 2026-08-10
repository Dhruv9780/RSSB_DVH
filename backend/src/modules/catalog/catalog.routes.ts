import { Router } from 'express';

import { ROLES } from '../../constants/roles.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { catalogController } from './catalog.controller.js';
import { upsertCategorySchema, upsertLocationSchema } from './catalog.dto.js';

const catalogRouter = Router();

catalogRouter.use(authenticate);

catalogRouter.get('/categories', asyncHandler(catalogController.listCategories));
catalogRouter.get('/locations', asyncHandler(catalogController.listLocations));

catalogRouter.post(
  '/categories',
  authorize(ROLES.SUPER_ADMIN),
  validateRequest(upsertCategorySchema),
  asyncHandler(catalogController.upsertCategory),
);

catalogRouter.post(
  '/locations',
  authorize(ROLES.SUPER_ADMIN),
  validateRequest(upsertLocationSchema),
  asyncHandler(catalogController.upsertLocation),
);

export { catalogRouter };
