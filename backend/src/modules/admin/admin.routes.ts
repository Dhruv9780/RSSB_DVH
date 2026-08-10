import { Router } from 'express';

import { ROLES } from '../../constants/roles.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { adminController } from './admin.controller.js';
import {
  createUserSchema,
  exportActivitySchema,
  exportUsersSchema,
  listActivitySchema,
  listUsersSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from './admin.dto.js';

const adminRouter = Router();

adminRouter.use(authenticate, authorize(ROLES.SUPER_ADMIN));

adminRouter.get('/users', validateRequest(listUsersSchema), asyncHandler(adminController.listUsers));
adminRouter.get('/users/export.csv', validateRequest(exportUsersSchema), asyncHandler(adminController.exportUsers));
adminRouter.post('/users', validateRequest(createUserSchema), asyncHandler(adminController.createUser));
adminRouter.patch('/users/:id', validateRequest(updateUserSchema), asyncHandler(adminController.updateUser));
adminRouter.patch(
  '/users/:id/status',
  validateRequest(updateUserStatusSchema),
  asyncHandler(adminController.updateUserStatus),
);
adminRouter.get('/activity', validateRequest(listActivitySchema), asyncHandler(adminController.listActivity));
adminRouter.get(
  '/activity/export.csv',
  validateRequest(exportActivitySchema),
  asyncHandler(adminController.exportActivity),
);

export { adminRouter };