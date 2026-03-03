import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

const registerSchemaFactory = (t: (key: string) => string) =>
  z.object({
    fullName: z.string().min(2, t('auth.nameMin')),
    email: z.string().email(t('auth.emailInvalid')),
    password: z.string().min(8, t('auth.passwordMin')),
  });

type RegisterValues = {
  fullName: string;
  email: string;
  password: string;
};

export const RegisterPage = () => {
  const { t } = useI18n();
  const workspaceTitle = t('workspace.title');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const registerSchema = useMemo(() => registerSchemaFactory(t), [t]);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.accessToken });
      toast.success(t('auth.registerSuccess'));
      navigate('/dashboard', { replace: true });
    },
    onError: () => {
      toast.error(t('auth.registerError'));
    },
  });

  const onSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  useEffect(() => {
    document.title = `${t('auth.createAccount')} · ${workspaceTitle}`;
  }, [t, workspaceTitle]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/80 p-6 pt-8 shadow-panel sm:p-8">
        <h1 className="text-2xl font-semibold">{t('auth.createAccount')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm text-muted-foreground">
              {t('auth.fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary transition focus:ring-1"
              placeholder={t('auth.namePlaceholder')}
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-muted-foreground">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary transition focus:ring-1"
              placeholder={t('auth.emailPlaceholder')}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-muted-foreground">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-20 text-sm outline-none ring-primary transition focus:ring-1"
                placeholder={t('auth.passwordPlaceholder')}
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {t('auth.createAccountAction')}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};
