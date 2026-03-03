import { createHash, randomBytes } from 'node:crypto';

import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { ApiError } from '../../core/api-error.js';
import { authRepository } from './auth.repository.js';

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const parseDurationMs = (value: string): number => {
  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) {
    throw new ApiError(500, `Invalid duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const rawUnit = match[2];
  if (!rawUnit) {
    throw new ApiError(500, `Invalid duration unit: ${value}`);
  }
  const unit = rawUnit.toLowerCase();
  const unitMap: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  const multiplier = unitMap[unit];
  if (!multiplier) {
    throw new ApiError(500, `Unsupported duration unit: ${value}`);
  }

  return amount * multiplier;
};

const toPublicUser = (user: { id: string; email: string; fullName: string; role: string }) => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
};

const createAccessToken = (payload: { sub: string; role: string }) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  });
};

const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex');
};

const createRefreshToken = async (input: { userId: string; userAgent?: string; ipAddress?: string }) => {
  const refreshToken = randomBytes(48).toString('base64url');
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.REFRESH_TOKEN_EXPIRES_IN));

  const createInput: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  } = {
    userId: input.userId,
    tokenHash,
    expiresAt,
  };
  if (input.userAgent) createInput.userAgent = input.userAgent;
  if (input.ipAddress) createInput.ipAddress = input.ipAddress;

  await authRepository.createRefreshToken(createInput);

  return refreshToken;
};

export const authService = {
  register: async (input: RegisterInput, context: { userAgent?: string; ipAddress?: string }) => {
    const existingUser = await authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
    });

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const refreshContext: { userId: string; userAgent?: string; ipAddress?: string } = {
      userId: user.id,
    };
    if (context.userAgent) refreshContext.userAgent = context.userAgent;
    if (context.ipAddress) refreshContext.ipAddress = context.ipAddress;

    const refreshToken = await createRefreshToken(refreshContext);

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    };
  },
  login: async (input: LoginInput, context: { userAgent?: string; ipAddress?: string }) => {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const refreshContext: { userId: string; userAgent?: string; ipAddress?: string } = {
      userId: user.id,
    };
    if (context.userAgent) refreshContext.userAgent = context.userAgent;
    if (context.ipAddress) refreshContext.ipAddress = context.ipAddress;

    const refreshToken = await createRefreshToken(refreshContext);

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    };
  },
  refresh: async (rawRefreshToken?: string, context?: { userAgent?: string; ipAddress?: string }) => {
    if (!rawRefreshToken) {
      throw new ApiError(401, 'Missing refresh token');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await authRepository.findValidRefreshToken(tokenHash);
    if (!tokenRecord) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    await authRepository.revokeRefreshToken(tokenRecord.id);

    const accessToken = createAccessToken({
      sub: tokenRecord.user.id,
      role: tokenRecord.user.role,
    });
    const refreshContext: { userId: string; userAgent?: string; ipAddress?: string } = {
      userId: tokenRecord.user.id,
    };
    if (context?.userAgent) refreshContext.userAgent = context.userAgent;
    if (context?.ipAddress) refreshContext.ipAddress = context.ipAddress;

    const refreshToken = await createRefreshToken(refreshContext);

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(tokenRecord.user),
    };
  },
  logout: async (rawRefreshToken?: string) => {
    if (!rawRefreshToken) {
      return { message: 'Logged out' };
    }

    const tokenHash = hashToken(rawRefreshToken);
    await authRepository.revokeRefreshTokenByHash(tokenHash);
    return { message: 'Logged out' };
  },
  me: async (userId: string) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return toPublicUser(user);
  },
};
