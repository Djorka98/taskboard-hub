import { api } from '@/lib/api-client';

export type NoteEntity = {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string | null;
  label: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  color?: string;
  label?: string;
  pinned: boolean;
};

export type UpdateNoteInput = Partial<CreateNoteInput>;

export const notesApi = {
  getAll: async () => {
    const response = await api.get<NoteEntity[]>('/notes');
    return response.data;
  },
  create: async (payload: CreateNoteInput) => {
    const response = await api.post<NoteEntity>('/notes', payload);
    return response.data;
  },
  update: async (id: string, payload: UpdateNoteInput) => {
    const response = await api.patch<NoteEntity>(`/notes/${id}`, payload);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/notes/${id}`);
    return response.data;
  },
};
