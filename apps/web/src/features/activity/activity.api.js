import { api } from '@/lib/api-client';
export const activityApi = {
    getAll: async () => {
        const response = await api.get('/activity');
        return response.data;
    },
};
