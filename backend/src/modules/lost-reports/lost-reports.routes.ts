import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadLostReportPhoto } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { createLostReportSchema, exportLostReportsSchema, listLostReportsSchema } from './lost-reports.dto.js';
import { lostReportsController } from './lost-reports.controller.js';

const lostReportsRouter = Router();

lostReportsRouter.use(authenticate);

lostReportsRouter.get('/', validateRequest(listLostReportsSchema), asyncHandler(lostReportsController.list));
lostReportsRouter.get(
	'/export.csv',
	validateRequest(exportLostReportsSchema),
	asyncHandler(lostReportsController.exportCsv),
);
lostReportsRouter.get('/:id', asyncHandler(lostReportsController.getById));
lostReportsRouter.post(
	'/:id/photo',
	uploadLostReportPhoto.single('photo'),
	asyncHandler(lostReportsController.uploadPhoto),
);
lostReportsRouter.post('/', validateRequest(createLostReportSchema), asyncHandler(lostReportsController.create));

export { lostReportsRouter };
