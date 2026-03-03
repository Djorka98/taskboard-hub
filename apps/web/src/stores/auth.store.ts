import type { AuthUser } from '@nexus/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authApi } from '@/features/auth/auth.api';
import { setAccessToken } from '@/lib/api-client';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  setSession: (payload: { user: AuthUser; accessToken: string }) => void;
  updateUser: (payload: Partial<Pick<AuthUser, 'fullName' | 'email'>>) => void;
  clearSession: () => void;
  bootstrapSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isBootstrapped: false,
      setSession: ({ user, accessToken }) => {
        setAccessToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      updateUser: (payload) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...payload } });
      },
      clearSession: () => {
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false, isBootstrapped: true });
      },
      bootstrapSession: async () => {
        if (get().isBootstrapped) {
          return;
        }

        const existingToken = get().accessToken;
        if (existingToken) {
          setAccessToken(existingToken);
          try {
            const user = await authApi.me();
            set({ user, isAuthenticated: true, isBootstrapped: true });
            return;
          } catch {
            setAccessToken(null);
          }
        }

        try {
          const refreshed = await authApi.refresh();
          setAccessToken(refreshed.accessToken);
          set({
            user: refreshed.user,
            accessToken: refreshed.accessToken,
            isAuthenticated: true,
            isBootstrapped: true,
          });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false, isBootstrapped: true });
        }
      },
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    },
  ),
);
