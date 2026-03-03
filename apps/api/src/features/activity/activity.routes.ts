import { Router } from 'express';

import { activityController } from './activity.controller.js';

export const activityRouter = Router();

activityRouter.get('/', activityController.getAll);
