import { Router } from 'express';

import { validateBody } from '../shared/validate.js';
import { createNoteSchema, updateNoteSchema } from './notes.validators.js';
import { notesController } from './notes.controller.js';

export const notesRouter = Router();

notesRouter.get('/', notesController.getAll);
notesRouter.post('/', validateBody(createNoteSchema), notesController.create);
notesRouter.get('/:id', notesController.getById);
notesRouter.patch('/:id', validateBody(updateNoteSchema), notesController.update);
notesRouter.delete('/:id', notesController.remove);
