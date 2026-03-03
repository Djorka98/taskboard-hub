import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../../core/api-error.js';

export const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ApiError(400, JSON.stringify(parsed.error.flatten().fieldErrors)));
    }

    req.body = parsed.data;
    next();
  };
};
