import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import type { CreateTaskInput, TaskEntity, UpdateTaskInput } from '@/features/tasks/tasks.types';

// Simple local storage-backed API adapter for offline/local mode.
// Stores data in sessionStorage and mirrors to localStorage for persistence across reloads.

const STORAGE_KEY = 'nexus:local:tasks';
const PERSIST_KEY = 'nexus:persist:tasks';

const nowIso = () => new Date().toISOString();

const readTasks = (): TaskEntity[] => {
  const sessionRaw = sessionStorage.getItem(STORAGE_KEY);
  const localRaw = localStorage.getItem(PERSIST_KEY);
  const source = sessionRaw ?? localRaw;
  if (!source) return [];
  try {
    const parsed = JSON.parse(source) as TaskEntity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTasks = (items: TaskEntity[]) => {
  const serialized = JSON.stringify(items);
  sessionStorage.setItem(STORAGE_KEY, serialized);
  localStorage.setItem(PERSIST_KEY, serialized);
};

const createTask = (payload: CreateTaskInput): TaskEntity => {
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    title: payload.title,
    description: payload.description ?? null,
    status: payload.status,
    priority: payload.priority,
    startDate: payload.startDate ?? null,
    dueDate: payload.dueDate ?? null,
    assigneeId: payload.assigneeId ?? null,
    creatorId: payload.assigneeId ?? 'local-user',
    tags: payload.tags ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const updateTask = (existing: TaskEntity, payload: UpdateTaskInput): TaskEntity => {
  return {
    ...existing,
    ...payload,
    description: payload.description ?? existing.description,
    startDate: payload.startDate ?? existing.startDate,
    dueDate: payload.dueDate ?? existing.dueDate,
    assigneeId: payload.assigneeId ?? existing.assigneeId,
    tags: payload.tags ?? existing.tags,
    updatedAt: nowIso(),
  };
};

type SupportedData = TaskEntity | TaskEntity[] | { message: string };

type LocalResponse<T = SupportedData> = Promise<AxiosResponse<T>>;

const buildResponse = <T extends SupportedData>(data: T): AxiosResponse<T> => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  } satisfies AxiosResponse<T>;
};

export class LocalApiAdapter {
  get<T = SupportedData>(url: string, _config?: AxiosRequestConfig): LocalResponse<T> {
    if (url === '/tasks') {
      return Promise.resolve(buildResponse(readTasks() as T));
    }
    return Promise.reject(new Error(`Local API GET not implemented for ${url}`));
  }

  post<T = SupportedData>(url: string, body?: unknown, _config?: AxiosRequestConfig): LocalResponse<T> {
    if (url === '/tasks') {
      const tasks = readTasks();
      const task = createTask(body as CreateTaskInput);
      tasks.push(task);
      writeTasks(tasks);
      return Promise.resolve(buildResponse(task as T));
    }
    return Promise.reject(new Error(`Local API POST not implemented for ${url}`));
  }

  patch<T = SupportedData>(url: string, body?: unknown, _config?: AxiosRequestConfig): LocalResponse<T> {
    if (url.startsWith('/tasks/')) {
      const id = url.replace('/tasks/', '');
      const tasks = readTasks();
      const idx = tasks.findIndex((item) => item.id === id);
      if (idx === -1) return Promise.reject(new Error('Task not found'));
      const updated = updateTask(tasks[idx], body as UpdateTaskInput);
      tasks[idx] = updated;
      writeTasks(tasks);
      return Promise.resolve(buildResponse(updated as T));
    }
    return Promise.reject(new Error(`Local API PATCH not implemented for ${url}`));
  }

  delete<T = SupportedData>(url: string, _config?: AxiosRequestConfig): LocalResponse<T> {
    if (url.startsWith('/tasks/')) {
      const id = url.replace('/tasks/', '');
      const tasks = readTasks();
      const next = tasks.filter((item) => item.id !== id);
      writeTasks(next);
      return Promise.resolve(buildResponse({ message: 'Task deleted' } as T));
    }
    return Promise.reject(new Error(`Local API DELETE not implemented for ${url}`));
  }
}
