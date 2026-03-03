import { api } from '@/lib/api-client';
export const eventsApi = {
    getAll: async () => {
        const response = await api.get('/events');
        return response.data;
    },
    create: async (payload) => {
        const response = await api.post('/events', payload);
        return response.data;
    },
    update: async (id, payload) => {
        const response = await api.patch(`/events/${id}`, payload);
        return response.data;
    },
    remove: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },
};
