import { Lock, Mail, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';

export const SettingsPage = () => {
  const { t } = useI18n();
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fullName = user?.fullName ?? '';
    setName(fullName);
    setUsername(fullName.toLowerCase().replace(/\s+/g, '.'));
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
  }, [user?.fullName, user?.email]);

  const nameError =
    name.trim().length === 0
      ? t('profile.error.nameRequired')
      : name.trim().length < 2
        ? t('profile.error.nameMin')
        : '';
  const emailError =
    email.trim().length === 0
      ? t('profile.error.emailRequired')
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? ''
        : t('profile.error.emailInvalid');
  const passwordError = newPassword.length > 0 && newPassword.length < 8 ? t('profile.error.passwordMin') : '';
  const canSave = !nameError && !emailError && !passwordError;

  return (
    <section className="mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <article className="space-y-4 rounded-xl border border-border/70 bg-background/25 p-3">
        <h2 className="text-sm font-semibold">{t('settings.profile')}</h2>

        <div className="grid gap-2 rounded-lg border border-border/70 bg-card/40 p-3">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('profile.nameLabel')}</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5">
            <UserRound size={14} className="text-muted-foreground" />
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('profile.namePlaceholder')} className="h-9 w-full bg-transparent text-sm outline-none" />
          </div>
          {nameError ? <p className="text-xs text-muted-foreground">{nameError}</p> : null}

          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('profile.usernameLabel')}</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5">
            <UserRound size={14} className="text-muted-foreground" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t('profile.usernamePlaceholder')} className="h-9 w-full bg-transparent text-sm outline-none" />
          </div>

          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('profile.emailLabel')}</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5">
            <Mail size={14} className="text-muted-foreground" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('profile.emailPlaceholder')} className="h-9 w-full bg-transparent text-sm outline-none" />
          </div>
          {emailError ? <p className="text-xs text-muted-foreground">{emailError}</p> : null}
        </div>

        <div className="grid gap-2 rounded-lg border border-border/70 bg-card/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('profile.passwordSection')}</p>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5">
            <Lock size={14} className="text-muted-foreground" />
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder={t('profile.currentPassword')} className="h-9 w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5">
            <Lock size={14} className="text-muted-foreground" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder={t('profile.newPassword')} className="h-9 w-full bg-transparent text-sm outline-none" />
          </div>
          {passwordError ? <p className="text-xs text-muted-foreground">{passwordError}</p> : null}
          <p className="text-xs text-muted-foreground">{t('profile.passwordHelp')}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              const nextName = username.trim() && name.trim() === (user?.fullName?.trim() ?? '') ? username.trim() : name.trim();
              updateUser({ fullName: nextName, email: email.trim() });
              toast.success(t('profile.saved'));
              setCurrentPassword('');
              setNewPassword('');
            }}
            className="h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        </div>
      </article>

      <article className="space-y-3 rounded-xl border border-border/70 bg-background/25 p-3">
        <h2 className="text-sm font-semibold">{t('settings.preferences')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </article>

      <article className="rounded-xl border border-border/70 bg-background/25 p-3">
        <h2 className="text-sm font-semibold">{t('settings.workspace')}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{t('settings.workspaceHint')}</p>
      </article>
    </section>
  );
};
