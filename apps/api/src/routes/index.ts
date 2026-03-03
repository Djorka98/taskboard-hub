import { Router } from 'express';

import { activityRouter } from '../features/activity/activity.routes.js';
import { authRouter } from '../features/auth/auth.routes.js';
import { dashboardRouter } from '../features/dashboard/dashboard.routes.js';
import { eventsRouter } from '../features/events/events.routes.js';
import { notesRouter } from '../features/notes/notes.routes.js';
import { notificationsRouter } from '../features/notifications/notifications.routes.js';
import { tasksRouter } from '../features/tasks/tasks.routes.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/tasks', requireAuth, tasksRouter);
apiRouter.use('/events', requireAuth, eventsRouter);
apiRouter.use('/notes', requireAuth, notesRouter);
apiRouter.use('/notifications', requireAuth, notificationsRouter);
apiRouter.use('/dashboard/layout', requireAuth, dashboardRouter);
apiRouter.use('/activity', requireAuth, activityRouter);
