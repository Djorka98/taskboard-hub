import { Request, Response } from 'express';

import { activityService } from './activity.service.js';

export const activityController = {
  getAll: async (req: Request, res: Response) => {
    const items = await activityService.getAll(req.user?.sub ?? '');
    return res.status(200).json(items);
  },
};
