import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const nameError = name.trim().length === 0
        ? t('profile.error.nameRequired')
        : name.trim().length < 2
            ? t('profile.error.nameMin')
            : '';
    const emailError = email.trim().length === 0
        ? t('profile.error.emailRequired')
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? ''
            : t('profile.error.emailInvalid');
    const passwordError = newPassword.length > 0 && newPassword.length < 8 ? t('profile.error.passwordMin') : '';
    const canSave = !nameError && !emailError && !passwordError;
    return (_jsxs("section", { className: "mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('settings.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('settings.subtitle') })] }), _jsxs("article", { className: "space-y-4 rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsx("h2", { className: "text-sm font-semibold", children: t('settings.profile') }), _jsxs("div", { className: "grid gap-2 rounded-lg border border-border/70 bg-card/40 p-3", children: [_jsx("label", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('profile.nameLabel') }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5", children: [_jsx(UserRound, { size: 14, className: "text-muted-foreground" }), _jsx("input", { value: name, onChange: (event) => setName(event.target.value), placeholder: t('profile.namePlaceholder'), className: "h-9 w-full bg-transparent text-sm outline-none" })] }), nameError ? _jsx("p", { className: "text-xs text-muted-foreground", children: nameError }) : null, _jsx("label", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('profile.usernameLabel') }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5", children: [_jsx(UserRound, { size: 14, className: "text-muted-foreground" }), _jsx("input", { value: username, onChange: (event) => setUsername(event.target.value), placeholder: t('profile.usernamePlaceholder'), className: "h-9 w-full bg-transparent text-sm outline-none" })] }), _jsx("label", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('profile.emailLabel') }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5", children: [_jsx(Mail, { size: 14, className: "text-muted-foreground" }), _jsx("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: t('profile.emailPlaceholder'), className: "h-9 w-full bg-transparent text-sm outline-none" })] }), emailError ? _jsx("p", { className: "text-xs text-muted-foreground", children: emailError }) : null] }), _jsxs("div", { className: "grid gap-2 rounded-lg border border-border/70 bg-card/40 p-3", children: [_jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('profile.passwordSection') }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5", children: [_jsx(Lock, { size: 14, className: "text-muted-foreground" }), _jsx("input", { type: "password", value: currentPassword, onChange: (event) => setCurrentPassword(event.target.value), placeholder: t('profile.currentPassword'), className: "h-9 w-full bg-transparent text-sm outline-none" })] }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5", children: [_jsx(Lock, { size: 14, className: "text-muted-foreground" }), _jsx("input", { type: "password", value: newPassword, onChange: (event) => setNewPassword(event.target.value), placeholder: t('profile.newPassword'), className: "h-9 w-full bg-transparent text-sm outline-none" })] }), passwordError ? _jsx("p", { className: "text-xs text-muted-foreground", children: passwordError }) : null, _jsx("p", { className: "text-xs text-muted-foreground", children: t('profile.passwordHelp') })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", disabled: !canSave, onClick: () => {
                                const nextName = username.trim() && name.trim() === (user?.fullName?.trim() ?? '') ? username.trim() : name.trim();
                                updateUser({ fullName: nextName, email: email.trim() });
                                toast.success(t('profile.saved'));
                                setCurrentPassword('');
                                setNewPassword('');
                            }, className: "h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60", children: t('common.save') }) })] }), _jsxs("article", { className: "space-y-3 rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsx("h2", { className: "text-sm font-semibold", children: t('settings.preferences') }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(ThemeToggle, {}), _jsx(LanguageSwitcher, {})] })] }), _jsxs("article", { className: "rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsx("h2", { className: "text-sm font-semibold", children: t('settings.workspace') }), _jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: t('settings.workspaceHint') })] })] }));
};
