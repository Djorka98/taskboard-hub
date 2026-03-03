import { db } from '../shared/base.repository.js';

export const notificationsRepository = {
  findManyByUser: (userId: string) => {
    return db.notification.findMany({
      where: { userId },
      orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    });
  },
  findByIdForUser: (id: string, userId: string) => {
    return db.notification.findFirst({ where: { id, userId } });
  },
  markAsRead: (id: string) => {
    return db.notification.update({ where: { id }, data: { readAt: new Date() } });
  },
  markAllAsRead: (userId: string) => {
    return db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },
};
