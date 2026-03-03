import { Request, Response } from 'express';

import { ApiError } from '../../core/api-error.js';
import { tasksService } from './tasks.service.js';

const getParamId = (req: Request) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, 'Missing resource id');
  }
  return id;
};

export const tasksController = {
  getAll: async (req: Request, res: Response) => {
    const items = await tasksService.getAll(req.user?.sub ?? '');
    return res.status(200).json(items);
  },
  create: async (req: Request, res: Response) => {
    const item = await tasksService.create(req.user?.sub ?? '', req.body);
    return res.status(201).json(item);
  },
  getById: async (req: Request, res: Response) => {
    const item = await tasksService.getById(req.user?.sub ?? '', getParamId(req));
    return res.status(200).json(item);
  },
  update: async (req: Request, res: Response) => {
    const item = await tasksService.update(req.user?.sub ?? '', getParamId(req), req.body);
    return res.status(200).json(item);
  },
  remove: async (req: Request, res: Response) => {
    const item = await tasksService.remove(req.user?.sub ?? '', getParamId(req));
    return res.status(200).json(item);
  },
};
