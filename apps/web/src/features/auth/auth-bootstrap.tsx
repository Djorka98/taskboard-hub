import { useEffect } from 'react';

import { useAuthStore } from '@/stores/auth.store';

export const AuthBootstrap = () => {
  useEffect(() => {
    const pathname = window.location.pathname;
    const isPublicAuthRoute = pathname === '/login' || pathname === '/register';
    const hasLocalToken = Boolean(useAuthStore.getState().accessToken);

    if (isPublicAuthRoute && !hasLocalToken) {
      useAuthStore.setState({ isBootstrapped: true });
      return;
    }

    void useAuthStore.getState().bootstrapSession();
  }, []);

  return null;
};
