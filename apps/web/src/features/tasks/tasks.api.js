import { api } from '@/lib/api-client';
const omitStartDate = (payload) => {
    const nextPayload = { ...payload };
    delete nextPayload.startDate;
    return nextPayload;
};
export const tasksApi = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },
    create: async (payload) => {
        try {
            const response = await api.post('/tasks', payload);
            return response.data;
        }
        catch (error) {
            if (payload.startDate) {
                const response = await api.post('/tasks', omitStartDate(payload));
                return response.data;
            }
            throw error;
        }
    },
    update: async (id, payload) => {
        try {
            const response = await api.patch(`/tasks/${id}`, payload);
            return response.data;
        }
        catch (error) {
            if (payload.startDate) {
                const response = await api.patch(`/tasks/${id}`, omitStartDate(payload));
                return response.data;
            }
            throw error;
        }
    },
    remove: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },
};
