import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { searchController } from './search.controller.js';
import { globalSearchSchema } from './search.dto.js';

const searchRouter = Router();

searchRouter.use(authenticate);
searchRouter.get('/global', validateRequest(globalSearchSchema), asyncHandler(searchController.global));

export { searchRouter };
