import { db } from '../shared/base.repository.js';

export const eventsRepository = {
  findManyByUser: (userId: string) => {
    return db.event.findMany({
      where: { userId },
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });
  },
  findByIdForUser: (id: string, userId: string) => {
    return db.event.findFirst({ where: { id, userId } });
  },
  create: (input: {
    userId: string;
    title: string;
    description?: string | undefined;
    category: string;
    startsAt: Date;
    endsAt?: Date | undefined;
    reminderMinutes?: number | undefined;
  }) => {
    const data: {
      userId: string;
      title: string;
      description?: string | null;
      category: string;
      startsAt: Date;
      endsAt?: Date | null;
      reminderMinutes?: number | null;
    } = {
      userId: input.userId,
      title: input.title,
      category: input.category,
      startsAt: input.startsAt,
    };
    if (input.description !== undefined) data.description = input.description;
    if (input.endsAt !== undefined) data.endsAt = input.endsAt;
    if (input.reminderMinutes !== undefined) data.reminderMinutes = input.reminderMinutes;

    return db.event.create({ data });
  },
  update: (id: string, data: Record<string, unknown>) => {
    return db.event.update({ where: { id }, data });
  },
  remove: (id: string) => {
    return db.event.delete({ where: { id } });
  },
};
