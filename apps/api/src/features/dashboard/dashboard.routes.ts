import { Router } from 'express';

import { validateBody } from '../shared/validate.js';
import { dashboardController } from './dashboard.controller.js';
import { updateLayoutSchema } from './dashboard.validators.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', dashboardController.getLayout);
dashboardRouter.put('/', validateBody(updateLayoutSchema), dashboardController.saveLayout);
dashboardRouter.post('/reset', dashboardController.resetLayout);
