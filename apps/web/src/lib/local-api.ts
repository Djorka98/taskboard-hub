import { AxiosHeaders } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import type { AuthUser } from '@nexus/types';
import type { CreateNoteInput, NoteEntity, UpdateNoteInput } from '@/features/notes/notes.api';
import type { CreateTaskInput, TaskEntity, UpdateTaskInput } from '@/features/tasks/tasks.types';

// Local storage-backed API adapter for offline/local mode.
// Mirrors state in both sessionStorage (active tab) and localStorage (persistence across reloads).

const STORAGE_KEY = 'nexus:local:state';

type LocalState = {
  tasks: TaskEntity[];
  notes: NoteEntity[];
  user: AuthUser | null;
  accessToken: string | null;
};

const nowIso = () => new Date().toISOString();

const defaultUser = (email: string, fullName?: string): AuthUser => ({
  id: 'local-user',
  email,
  fullName: fullName ?? email.split('@')[0] ?? 'Local User',
  role: 'member',
});

const readState = (): LocalState => {
  const sessionRaw = sessionStorage.getItem(STORAGE_KEY);
  const localRaw = localStorage.getItem(STORAGE_KEY);
  const source = sessionRaw ?? localRaw;
  if (!source) return { tasks: [], notes: [], user: null, accessToken: null };
  try {
    const parsed = JSON.parse(source) as LocalState;
    return {
      tasks: parsed.tasks ?? [],
      notes: parsed.notes ?? [],
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
    } satisfies LocalState;
  } catch {
    return { tasks: [], notes: [], user: null, accessToken: null };
  }
};

const writeState = (state: LocalState) => {
  const serialized = JSON.stringify(state);
  sessionStorage.setItem(STORAGE_KEY, serialized);
  localStorage.setItem(STORAGE_KEY, serialized);
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

const createNote = (payload: CreateNoteInput): NoteEntity => {
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    userId: 'local-user',
    title: payload.title,
    content: payload.content,
    color: payload.color ?? null,
    label: payload.label ?? null,
    pinned: payload.pinned ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const updateNote = (existing: NoteEntity, payload: UpdateNoteInput): NoteEntity => {
  return {
    ...existing,
    ...payload,
    updatedAt: nowIso(),
  };
};

const buildResponse = <T>(data: T): AxiosResponse<T> => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  } satisfies AxiosResponse<T>;
};

export class LocalApiAdapter {
  get<T = any, R = AxiosResponse<T>>(url: string, _config?: AxiosRequestConfig): Promise<R> {
    const state = readState();

    if (url === '/tasks') {
      return Promise.resolve(buildResponse(state.tasks as T) as R);
    }

    if (url === '/notes') {
      return Promise.resolve(buildResponse(state.notes as T) as R);
    }

    if (url === '/auth/me') {
      if (!state.user) return Promise.reject(new Error('Unauthorized'));
      return Promise.resolve(buildResponse({ user: state.user } as T) as R);
    }

    return Promise.reject(new Error(`Local API GET not implemented for ${url}`));
  }

  post<T = any, R = AxiosResponse<T>>(url: string, body?: unknown, _config?: AxiosRequestConfig): Promise<R> {
    const state = readState();

    if (url === '/tasks') {
      const task = createTask(body as CreateTaskInput);
      const next = [...state.tasks, task];
      writeState({ ...state, tasks: next });
      return Promise.resolve(buildResponse(task as T) as R);
    }

    if (url === '/notes') {
      const note = createNote(body as CreateNoteInput);
      const next = [...state.notes, note];
      writeState({ ...state, notes: next });
      return Promise.resolve(buildResponse(note as T) as R);
    }

    if (url === '/auth/login' || url === '/auth/register') {
      const { email, fullName } = (body ?? {}) as { email?: string; fullName?: string };
      const user = defaultUser(email ?? 'user@example.com', fullName);
      const accessToken = crypto.randomUUID();
      writeState({ ...state, user, accessToken });
      return Promise.resolve(buildResponse({ accessToken, user } as T) as R);
    }

    if (url === '/auth/refresh') {
      if (!state.user || !state.accessToken) {
        return Promise.reject(new Error('Unauthorized'));
      }
      const accessToken = state.accessToken ?? crypto.randomUUID();
      writeState({ ...state, accessToken });
      return Promise.resolve(buildResponse({ accessToken, user: state.user } as T) as R);
    }

    if (url === '/auth/logout') {
      writeState({ ...state, accessToken: null });
      return Promise.resolve(buildResponse({ message: 'Logged out' } as T) as R);
    }

    return Promise.reject(new Error(`Local API POST not implemented for ${url}`));
  }

  patch<T = any, R = AxiosResponse<T>>(url: string, body?: unknown, _config?: AxiosRequestConfig): Promise<R> {
    const state = readState();

    if (url.startsWith('/tasks/')) {
      const id = url.replace('/tasks/', '');
      const idx = state.tasks.findIndex((item) => item.id === id);
      if (idx === -1) return Promise.reject(new Error('Task not found'));
      const existing = state.tasks[idx];
      if (!existing) return Promise.reject(new Error('Task not found'));
      const updated = updateTask(existing, body as UpdateTaskInput);
      const next = [...state.tasks];
      next[idx] = updated;
      writeState({ ...state, tasks: next });
      return Promise.resolve(buildResponse(updated as T) as R);
    }

    if (url.startsWith('/notes/')) {
      const id = url.replace('/notes/', '');
      const idx = state.notes.findIndex((item) => item.id === id);
      if (idx === -1) return Promise.reject(new Error('Note not found'));
      const existing = state.notes[idx];
      if (!existing) return Promise.reject(new Error('Note not found'));
      const updated = updateNote(existing, body as UpdateNoteInput);
      const next = [...state.notes];
      next[idx] = updated;
      writeState({ ...state, notes: next });
      return Promise.resolve(buildResponse(updated as T) as R);
    }

    return Promise.reject(new Error(`Local API PATCH not implemented for ${url}`));
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, _config?: AxiosRequestConfig): Promise<R> {
    const state = readState();

    if (url.startsWith('/tasks/')) {
      const id = url.replace('/tasks/', '');
      const next = state.tasks.filter((item) => item.id !== id);
      writeState({ ...state, tasks: next });
      return Promise.resolve(buildResponse({ message: 'Task deleted' } as T) as R);
    }

    if (url.startsWith('/notes/')) {
      const id = url.replace('/notes/', '');
      const next = state.notes.filter((item) => item.id !== id);
      writeState({ ...state, notes: next });
      return Promise.resolve(buildResponse({ message: 'Note deleted' } as T) as R);
    }

    return Promise.reject(new Error(`Local API DELETE not implemented for ${url}`));
  }
}
