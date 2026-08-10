import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadFoundItemImages } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { createFoundItemSchema, listFoundItemsSchema } from './found-items.dto.js';
import { foundItemsController } from './found-items.controller.js';

const foundItemsRouter = Router();

foundItemsRouter.use(authenticate);

foundItemsRouter.get('/', validateRequest(listFoundItemsSchema), asyncHandler(foundItemsController.list));
foundItemsRouter.get('/:id', asyncHandler(foundItemsController.getById));
foundItemsRouter.post(
  '/:id/images',
  uploadFoundItemImages.array('images', 5),
  asyncHandler(foundItemsController.uploadImages),
);
foundItemsRouter.post(
  '/',
  validateRequest(createFoundItemSchema),
  asyncHandler(foundItemsController.create),
);

export { foundItemsRouter };
