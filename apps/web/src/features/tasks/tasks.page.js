import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { parseBoardTag } from '@/features/dashboard/dashboard.utils';
import { tasksApi } from '@/features/tasks/tasks.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useBoardsStore } from '@/stores/boards.store';
import { useUiStore } from '@/stores/ui.store';
export const TasksPage = () => {
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const selectedBoardId = useBoardsStore((state) => state.selectedBoardId);
    const globalSearchQuery = useUiStore((state) => state.searchQuery);
    const [query, setQuery] = useState('');
    const tasksQuery = useQuery({
        queryKey: ['tasks', userScope],
        queryFn: tasksApi.getAll,
        enabled: Boolean(user?.id),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, status }) => tasksApi.update(id, { status }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['tasks', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('task.toast.updated'));
        },
        onError: () => toast.error(t('task.toast.updateError')),
    });
    const myTasks = useMemo(() => {
        const all = tasksQuery.data ?? [];
        const onlySelectedBoard = all.filter((task) => (parseBoardTag(task.tags) ?? selectedBoardId) === selectedBoardId);
        const onlyMine = onlySelectedBoard.filter((task) => task.creatorId === user?.id || task.assigneeId === user?.id);
        const value = (query.trim() || globalSearchQuery.trim()).toLowerCase();
        if (!value)
            return onlyMine;
        return onlyMine.filter((task) => `${task.title} ${task.description ?? ''} ${task.tags.join(' ')}`.toLowerCase().includes(value));
    }, [tasksQuery.data, selectedBoardId, user?.id, query, globalSearchQuery]);
    return (_jsxs("section", { className: "mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('myTasks.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('myTasks.subtitle') })] }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: t('myTasks.searchPlaceholder'), className: "h-9 w-full rounded-lg border border-border/70 bg-background/30 px-3 text-sm outline-none sm:w-64" })] }), _jsxs("div", { className: "space-y-3", children: [myTasks.map((task) => (_jsx("article", { className: "rounded-xl border border-border/70 bg-background/25 p-3", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: task.title }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: task.description ?? t('task.noDescription') }), _jsxs("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [t('task.field.startDate'), ": ", task.startDate ? new Date(task.startDate).toLocaleDateString() : t('common.noDate'), " \u00B7", ' ', t('task.field.dueDate'), ": ", task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('common.noDate')] }), _jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: task.tags.map((tag) => (_jsx("span", { className: "rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground", children: tag }, tag))) })] }), _jsxs("select", { value: task.status, onChange: (event) => {
                                        if (updateMutation.isPending)
                                            return;
                                        updateMutation.mutate({ id: task.id, status: event.target.value });
                                    }, disabled: updateMutation.isPending, className: "ui-select h-8 rounded-md bg-card px-2 text-xs", children: [_jsx("option", { value: "todo", children: t('board.column.todo') }), _jsx("option", { value: "in_progress", children: t('board.column.inProgress') }), _jsx("option", { value: "blocked", children: t('board.column.review') }), _jsx("option", { value: "completed", children: t('board.column.done') })] })] }) }, task.id))), myTasks.length === 0 && !tasksQuery.isLoading ? (_jsx("div", { className: "rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center text-sm text-muted-foreground", children: t('myTasks.empty') })) : null] })] }));
};
