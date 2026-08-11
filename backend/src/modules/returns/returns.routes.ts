import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadReturnReceiverPhoto } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { createReturnSchema } from './returns.dto.js';
import { returnsController } from './returns.controller.js';

const returnsRouter = Router();

returnsRouter.use(authenticate);
returnsRouter.post(
	'/',
	uploadReturnReceiverPhoto.single('receiverPhoto'),
	validateRequest(createReturnSchema),
	asyncHandler(returnsController.create),
);

export { returnsRouter };
