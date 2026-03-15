import {
  Bell,
  CalendarDays,
  ChevronDown,
  Command,
  LayoutDashboard,
  ListChecks,
  Menu,
  Notebook,
  Search,
  Settings2,
  SquareKanban,
  TimerReset,
} from 'lucide-react';
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

const topbarTitleKeys: Record<string, string> = {
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
  const [lastSeenActivityAt, setLastSeenActivityAt] = useState<string>(() => localStorage.getItem(`nexus:last-seen-activity-at:${userScope}`) ?? '');
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

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
    if (!fullName) return 'NA';
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
    if (!value) return [] as Array<{ id: string; label: string; meta: string; action: () => void }>;

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

    const memberMatches =
      user && `${user.fullName} ${user.email}`.toLowerCase().includes(value)
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
    const onKeyDown = (event: KeyboardEvent) => {
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
    const onPointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
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
    if (location.pathname !== '/activity') return;
    const latest = activityQuery.data?.[0]?.createdAt;
    if (!latest) return;
    localStorage.setItem(`nexus:last-seen-activity-at:${userScope}`, latest);
    setLastSeenActivityAt(latest);
  }, [location.pathname, activityQuery.data, userScope]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      toast.error(t('topbar.logoutFailed'));
    }

    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(true)}
          className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 border-r border-border/80 bg-card/65 backdrop-blur transition-all duration-300 lg:static lg:z-auto mt-0 lg:mt-0',
          sidebarCollapsed ? 'p-2' : 'p-3',
          sidebarCollapsed ? '-translate-x-full lg:w-[84px] lg:translate-x-0' : 'w-[260px] translate-x-0 lg:w-[260px]',
        )}
      >
        <div className={cn('rounded-xl border border-border/70 bg-background/45', sidebarCollapsed ? 'mb-3 p-2' : 'mb-4 p-3')}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('workspace.label')}</p>
                <p className="font-semibold tracking-tight">{t('workspace.title')}</p>
              </div>
            )}
            {sidebarCollapsed && <span className="mx-auto text-sm font-semibold leading-none">NX</span>}
            <button
              onClick={toggleSidebar}
              className={cn('rounded-md hover:bg-muted', sidebarCollapsed ? 'p-1.5' : 'p-2')}
              aria-label="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <p className="mb-2 px-2 text-[11px] uppercase tracking-wider text-muted-foreground">{t('workspace.navigation')}</p>
        )}

        <nav className={cn('space-y-1', sidebarCollapsed && 'space-y-1.5')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarCollapsed(true);
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'group rounded-lg text-sm text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground',
                    sidebarCollapsed
                      ? 'mx-auto flex h-10 w-10 items-center justify-center px-0 py-0'
                      : 'flex items-center justify-between px-3 py-2',
                    isActive && 'border border-primary/30 bg-primary/12 text-foreground shadow-panel',
                  )
                }
              >
                <span className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-2')}>
                  <Icon size={16} />
                  {!sidebarCollapsed && <span>{t(item.labelKey)}</span>}
                </span>
              </NavLink>
            );
          })}
        </nav>

      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur sm:px-4 lg:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1 sm:min-w-[220px] lg:flex-none">
              <button
                type="button"
                onClick={toggleSidebar}
                className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground hover:bg-muted lg:hidden"
              >
                <Menu size={15} />
              </button>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('topbar.workspace')}</p>
              <div className="font-medium tracking-tight">{currentTitle}</div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:justify-end lg:w-auto lg:flex-nowrap">
              <div ref={searchRef} className="relative hidden lg:block">
                <label className="h-9 min-w-64 items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-3 text-muted-foreground lg:inline-flex">
                  <Search size={15} />
                  <input
                    type="search"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t('topbar.searchPlaceholder')}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </label>

                {searchFocused && searchQuery.trim().length > 0 ? (
                  <div className="absolute right-0 top-11 z-30 w-[min(420px,60vw)] rounded-lg border border-border/70 bg-card p-2 shadow-panel">
                    {searchSuggestions.length > 0 ? (
                      <ul className="space-y-1">
                        {searchSuggestions.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => {
                                item.action();
                                setSearchFocused(false);
                              }}
                              className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted/70"
                            >
                              <p className="text-sm text-foreground">{item.label}</p>
                              <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">{t('topbar.searchNoResults')}</p>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => navigate('/calendar')}
                className="hidden h-9 shrink-0 items-center rounded-full border border-border/70 bg-background/25 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                {t('topbar.thisWeek')}
              </button>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 text-sm transition-colors hover:bg-muted"
              >
                <Command size={15} />
                <span className="hidden xl:inline">{t('topbar.command')}</span>
                <span className="hidden rounded border border-border/70 px-1.5 py-0.5 text-[11px] text-muted-foreground md:inline">
                  Ctrl+K
                </span>
              </button>

              <LanguageSwitcher />
              <ThemeToggle />

              <button
                type="button"
                onClick={() => navigate('/activity')}
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 transition-colors hover:bg-muted"
                aria-label={t('topbar.notifications')}
              >
                <Bell size={16} />
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                    {unreadNotifications}
                  </span>
                ) : null}
              </button>

              <div ref={userMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((current) => !current)}
                  className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border/70 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted/60 text-xs font-semibold">
                    {userInitials}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen ? (
                  <div className="absolute right-0 top-11 w-44 rounded-lg border border-border/70 bg-card p-2 shadow-panel">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t('topbar.profile')}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t('topbar.logout')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 items-start overflow-y-auto p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
      {profileModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pb-4 pt-0">
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="absolute inset-0 bg-background/55 backdrop-blur-sm"
            aria-label="Close profile modal"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/70 bg-card/95 p-4 shadow-panel">
            <h3 className="text-lg font-semibold tracking-tight">{t('topbar.profile')}</h3>
            <p className="text-xs text-muted-foreground">{t('profile.modalSubtitle')}</p>

            <div className="space-y-3 pt-3">
              <div className="rounded-xl border border-border/70 bg-background/25 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/60 text-sm font-semibold">
                    {userInitials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{user?.fullName ?? t('profile.defaultName')}</p>
                    <p className="text-xs text-muted-foreground">{user?.email ?? t('profile.defaultEmail')}</p>
                  </div>
                </div>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <p>{t('profile.modalRole')}: {t('profile.modalRoleValue')}</p>
                  <p>{t('profile.modalCurrentView')}: {currentTitle}</p>
                  <p>{t('profile.modalLanguage')}: {language.toUpperCase()}</p>
                  <p>{t('profile.modalTheme')}: {theme === 'dark' ? t('theme.dark') : t('theme.light')}</p>
                  <p>{t('profile.modalNotifications')}: {unreadNotifications}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    navigate('/activity');
                  }}
                  className="h-9 rounded-md border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t('nav.activity')}
                </button>
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  navigate('/settings');
                }}
                className="h-9 rounded-md border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t('nav.settings')}
              </button>
              <button
                type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="h-9 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground"
              >
                  {t('common.close')}
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <CommandPalette />
    </div>
  );
};
