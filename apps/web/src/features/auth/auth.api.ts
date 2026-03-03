import type { AuthUser } from '@nexus/types';

import { api } from '@/lib/api-client';

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
  register: async (payload: { email: string; password: string; fullName: string }) => {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },
  refresh: async () => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },
  me: async () => {
    const response = await api.get<{ user: AuthUser }>('/auth/me');
    return response.data.user;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
};
