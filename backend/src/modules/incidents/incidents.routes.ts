import { Router } from 'express';

import { ROLES } from '../../constants/roles.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { uploadIncidentImage } from '../../middleware/upload.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { incidentsController } from './incidents.controller.js';
import {
  createIncidentSchema,
  exportIncidentsSchema,
  listIncidentsSchema,
  updateIncidentStatusSchema,
} from './incidents.dto.js';

const incidentsRouter = Router();

incidentsRouter.use(authenticate);

incidentsRouter.get(
  '/',
  authorize(ROLES.SECURITY_SEWADAR, ROLES.SUPER_ADMIN),
  validateRequest(listIncidentsSchema),
  asyncHandler(incidentsController.list),
);

incidentsRouter.get(
  '/export.csv',
  authorize(ROLES.SECURITY_SEWADAR, ROLES.SUPER_ADMIN),
  validateRequest(exportIncidentsSchema),
  asyncHandler(incidentsController.exportCsv),
);

incidentsRouter.post(
  '/',
  authorize(ROLES.SECURITY_SEWADAR, ROLES.SUPER_ADMIN),
  uploadIncidentImage.single('image'),
  validateRequest(createIncidentSchema),
  asyncHandler(incidentsController.create),
);

incidentsRouter.patch(
  '/:id/status',
  authorize(ROLES.SECURITY_SEWADAR, ROLES.SUPER_ADMIN),
  validateRequest(updateIncidentStatusSchema),
  asyncHandler(incidentsController.updateStatus),
);

export { incidentsRouter };
