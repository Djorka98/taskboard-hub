import { Request, Response } from 'express';

import { ApiError } from '../../core/api-error.js';
import { eventsService } from './events.service.js';

const getParamId = (req: Request) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, 'Missing resource id');
  }
  return id;
};

export const eventsController = {
  getAll: async (req: Request, res: Response) => {
    const items = await eventsService.getAll(req.user?.sub ?? '');
    return res.status(200).json(items);
  },
  create: async (req: Request, res: Response) => {
    const item = await eventsService.create(req.user?.sub ?? '', req.body);
    return res.status(201).json(item);
  },
  getById: async (req: Request, res: Response) => {
    const item = await eventsService.getById(req.user?.sub ?? '', getParamId(req));
    return res.status(200).json(item);
  },
  update: async (req: Request, res: Response) => {
    const item = await eventsService.update(req.user?.sub ?? '', getParamId(req), req.body);
    return res.status(200).json(item);
  },
  remove: async (req: Request, res: Response) => {
    const item = await eventsService.remove(req.user?.sub ?? '', getParamId(req));
    return res.status(200).json(item);
  },
};
