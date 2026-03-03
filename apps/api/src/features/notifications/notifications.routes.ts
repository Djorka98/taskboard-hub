import { Router } from 'express';

import { notificationsController } from './notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', notificationsController.getAll);
notificationsRouter.patch('/:id/read', notificationsController.markAsRead);
notificationsRouter.patch('/read-all', notificationsController.markAllAsRead);
