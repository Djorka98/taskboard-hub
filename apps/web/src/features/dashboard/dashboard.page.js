import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BoardHeader } from '@/features/dashboard/components/board-header';
import { KanbanBoard } from '@/features/dashboard/components/kanban-board';
import { KpiRow } from '@/features/dashboard/components/kpi-row';
import { TaskCreateModal } from '@/features/dashboard/components/task-create-modal';
import { TaskDetailDrawer } from '@/features/dashboard/components/task-detail-drawer';
import { boardColumns, boardToTag, getBoardColumnLabel, toTaskCard, toTaskUpdatePayload } from '@/features/dashboard/dashboard.utils';
import { tasksApi } from '@/features/tasks/tasks.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useBoardsStore } from '@/stores/boards.store';
import { useUiStore } from '@/stores/ui.store';
export const DashboardPage = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const boards = useBoardsStore((state) => state.boards);
    const selectedBoardId = useBoardsStore((state) => state.selectedBoardId);
    const searchQuery = useUiStore((state) => state.searchQuery);
    const { t } = useI18n();
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [createColumn, setCreateColumn] = useState(null);
    const [draggingTask, setDraggingTask] = useState(null);
    const [activeDropColumn, setActiveDropColumn] = useState(null);
    const [dragPosition, setDragPosition] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [groupedByPriority, setGroupedByPriority] = useState(false);
    const [descendingSort, setDescendingSort] = useState(true);
    const tasksQuery = useQuery({
        queryKey: ['tasks', userScope],
        queryFn: tasksApi.getAll,
        staleTime: 15_000,
        enabled: Boolean(user?.id),
    });
    const taskCards = useMemo(() => {
        if (!tasksQuery.data || !user)
            return [];
        return tasksQuery.data.map((task) => toTaskCard(task, user));
    }, [tasksQuery.data, user]);
    const boardScopedTaskCards = useMemo(() => {
        if (!selectedBoardId)
            return [];
        return taskCards.filter((task) => task.boardId === selectedBoardId);
    }, [taskCards, selectedBoardId]);
    const selectedBoard = useMemo(() => boards.find((board) => board.id === selectedBoardId) ?? boards[0] ?? null, [boards, selectedBoardId]);
    useEffect(() => {
        const onCreateTaskTrigger = () => setCreateColumn('To Do');
        const onOpenTask = (event) => {
            const customEvent = event;
            if (customEvent.detail?.taskId) {
                setSelectedTaskId(customEvent.detail.taskId);
            }
        };
        window.addEventListener('nexus:new-task', onCreateTaskTrigger);
        window.addEventListener('nexus:open-task', onOpenTask);
        return () => {
            window.removeEventListener('nexus:new-task', onCreateTaskTrigger);
            window.removeEventListener('nexus:open-task', onOpenTask);
        };
    }, []);
    const filteredTaskCards = useMemo(() => {
        const now = new Date();
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const current = [...boardScopedTaskCards].filter((task) => {
            if (normalizedQuery) {
                const searchable = `${task.title} ${task.description} ${task.labels.join(' ')} ${task.assignee.name}`.toLowerCase();
                if (!searchable.includes(normalizedQuery)) {
                    return false;
                }
            }
            if (activeFilter === 'dueWeek') {
                const due = new Date(task.dueDate);
                const diff = due.getTime() - now.getTime();
                return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
            }
            if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
                return false;
            }
            return true;
        });
        current.sort((a, b) => {
            if (groupedByPriority) {
                const priorityWeight = {
                    urgent: 4,
                    high: 3,
                    medium: 2,
                    low: 1,
                };
                const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
                if (priorityDiff !== 0)
                    return priorityDiff;
            }
            const aTime = new Date(a.dueDate).getTime();
            const bTime = new Date(b.dueDate).getTime();
            return descendingSort ? bTime - aTime : aTime - bTime;
        });
        return current;
    }, [boardScopedTaskCards, searchQuery, activeFilter, selectedPriority, descendingSort, groupedByPriority, user?.id]);
    const selectedTask = taskCards.find((task) => task.id === selectedTaskId) ?? null;
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => tasksApi.update(id, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['tasks', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('task.toast.updated'));
        },
        onError: () => {
            toast.error(t('task.toast.updateError'));
        },
    });
    const deleteMutation = useMutation({
        mutationFn: tasksApi.remove,
        onSuccess: () => {
            setSelectedTaskId(null);
            void queryClient.invalidateQueries({ queryKey: ['tasks', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('task.toast.deleted'));
        },
        onError: () => {
            toast.error(t('task.toast.deleteError'));
        },
    });
    const createMutation = useMutation({
        mutationFn: tasksApi.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['tasks', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('task.toast.created'));
        },
        onError: () => {
            toast.error(t('task.toast.createError'));
        },
    });
    const handleDropTask = (column) => {
        if (updateMutation.isPending)
            return;
        setActiveDropColumn(null);
        if (!draggingTask || draggingTask.column === column) {
            setDraggingTask(null);
            return;
        }
        updateMutation.mutate({
            id: draggingTask.id,
            payload: toTaskUpdatePayload(draggingTask, column),
        });
        setDraggingTask(null);
        setDragPosition(null);
    };
    const handleCreateTask = (column) => {
        if (!selectedBoardId)
            return;
        setCreateColumn(column);
    };
    const handleSubmitCreate = async (input) => {
        if (!selectedBoardId) {
            toast.error(t('board.emptyWorkspaceHint'));
            return false;
        }
        const statusMap = {
            Backlog: 'todo',
            'To Do': 'todo',
            'In Progress': 'in_progress',
            Review: 'blocked',
            Done: 'completed',
        };
        try {
            await createMutation.mutateAsync({
                title: input.title,
                description: input.description,
                status: statusMap[input.column],
                priority: input.priority,
                startDate: new Date(input.startDate).toISOString(),
                dueDate: new Date(input.dueDate).toISOString(),
                tags: [...input.labels, boardToTag(selectedBoardId), `column:${input.column.toLowerCase().replace(/\s+/g, '-')}`],
            });
            return true;
        }
        catch {
            return false;
        }
    };
    const handleSaveTask = (input) => {
        if (!selectedTask || updateMutation.isPending)
            return;
        updateMutation.mutate({
            id: selectedTask.id,
            payload: {
                ...toTaskUpdatePayload(selectedTask, input.column),
                title: input.title,
                description: input.description,
                priority: input.priority,
                startDate: new Date(input.startDate).toISOString(),
                dueDate: new Date(input.dueDate).toISOString(),
                tags: [...input.labels, boardToTag(selectedTask.boardId), `column:${input.column.toLowerCase().replace(/\s+/g, '-')}`],
            },
        });
    };
    const boardMembers = useMemo(() => {
        const unique = new Map();
        taskCards.forEach((task) => {
            if (!unique.has(task.assignee.id)) {
                unique.set(task.assignee.id, task.assignee);
            }
        });
        if (unique.size === 0 && user) {
            unique.set(user.id, {
                id: user.id,
                name: user.fullName,
                initials: user.fullName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? '')
                    .join(''),
            });
        }
        return Array.from(unique.values());
    }, [taskCards, user]);
    return (_jsxs("div", { className: "mx-auto w-full max-w-[1680px] space-y-4", children: [_jsx(KpiRow, { tasks: boardScopedTaskCards }), selectedBoard ? (_jsx(BoardHeader, { title: selectedBoard.name, subtitle: selectedBoard.description, members: boardMembers, onCreateTask: () => setCreateColumn('To Do'), activeFilter: activeFilter, onFilterChange: setActiveFilter, selectedPriority: selectedPriority, onPriorityChange: setSelectedPriority, groupedByPriority: groupedByPriority, onToggleGroup: () => setGroupedByPriority((current) => !current), descendingSort: descendingSort, onToggleSort: () => setDescendingSort((current) => !current) })) : (_jsxs("section", { className: "rounded-2xl border border-border/70 bg-card/65 p-5 shadow-panel", children: [_jsx("h2", { className: "text-lg font-semibold tracking-tight", children: t('board.emptyWorkspaceTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('board.emptyWorkspaceHint') }), _jsx(Link, { to: "/boards", className: "mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground", children: t('board.createFirstBoard') })] })), _jsx(KanbanBoard, { tasks: filteredTaskCards, onSelectTask: (task) => setSelectedTaskId(task.id), onCreateTask: handleCreateTask, onDropTask: handleDropTask, onDragTaskOver: (column) => setActiveDropColumn(column), onDragTaskStart: (task) => {
                    setDraggingTask(task);
                    setActiveDropColumn(null);
                }, onDragTaskMove: (position) => setDragPosition(position), onDragTaskEnd: () => {
                    setDraggingTask(null);
                    setActiveDropColumn(null);
                    setDragPosition(null);
                }, activeDropColumn: activeDropColumn, isDragging: Boolean(draggingTask) }), draggingTask && dragPosition ? (_jsxs("div", { className: "pointer-events-none fixed z-[70] w-56 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary/50 bg-card/95 px-3 py-2 shadow-[0_20px_40px_-24px_hsl(var(--primary)/0.8)]", style: { left: dragPosition.x + 16, top: dragPosition.y + 16 }, children: [_jsx("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: t('board.movingTask') }), _jsx("p", { className: "mt-1 line-clamp-1 text-sm font-semibold text-foreground", children: draggingTask.title }), _jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [getBoardColumnLabel(draggingTask.column, t), " \u2192 ", activeDropColumn ? getBoardColumnLabel(activeDropColumn, t) : '...'] })] })) : null, _jsx(TaskCreateModal, { column: createColumn, draftScope: `${userScope}:${selectedBoard?.id ?? 'no-board'}`, onClose: () => !createMutation.isPending && setCreateColumn(null), onCreate: handleSubmitCreate, isCreating: createMutation.isPending }), _jsx(TaskDetailDrawer, { task: selectedTask, storageScope: `${userScope}:${selectedBoard?.id ?? 'no-board'}`, columns: boardColumns, onClose: () => !(updateMutation.isPending || deleteMutation.isPending) && setSelectedTaskId(null), onSave: handleSaveTask, onDelete: () => selectedTask && !deleteMutation.isPending && deleteMutation.mutate(selectedTask.id), isSaving: updateMutation.isPending, isDeleting: deleteMutation.isPending })] }));
};
