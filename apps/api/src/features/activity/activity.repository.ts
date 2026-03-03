import { db } from '../shared/base.repository.js';

export const activityRepository = {
  findManyByActor: (actorId: string) => {
    return db.activityLog.findMany({
      where: { actorId },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  },
};
