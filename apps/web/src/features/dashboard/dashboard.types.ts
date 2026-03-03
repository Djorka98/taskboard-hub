import type { TaskPriority, TaskStatus } from '@nexus/types';

import type { BoardColumn, TaskEntity } from '@/features/tasks/tasks.types';

export type TaskMember = {
  id: string;
  name: string;
  initials: string;
};

export type TaskItem = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  column: BoardColumn;
  priority: TaskPriority;
  labels: string[];
  startDate: string;
  dueDate: string;
  assignee: TaskMember;
  checklist: {
    completed: number;
    total: number;
  };
  comments: number;
  attachments: number;
  activity: string[];
  raw: TaskEntity;
};

