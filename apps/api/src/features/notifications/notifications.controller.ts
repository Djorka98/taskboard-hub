import { Response } from 'express';

import { ApiError } from '../../core/api-error.js';
import { AuthenticatedRequest, notificationsService } from './notifications.service.js';

const getParamId = (req: AuthenticatedRequest) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, 'Missing resource id');
  }
  return id;
};

export const notificationsController = {
  getAll: async (req: AuthenticatedRequest, res: Response) => {
    const items = await notificationsService.getAll(req.user?.sub ?? '');
    return res.status(200).json(items);
  },
  markAsRead: async (req: AuthenticatedRequest, res: Response) => {
    const result = await notificationsService.markAsRead(req.user?.sub ?? '', getParamId(req));
    return res.status(200).json(result);
  },
  markAllAsRead: async (req: AuthenticatedRequest, res: Response) => {
    const result = await notificationsService.markAllAsRead(req.user?.sub ?? '');
    return res.status(200).json(result);
  },
};
