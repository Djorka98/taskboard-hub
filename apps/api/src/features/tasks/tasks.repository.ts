import { db } from '../shared/base.repository.js';

export const tasksRepository = {
  findManyByUser: (userId: string) => {
    return db.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },
  findByIdForUser: (id: string, userId: string) => {
    return db.task.findFirst({
      where: {
        id,
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
  },
  create: (input: {
    creatorId: string;
    assigneeId?: string | undefined;
    title: string;
    description?: string | undefined;
    status: 'todo' | 'in_progress' | 'blocked' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate?: Date | undefined;
    dueDate?: Date | undefined;
  }) => {
    const data: {
      creatorId: string;
      assigneeId?: string;
      title: string;
      description?: string | null;
      status: 'todo' | 'in_progress' | 'blocked' | 'completed';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      startDate?: Date | null;
      dueDate?: Date | null;
    } = {
      creatorId: input.creatorId,
      title: input.title,
      status: input.status,
      priority: input.priority,
    };
    if (input.assigneeId) data.assigneeId = input.assigneeId;
    if (input.description !== undefined) data.description = input.description;
    if (input.startDate !== undefined) data.startDate = input.startDate;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate;

    return db.task.create({ data });
  },
  update: (id: string, data: Record<string, unknown>) => {
    return db.task.update({
      where: { id },
      data,
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
  },
  remove: (id: string) => {
    return db.task.delete({ where: { id } });
  },
  replaceTags: async (taskId: string, tags: string[]) => {
    await db.taskTag.deleteMany({ where: { taskId } });
    if (!tags.length) {
      return;
    }

    await Promise.all(
      tags.map(async (name) => {
        const tag = await db.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });

        await db.taskTag.create({
          data: {
            taskId,
            tagId: tag.id,
          },
        });
      }),
    );
  },
};
