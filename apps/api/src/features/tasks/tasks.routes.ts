import { Router } from 'express';

import { validateBody } from '../shared/validate.js';
import { tasksController } from './tasks.controller.js';
import { createTaskSchema, updateTaskSchema } from './tasks.validators.js';

export const tasksRouter = Router();

tasksRouter.get('/', tasksController.getAll);
tasksRouter.post('/', validateBody(createTaskSchema), tasksController.create);
tasksRouter.get('/:id', tasksController.getById);
tasksRouter.patch('/:id', validateBody(updateTaskSchema), tasksController.update);
tasksRouter.delete('/:id', tasksController.remove);
