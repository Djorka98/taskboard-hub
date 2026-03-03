import { db } from '../shared/base.repository.js';

export const notesRepository = {
  findManyByUser: (userId: string) => {
    return db.note.findMany({
      where: { userId },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
  },
  findByIdForUser: (id: string, userId: string) => {
    return db.note.findFirst({ where: { id, userId } });
  },
  create: (input: {
    userId: string;
    title: string;
    content: string;
    color?: string | undefined;
    label?: string | undefined;
    pinned: boolean;
  }) => {
    const data: {
      userId: string;
      title: string;
      content: string;
      color?: string | null;
      label?: string | null;
      pinned: boolean;
    } = {
      userId: input.userId,
      title: input.title,
      content: input.content,
      pinned: input.pinned,
    };
    if (input.color !== undefined) data.color = input.color;
    if (input.label !== undefined) data.label = input.label;

    return db.note.create({ data });
  },
  update: (id: string, data: Record<string, unknown>) => {
    return db.note.update({ where: { id }, data });
  },
  remove: (id: string) => {
    return db.note.delete({ where: { id } });
  },
};
