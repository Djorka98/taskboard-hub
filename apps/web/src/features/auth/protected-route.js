import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
export const ProtectedRoute = () => {
    const { t } = useI18n();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
    if (!isBootstrapped) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground", children: t('auth.loadingSession') }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(Outlet, {});
};
