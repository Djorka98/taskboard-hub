import { api } from '@/lib/api-client';

export type EventEntity = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  category: string;
  reminderMinutes: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventInput = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  category: string;
  reminderMinutes?: number;
};

export type UpdateEventInput = Partial<CreateEventInput>;

export const eventsApi = {
  getAll: async () => {
    const response = await api.get<EventEntity[]>('/events');
    return response.data;
  },
  create: async (payload: CreateEventInput) => {
    const response = await api.post<EventEntity>('/events', payload);
    return response.data;
  },
  update: async (id: string, payload: UpdateEventInput) => {
    const response = await api.patch<EventEntity>(`/events/${id}`, payload);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/events/${id}`);
    return response.data;
  },
};
