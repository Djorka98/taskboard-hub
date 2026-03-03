import { Router } from 'express';

import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../shared/validate.js';
import { authController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validators.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
