import { api } from '@/lib/api-client';

export type ActivityEntity = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  taskId: string | null;
  eventId: string | null;
  noteId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export const activityApi = {
  getAll: async () => {
    const response = await api.get<ActivityEntity[]>('/activity');
    return response.data;
  },
};
