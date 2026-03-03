import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { authApi } from '@/features/auth/auth.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
const loginSchemaFactory = (t) => z.object({
    email: z.string().email(t('auth.emailInvalid')),
    password: z.string().min(8, t('auth.passwordMin')),
});
export const LoginPage = () => {
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const loginSchema = useMemo(() => loginSchemaFactory(t), [t]);
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setSession({ user: data.user, accessToken: data.accessToken });
            toast.success(t('auth.loginSuccess'));
            navigate('/dashboard', { replace: true });
        },
        onError: () => {
            toast.error(t('auth.invalidCredentials'));
        },
    });
    const onSubmit = (values) => {
        loginMutation.mutate(values);
    };
    return (_jsxs("div", { className: "relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6", children: [_jsxs("div", { className: "absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4", children: [_jsx(LanguageSwitcher, { compact: true }), _jsx(ThemeToggle, {})] }), _jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border/80 bg-card/80 p-6 pt-8 shadow-panel sm:p-8", children: [_jsx("h1", { className: "text-2xl font-semibold", children: t('auth.welcomeBack') }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t('auth.signInSubtitle') }), _jsxs("form", { className: "mt-6 space-y-4", onSubmit: form.handleSubmit(onSubmit), children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-1 block text-sm text-muted-foreground", children: t('auth.email') }), _jsx("input", { id: "email", type: "email", className: "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary transition focus:ring-1", placeholder: t('auth.emailPlaceholder'), ...form.register('email') }), form.formState.errors.email && (_jsx("p", { className: "mt-1 text-xs text-red-400", children: form.formState.errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "mb-1 block text-sm text-muted-foreground", children: t('auth.password') }), _jsxs("div", { className: "relative", children: [_jsx("input", { id: "password", type: showPassword ? 'text' : 'password', className: "h-10 w-full rounded-lg border border-border bg-background px-3 pr-20 text-sm outline-none ring-primary transition focus:ring-1", placeholder: t('auth.passwordPlaceholder'), ...form.register('password') }), _jsxs("button", { type: "button", onClick: () => setShowPassword((current) => !current), className: "absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground", children: [showPassword ? _jsx(EyeOff, { size: 14 }) : _jsx(Eye, { size: 14 }), showPassword ? t('auth.hidePassword') : t('auth.showPassword')] })] }), form.formState.errors.password && (_jsx("p", { className: "mt-1 text-xs text-red-400", children: form.formState.errors.password.message }))] }), _jsxs("button", { type: "submit", disabled: loginMutation.isPending, className: "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60", children: [loginMutation.isPending && _jsx(Loader2, { size: 16, className: "animate-spin" }), t('auth.signIn')] })] }), _jsxs("p", { className: "mt-4 text-sm text-muted-foreground", children: [t('auth.noAccount'), ' ', _jsx(Link, { to: "/register", className: "text-primary hover:underline", children: t('auth.createOne') })] })] })] }));
};
