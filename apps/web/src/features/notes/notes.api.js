import { api } from '@/lib/api-client';
export const notesApi = {
    getAll: async () => {
        const response = await api.get('/notes');
        return response.data;
    },
    create: async (payload) => {
        const response = await api.post('/notes', payload);
        return response.data;
    },
    update: async (id, payload) => {
        const response = await api.patch(`/notes/${id}`, payload);
        return response.data;
    },
    remove: async (id) => {
        const response = await api.delete(`/notes/${id}`);
        return response.data;
    },
};
