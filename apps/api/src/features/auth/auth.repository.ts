import { db } from '../shared/base.repository.js';

export const authRepository = {
  findUserByEmail: (email: string) => {
    return db.user.findUnique({ where: { email } });
  },
  findUserById: (id: string) => {
    return db.user.findUnique({ where: { id } });
  },
  createUser: (input: { email: string; fullName: string; passwordHash: string }) => {
    return db.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash: input.passwordHash,
      },
    });
  },
  createRefreshToken: (input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) => {
    return db.refreshToken.create({ data: input });
  },
  findValidRefreshToken: (tokenHash: string) => {
    return db.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },
  revokeRefreshToken: (id: string) => {
    return db.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },
  revokeRefreshTokenByHash: (tokenHash: string) => {
    return db.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
