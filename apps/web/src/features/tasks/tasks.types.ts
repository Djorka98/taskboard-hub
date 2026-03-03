import type { TaskPriority, TaskStatus } from '@nexus/types';

export type BoardColumn = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';

export type TaskEntity = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  assigneeId: string | null;
  creatorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  assigneeId?: string;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
