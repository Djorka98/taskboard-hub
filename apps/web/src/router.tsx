import type { ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/components/layout/app-shell';
import { ActivityPage } from '@/features/activity/activity.page';
import { LoginPage } from '@/features/auth/login.page';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { RegisterPage } from '@/features/auth/register.page';
import { BoardsPage } from '@/features/boards/boards.page';
import { DashboardPage } from '@/features/dashboard/dashboard.page';
import { EventsPage } from '@/features/events/events.page';
import { NotFoundPage } from '@/features/not-found/not-found.page';
import { NotesPage } from '@/features/notes/notes.page';
import { SettingsPage } from '@/features/settings/settings.page';
import { TasksPage } from '@/features/tasks/tasks.page';
import { useAuthStore } from '@/stores/auth.store';

const GuestOnly = ({ children }: { children: ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestOnly>
        <RegisterPage />
      </GuestOnly>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/boards', element: <BoardsPage /> },
          { path: '/tasks', element: <TasksPage /> },
          { path: '/my-tasks', element: <TasksPage /> },
          { path: '/events', element: <EventsPage /> },
          { path: '/calendar', element: <EventsPage /> },
          { path: '/notes', element: <NotesPage /> },
          { path: '/activity', element: <ActivityPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
