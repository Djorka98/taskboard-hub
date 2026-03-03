import { jsx as _jsx } from "react/jsx-runtime";
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
const GuestOnly = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return children;
};
export const router = createBrowserRouter([
    {
        path: '/login',
        element: (_jsx(GuestOnly, { children: _jsx(LoginPage, {}) })),
    },
    {
        path: '/register',
        element: (_jsx(GuestOnly, { children: _jsx(RegisterPage, {}) })),
    },
    {
        element: _jsx(ProtectedRoute, {}),
        children: [
            {
                element: _jsx(AppShell, {}),
                children: [
                    { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) },
                    { path: '/dashboard', element: _jsx(DashboardPage, {}) },
                    { path: '/boards', element: _jsx(BoardsPage, {}) },
                    { path: '/tasks', element: _jsx(TasksPage, {}) },
                    { path: '/my-tasks', element: _jsx(TasksPage, {}) },
                    { path: '/events', element: _jsx(EventsPage, {}) },
                    { path: '/calendar', element: _jsx(EventsPage, {}) },
                    { path: '/notes', element: _jsx(NotesPage, {}) },
                    { path: '/activity', element: _jsx(ActivityPage, {}) },
                    { path: '/settings', element: _jsx(SettingsPage, {}) },
                ],
            },
        ],
    },
    {
        path: '*',
        element: _jsx(NotFoundPage, {}),
    },
]);
