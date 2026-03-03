import { ApiError } from '../../core/api-error.js';
import { auditService } from '../shared/audit.service.js';
import { tasksRepository } from './tasks.repository.js';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type CreateTaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  assigneeId?: string;
};

type UpdateTaskInput = Partial<CreateTaskInput>;

const ensureUserId = (userId: string) => {
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }
};

const isStartDateRuntimeIssue = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('startdate') || message.includes('p2022') || message.includes('unknown argument');
};

const normalizeTask = (task: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  assigneeId: string | null;
  creatorId: string;
  tags: Array<{ tag: { name: string } }>;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate,
    dueDate: task.dueDate,
    assigneeId: task.assigneeId,
    creatorId: task.creatorId,
    tags: task.tags.map((item) => item.tag.name),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

export const tasksService = {
  getAll: async (userId: string) => {
    ensureUserId(userId);
    const tasks = await tasksRepository.findManyByUser(userId);
    return tasks.map(normalizeTask);
  },
  create: async (userId: string, input: CreateTaskInput) => {
    ensureUserId(userId);

    let task;
    try {
      task = await tasksRepository.create({
        creatorId: userId,
        assigneeId: input.assigneeId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });
    } catch (error) {
      if (!input.startDate || !isStartDateRuntimeIssue(error)) {
        throw error;
      }

      task = await tasksRepository.create({
        creatorId: userId,
        assigneeId: input.assigneeId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });
    }

    await tasksRepository.replaceTags(task.id, input.tags);
    const withTags = await tasksRepository.findByIdForUser(task.id, userId);
    if (!withTags) {
      throw new ApiError(500, 'Task creation failed');
    }

    await auditService.logActivity({
      actorId: userId,
      action: 'task_created',
      entityType: 'task',
      taskId: task.id,
      metadata: { title: task.title },
    });

    await auditService.createNotification({
      userId,
      type: 'task_updated',
      title: 'Task created',
      message: `Task \"${task.title}\" created`,
      metadata: { taskId: task.id },
    });

    return normalizeTask(withTags);
  },
  getById: async (userId: string, id: string) => {
    ensureUserId(userId);
    const task = await tasksRepository.findByIdForUser(id, userId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return normalizeTask(task);
  },
  update: async (userId: string, id: string, input: UpdateTaskInput) => {
    ensureUserId(userId);
    const existing = await tasksRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Task not found');
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId;
    if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;

    try {
      await tasksRepository.update(id, data);
    } catch (error) {
      if (!(input.startDate !== undefined && isStartDateRuntimeIssue(error))) {
        throw error;
      }

      const { startDate: _startDate, ...rest } = data;
      await tasksRepository.update(id, rest);
    }
    if (input.tags !== undefined) {
      await tasksRepository.replaceTags(id, input.tags);
    }

    const updated = await tasksRepository.findByIdForUser(id, userId);
    if (!updated) {
      throw new ApiError(500, 'Task update failed');
    }

    await auditService.logActivity({
      actorId: userId,
      action: 'task_updated',
      entityType: 'task',
      taskId: id,
      metadata: { title: updated.title },
    });

    await auditService.createNotification({
      userId,
      type: 'task_updated',
      title: 'Task updated',
      message: `Task \"${updated.title}\" updated`,
      metadata: { taskId: id },
    });

    return normalizeTask(updated);
  },
  remove: async (userId: string, id: string) => {
    ensureUserId(userId);
    const existing = await tasksRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Task not found');
    }

    await tasksRepository.remove(id);
    await auditService.logActivity({
      actorId: userId,
      action: 'task_deleted',
      entityType: 'task',
      metadata: { taskId: id, title: existing.title },
    });

    return { message: 'Task deleted' };
  },
};
