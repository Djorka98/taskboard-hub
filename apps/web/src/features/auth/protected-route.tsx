import { Navigate, Outlet } from 'react-router-dom';

import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';

export const ProtectedRoute = () => {
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  if (!isBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {t('auth.loadingSession')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
