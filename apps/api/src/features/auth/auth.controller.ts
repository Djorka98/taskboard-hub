import { Request, Response } from 'express';

import { env } from '../../config/env.js';
import { authService } from './auth.service.js';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const requestContext = (req: Request): { userAgent?: string; ipAddress?: string } => {
  const context: { userAgent?: string; ipAddress?: string } = {};
  const userAgent = req.headers['user-agent'];
  if (userAgent) {
    context.userAgent = userAgent;
  }
  if (req.ip) {
    context.ipAddress = req.ip;
  }
  return context;
};

export const authController = {
  register: async (req: Request, res: Response) => {
    const payload = await authService.register(req.body, requestContext(req));

    res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, payload.refreshToken, getCookieOptions());
    return res.status(201).json({ accessToken: payload.accessToken, user: payload.user });
  },
  login: async (req: Request, res: Response) => {
    const payload = await authService.login(req.body, requestContext(req));

    res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, payload.refreshToken, getCookieOptions());
    return res.status(200).json({ accessToken: payload.accessToken, user: payload.user });
  },
  refresh: async (req: Request, res: Response) => {
    const payload = await authService.refresh(
      req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME],
      requestContext(req),
    );

    res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, payload.refreshToken, getCookieOptions());
    return res.status(200).json({ accessToken: payload.accessToken, user: payload.user });
  },
  logout: async (req: Request, res: Response) => {
    const payload = await authService.logout(req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME]);
    res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    return res.status(200).json(payload);
  },
  me: async (req: Request, res: Response) => {
    const user = await authService.me(req.user?.sub ?? '');
    return res.status(200).json({ user });
  },
};
