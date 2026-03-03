import { Request, Response } from 'express';

import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  getLayout: async (req: Request, res: Response) => {
    const data = await dashboardService.getLayout(req.user?.sub ?? '');
    return res.status(200).json(data);
  },
  saveLayout: async (req: Request, res: Response) => {
    const data = await dashboardService.saveLayout(req.user?.sub ?? '', req.body);
    return res.status(200).json(data);
  },
  resetLayout: async (req: Request, res: Response) => {
    const data = await dashboardService.resetLayout(req.user?.sub ?? '');
    return res.status(200).json(data);
  },
};
