import { api } from '@/lib/api-client';
export const authApi = {
    login: async (payload) => {
        const response = await api.post('/auth/login', payload);
        return response.data;
    },
    register: async (payload) => {
        const response = await api.post('/auth/register', payload);
        return response.data;
    },
    refresh: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },
    me: async () => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },
    logout: async () => {
        await api.post('/auth/logout');
    },
};
