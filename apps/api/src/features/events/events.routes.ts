import { Router } from 'express';

import { validateBody } from '../shared/validate.js';
import { eventsController } from './events.controller.js';
import { createEventSchema, updateEventSchema } from './events.validators.js';

export const eventsRouter = Router();

eventsRouter.get('/', eventsController.getAll);
eventsRouter.post('/', validateBody(createEventSchema), eventsController.create);
eventsRouter.get('/:id', eventsController.getById);
eventsRouter.patch('/:id', validateBody(updateEventSchema), eventsController.update);
eventsRouter.delete('/:id', eventsController.remove);
