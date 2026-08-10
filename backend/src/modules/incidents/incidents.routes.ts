import { Router } from 'express';

import { ROLES } from '../../constants/roles.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { incidentsController } from './incidents.controller.js';
import {
  createIncidentSchema,
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

incidentsRouter.post(
  '/',
  authorize(ROLES.SECURITY_SEWADAR, ROLES.SUPER_ADMIN),
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
