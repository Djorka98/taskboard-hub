import { api } from '@/lib/api-client';
import type { CreateTaskInput, TaskEntity, UpdateTaskInput } from '@/features/tasks/tasks.types';

const omitStartDate = <T extends { startDate?: string }>(payload: T): Omit<T, 'startDate'> => {
  const nextPayload = { ...payload } as Partial<T>;
  delete nextPayload.startDate;
  return nextPayload as Omit<T, 'startDate'>;
};

export const tasksApi = {
  getAll: async () => {
    const response = await api.get<TaskEntity[]>('/tasks');
    return response.data;
  },
  create: async (payload: CreateTaskInput) => {
    try {
      const response = await api.post<TaskEntity>('/tasks', payload);
      return response.data;
    } catch (error) {
      if (payload.startDate) {
        const response = await api.post<TaskEntity>('/tasks', omitStartDate(payload));
        return response.data;
      }
      throw error;
    }
  },
  update: async (id: string, payload: UpdateTaskInput) => {
    try {
      const response = await api.patch<TaskEntity>(`/tasks/${id}`, payload);
      return response.data;
    } catch (error) {
      if (payload.startDate) {
        const response = await api.patch<TaskEntity>(`/tasks/${id}`, omitStartDate(payload as UpdateTaskInput & { startDate: string }));
        return response.data;
      }
      throw error;
    }
  },
  remove: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};
