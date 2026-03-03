import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, CalendarDays, ChevronDown, Command, LayoutDashboard, ListChecks, Menu, Notebook, Search, Settings2, SquareKanban, TimerReset, } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { NavLink, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { CommandPalette } from '@/components/layout/command-palette';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { activityApi } from '@/features/activity/activity.api';
import { authApi } from '@/features/auth/auth.api';
import { notesApi } from '@/features/notes/notes.api';
import { tasksApi } from '@/features/tasks/tasks.api';
import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useBoardsStore } from '@/stores/boards.store';
import { useUiStore } from '@/stores/ui.store';
const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/boards', labelKey: 'nav.boards', icon: SquareKanban },
    { to: '/my-tasks', labelKey: 'nav.myTasks', icon: ListChecks },
    { to: '/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
    { to: '/notes', labelKey: 'nav.notes', icon: Notebook },
    { to: '/activity', labelKey: 'nav.activity', icon: TimerReset },
    { to: '/settings', labelKey: 'nav.settings', icon: Settings2 },
];
const topbarTitleKeys = {
    '/dashboard': 'page.dashboard',
    '/boards': 'page.boards',
    '/my-tasks': 'page.myTasks',
    '/calendar': 'page.calendar',
    '/notes': 'page.notes',
    '/activity': 'page.activity',
    '/settings': 'page.settings',
};
export const AppShell = () => {
    const { t, language } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
    const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
    const toggleSidebar = useUiStore((state) => state.toggleSidebar);
    const commandPaletteOpen = useUiStore((state) => state.commandPaletteOpen);
    const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
    const searchQuery = useUiStore((state) => state.searchQuery);
    const setSearchQuery = useUiStore((state) => state.setSearchQuery);
    const theme = useUiStore((state) => state.theme);
    const clearSession = useAuthStore((state) => state.clearSession);
    const user = useAuthStore((state) => state.user);
    const setActiveBoardUser = useBoardsStore((state) => state.setActiveUser);
    const userScope = user?.id ?? 'guest';
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [lastSeenActivityAt, setLastSeenActivityAt] = useState(() => localStorage.getItem(`nexus:last-seen-activity-at:${userScope}`) ?? '');
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    const activityQuery = useQuery({
        queryKey: ['activity', userScope],
        queryFn: activityApi.getAll,
        refetchInterval: 5000,
        staleTime: 3000,
        enabled: Boolean(user?.id),
    });
    const tasksQuery = useQuery({
        queryKey: ['tasks', userScope],
        queryFn: tasksApi.getAll,
        enabled: searchQuery.trim().length > 0,
        staleTime: 20_000,
    });
    const notesQuery = useQuery({
        queryKey: ['notes', userScope],
        queryFn: notesApi.getAll,
        enabled: searchQuery.trim().length > 0,
        staleTime: 20_000,
    });
    const userInitials = useMemo(() => {
        const fullName = user?.fullName?.trim();
        if (!fullName)
            return 'NA';
        const parts = fullName.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    }, [user?.fullName]);
    const currentTitle = t(topbarTitleKeys[location.pathname] ?? 'page.default');
    const workspaceTitle = t('workspace.title');
    useEffect(() => {
        document.title = `${currentTitle} · ${workspaceTitle}`;
    }, [currentTitle, workspaceTitle]);
    const unreadNotifications = useMemo(() => {
        const items = activityQuery.data ?? [];
        if (!lastSeenActivityAt) {
            return Math.min(items.length, 99);
        }
        const seenTime = new Date(lastSeenActivityAt).getTime();
        const unread = items.filter((item) => new Date(item.createdAt).getTime() > seenTime).length;
        return Math.min(unread, 99);
    }, [activityQuery.data, lastSeenActivityAt]);
    const searchSuggestions = useMemo(() => {
        const value = searchQuery.trim().toLowerCase();
        if (!value)
            return [];
        const taskMatches = (tasksQuery.data ?? [])
            .filter((task) => `${task.title} ${task.description ?? ''} ${task.tags.join(' ')}`.toLowerCase().includes(value))
            .slice(0, 4)
            .map((task) => ({
            id: `task-${task.id}`,
            label: task.title,
            meta: t('nav.myTasks'),
            action: () => {
                navigate('/dashboard');
                window.dispatchEvent(new CustomEvent('nexus:open-task', { detail: { taskId: task.id } }));
            },
        }));
        const noteMatches = (notesQuery.data ?? [])
            .filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(value))
            .slice(0, 3)
            .map((note) => ({
            id: `note-${note.id}`,
            label: note.title,
            meta: t('nav.notes'),
            action: () => navigate('/notes'),
        }));
        const memberMatches = user && `${user.fullName} ${user.email}`.toLowerCase().includes(value)
            ? [
                {
                    id: `member-${user.id}`,
                    label: user.fullName,
                    meta: t('topbar.profile'),
                    action: () => setProfileModalOpen(true),
                },
            ]
            : [];
        return [...taskMatches, ...noteMatches, ...memberMatches].slice(0, 8);
    }, [searchQuery, tasksQuery.data, notesQuery.data, user, navigate, t]);
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
        }
    }, [setSidebarCollapsed]);
    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setCommandPaletteOpen(!commandPaletteOpen);
            }
            if (event.key === 'Escape' && commandPaletteOpen) {
                setCommandPaletteOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [commandPaletteOpen, setCommandPaletteOpen]);
    useEffect(() => {
        const onPointerDown = (event) => {
            if (!userMenuRef.current?.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (!searchRef.current?.contains(event.target)) {
                setSearchFocused(false);
            }
        };
        const onEscape = (event) => {
            if (event.key === 'Escape') {
                setUserMenuOpen(false);
                setProfileModalOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);
    useEffect(() => {
        setActiveBoardUser(user?.id);
    }, [setActiveBoardUser, user?.id]);
    useEffect(() => {
        setLastSeenActivityAt(localStorage.getItem(`nexus:last-seen-activity-at:${userScope}`) ?? '');
    }, [userScope]);
    useEffect(() => {
        if (location.pathname !== '/activity')
            return;
        const latest = activityQuery.data?.[0]?.createdAt;
        if (!latest)
            return;
        localStorage.setItem(`nexus:last-seen-activity-at:${userScope}`, latest);
        setLastSeenActivityAt(latest);
    }, [location.pathname, activityQuery.data, userScope]);
    const handleLogout = async () => {
        try {
            await authApi.logout();
        }
        catch {
            toast.error(t('topbar.logoutFailed'));
        }
        clearSession();
        navigate('/login', { replace: true });
    };
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-background", children: [!sidebarCollapsed && (_jsx("button", { type: "button", onClick: () => setSidebarCollapsed(true), className: "fixed inset-0 z-30 bg-background/50 backdrop-blur-sm lg:hidden", "aria-label": "Close navigation" })), _jsxs("aside", { className: cn('fixed inset-y-0 left-0 z-40 border-r border-border/80 bg-card/65 backdrop-blur transition-all duration-300 lg:static lg:z-auto', sidebarCollapsed ? 'p-2' : 'p-3', sidebarCollapsed ? '-translate-x-full lg:w-[84px] lg:translate-x-0' : 'w-[260px] translate-x-0 lg:w-[260px]'), children: [_jsx("div", { className: cn('rounded-xl border border-border/70 bg-background/45', sidebarCollapsed ? 'mb-3 p-2' : 'mb-4 p-3'), children: _jsxs("div", { className: "flex items-center justify-between", children: [!sidebarCollapsed && (_jsxs("div", { children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: t('workspace.label') }), _jsx("p", { className: "font-semibold tracking-tight", children: t('workspace.title') })] })), sidebarCollapsed && _jsx("span", { className: "mx-auto text-sm font-semibold leading-none", children: "NX" }), _jsx("button", { onClick: toggleSidebar, className: cn('rounded-md hover:bg-muted', sidebarCollapsed ? 'p-1.5' : 'p-2'), "aria-label": "Toggle sidebar", children: _jsx(Menu, { size: 16 }) })] }) }), !sidebarCollapsed && (_jsx("p", { className: "mb-2 px-2 text-[11px] uppercase tracking-wider text-muted-foreground", children: t('workspace.navigation') })), _jsx("nav", { className: cn('space-y-1', sidebarCollapsed && 'space-y-1.5'), children: navItems.map((item) => {
                            const Icon = item.icon;
                            return (_jsx(NavLink, { to: item.to, onClick: () => {
                                    if (window.innerWidth < 1024) {
                                        setSidebarCollapsed(true);
                                    }
                                }, className: ({ isActive }) => cn('group rounded-lg text-sm text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground', sidebarCollapsed
                                    ? 'mx-auto flex h-10 w-10 items-center justify-center px-0 py-0'
                                    : 'flex items-center justify-between px-3 py-2', isActive && 'border border-primary/30 bg-primary/12 text-foreground shadow-panel'), children: _jsxs("span", { className: cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-2'), children: [_jsx(Icon, { size: 16 }), !sidebarCollapsed && _jsx("span", { children: t(item.labelKey) })] }) }, item.to));
                        }) })] }), _jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [_jsx("header", { className: "sticky top-0 z-20 border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur sm:px-4 lg:px-5", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2.5", children: [_jsxs("div", { className: "min-w-0 flex-1 sm:min-w-[220px] lg:flex-none", children: [_jsx("button", { type: "button", onClick: toggleSidebar, className: "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground hover:bg-muted lg:hidden", children: _jsx(Menu, { size: 15 }) }), _jsx("p", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: t('topbar.workspace') }), _jsx("div", { className: "font-medium tracking-tight", children: currentTitle })] }), _jsxs("div", { className: "flex w-full flex-wrap items-center justify-start gap-2 sm:justify-end lg:w-auto lg:flex-nowrap", children: [_jsxs("div", { ref: searchRef, className: "relative hidden lg:block", children: [_jsxs("label", { className: "h-9 min-w-64 items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-3 text-muted-foreground lg:inline-flex", children: [_jsx(Search, { size: 15 }), _jsx("input", { type: "search", value: searchQuery, onFocus: () => setSearchFocused(true), onChange: (event) => setSearchQuery(event.target.value), placeholder: t('topbar.searchPlaceholder'), className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" })] }), searchFocused && searchQuery.trim().length > 0 ? (_jsx("div", { className: "absolute right-0 top-11 z-30 w-[min(420px,60vw)] rounded-lg border border-border/70 bg-card p-2 shadow-panel", children: searchSuggestions.length > 0 ? (_jsx("ul", { className: "space-y-1", children: searchSuggestions.map((item) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => {
                                                                    item.action();
                                                                    setSearchFocused(false);
                                                                }, className: "w-full rounded-md px-2 py-1.5 text-left hover:bg-muted/70", children: [_jsx("p", { className: "text-sm text-foreground", children: item.label }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: item.meta })] }) }, item.id))) })) : (_jsx("p", { className: "px-2 py-1.5 text-xs text-muted-foreground", children: t('topbar.searchNoResults') })) })) : null] }), _jsx("button", { type: "button", onClick: () => navigate('/calendar'), className: "hidden h-9 shrink-0 items-center rounded-full border border-border/70 bg-background/25 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex", children: t('topbar.thisWeek') }), _jsxs("button", { type: "button", onClick: () => setCommandPaletteOpen(true), className: "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 text-sm transition-colors hover:bg-muted", children: [_jsx(Command, { size: 15 }), _jsx("span", { className: "hidden xl:inline", children: t('topbar.command') }), _jsx("span", { className: "hidden rounded border border-border/70 px-1.5 py-0.5 text-[11px] text-muted-foreground md:inline", children: "Ctrl+K" })] }), _jsx(LanguageSwitcher, {}), _jsx(ThemeToggle, {}), _jsxs("button", { type: "button", onClick: () => navigate('/activity'), className: "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 transition-colors hover:bg-muted", "aria-label": t('topbar.notifications'), children: [_jsx(Bell, { size: 16 }), unreadNotifications > 0 ? (_jsx("span", { className: "absolute -right-1 -top-1 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground", children: unreadNotifications })) : null] }), _jsxs("div", { ref: userMenuRef, className: "relative shrink-0", children: [_jsxs("button", { type: "button", onClick: () => setUserMenuOpen((current) => !current), className: "inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border/70 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: [_jsx("span", { className: "inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted/60 text-xs font-semibold", children: userInitials }), _jsx(ChevronDown, { size: 14 })] }), userMenuOpen ? (_jsxs("div", { className: "absolute right-0 top-11 w-44 rounded-lg border border-border/70 bg-card p-2 shadow-panel", children: [_jsx("button", { type: "button", onClick: () => {
                                                                setProfileModalOpen(true);
                                                                setUserMenuOpen(false);
                                                            }, className: "w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: t('topbar.profile') }), _jsx("button", { type: "button", onClick: handleLogout, className: "mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: t('topbar.logout') })] })) : null] })] })] }) }), _jsx("main", { className: "flex min-h-0 flex-1 items-start overflow-y-auto p-3 sm:p-4 lg:p-5", children: _jsx(Outlet, {}) })] }), profileModalOpen ? (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("button", { type: "button", onClick: () => setProfileModalOpen(false), className: "absolute inset-0 bg-background/55 backdrop-blur-sm", "aria-label": "Close profile modal" }), _jsxs("div", { className: "relative z-10 w-full max-w-md rounded-2xl border border-border/70 bg-card/95 p-4 shadow-panel", children: [_jsx("h3", { className: "text-lg font-semibold tracking-tight", children: t('topbar.profile') }), _jsx("p", { className: "text-xs text-muted-foreground", children: t('profile.modalSubtitle') }), _jsxs("div", { className: "space-y-3 pt-3", children: [_jsxs("div", { className: "rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/60 text-sm font-semibold", children: userInitials }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: user?.fullName ?? t('profile.defaultName') }), _jsx("p", { className: "text-xs text-muted-foreground", children: user?.email ?? t('profile.defaultEmail') })] })] }), _jsxs("div", { className: "grid gap-1 text-xs text-muted-foreground", children: [_jsxs("p", { children: [t('profile.modalRole'), ": ", t('profile.modalRoleValue')] }), _jsxs("p", { children: [t('profile.modalCurrentView'), ": ", currentTitle] }), _jsxs("p", { children: [t('profile.modalLanguage'), ": ", language.toUpperCase()] }), _jsxs("p", { children: [t('profile.modalTheme'), ": ", theme === 'dark' ? t('theme.dark') : t('theme.light')] }), _jsxs("p", { children: [t('profile.modalNotifications'), ": ", unreadNotifications] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                    setProfileModalOpen(false);
                                                    navigate('/activity');
                                                }, className: "h-9 rounded-md border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: t('nav.activity') }), _jsx("button", { type: "button", onClick: () => {
                                                    setProfileModalOpen(false);
                                                    navigate('/settings');
                                                }, className: "h-9 rounded-md border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: t('nav.settings') }), _jsx("button", { type: "button", onClick: () => setProfileModalOpen(false), className: "h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground", children: t('common.close') })] })] })] })] })) : null, _jsx(CommandPalette, {})] }));
};
