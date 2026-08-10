import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

import { authController } from './auth.controller.js';
import { loginSchema } from './auth.dto.js';

const authRouter = Router();

authRouter.post('/login', validateRequest(loginSchema), asyncHandler(authController.login));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));

export { authRouter };
