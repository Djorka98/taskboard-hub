import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { parseBoardTag } from '@/features/dashboard/dashboard.utils';
import { tasksApi } from '@/features/tasks/tasks.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useBoardsStore } from '@/stores/boards.store';
export const BoardsPage = () => {
    const { t } = useI18n();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const boards = useBoardsStore((state) => state.boards);
    const selectedBoardId = useBoardsStore((state) => state.selectedBoardId);
    const addBoard = useBoardsStore((state) => state.addBoard);
    const updateBoard = useBoardsStore((state) => state.updateBoard);
    const removeBoard = useBoardsStore((state) => state.removeBoard);
    const selectBoard = useBoardsStore((state) => state.selectBoard);
    const [boardName, setBoardName] = useState('');
    const [boardDescription, setBoardDescription] = useState('');
    const [editingBoardId, setEditingBoardId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingDescription, setEditingDescription] = useState('');
    const tasksQuery = useQuery({
        queryKey: ['tasks', userScope],
        queryFn: tasksApi.getAll,
        enabled: Boolean(user?.id),
    });
    const taskStatsByBoard = useMemo(() => {
        const initial = new Map();
        boards.forEach((board) => {
            initial.set(board.id, { total: 0, progress: 0, done: 0 });
        });
        (tasksQuery.data ?? []).forEach((task) => {
            const boardId = parseBoardTag(task.tags);
            if (!boardId)
                return;
            const current = initial.get(boardId) ?? { total: 0, progress: 0, done: 0 };
            current.total += 1;
            if (task.status === 'in_progress')
                current.progress += 1;
            if (task.status === 'completed')
                current.done += 1;
            initial.set(boardId, current);
        });
        return initial;
    }, [boards, tasksQuery.data]);
    const handleCreateBoard = () => {
        const trimmedName = boardName.trim();
        if (trimmedName.length < 3) {
            toast.error(t('boards.error.nameMin'));
            return;
        }
        const normalizedId = trimmedName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        if (boards.some((board) => board.id === normalizedId)) {
            toast.error(t('boards.error.duplicate'));
            return;
        }
        addBoard({ name: trimmedName, description: boardDescription });
        setBoardName('');
        setBoardDescription('');
        toast.success(t('boards.created'));
    };
    return (_jsxs("section", { className: "mx-auto w-full max-w-[1080px] space-y-4 overflow-y-visible rounded-2xl border border-border/70 bg-card/70 p-3.5 shadow-panel sm:p-4 lg:max-h-[calc(100vh-124px)] lg:overflow-y-auto", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('boards.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('boards.subtitle') })] }), _jsx("article", { className: "rounded-xl border border-border/70 bg-background/25 p-4", children: _jsxs("div", { className: "grid gap-2 md:grid-cols-[minmax(200px,1fr)_minmax(240px,2fr)_auto] md:items-end", children: [_jsxs("label", { className: "space-y-1", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('boards.newName') }), _jsx("input", { value: boardName, onChange: (event) => setBoardName(event.target.value), placeholder: t('boards.newNamePlaceholder'), className: "h-9 w-full rounded-md border border-border/70 bg-background/35 px-2.5 text-sm outline-none focus:border-primary/40" })] }), _jsxs("label", { className: "space-y-1", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('boards.newDescription') }), _jsx("input", { value: boardDescription, onChange: (event) => setBoardDescription(event.target.value), placeholder: t('boards.newDescriptionPlaceholder'), className: "h-9 w-full rounded-md border border-border/70 bg-background/35 px-2.5 text-sm outline-none focus:border-primary/40" })] }), _jsx("button", { type: "button", onClick: handleCreateBoard, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110", children: t('boards.createAction') })] }) }), _jsxs("div", { className: "space-y-2", children: [boards.map((board) => {
                        const stats = taskStatsByBoard.get(board.id) ?? { total: 0, progress: 0, done: 0 };
                        const isSelected = board.id === selectedBoardId;
                        const isEditing = editingBoardId === board.id;
                        return (_jsx("article", { className: isSelected
                                ? 'rounded-xl border border-primary/40 bg-primary/10 p-4 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]'
                                : 'rounded-xl border border-border/70 bg-background/25 p-4', children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [isEditing ? (_jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [_jsx("input", { value: editingName, onChange: (event) => setEditingName(event.target.value), className: "h-9 rounded-md border border-border/70 bg-card/60 px-2.5 text-sm outline-none focus:border-primary/40" }), _jsx("input", { value: editingDescription, onChange: (event) => setEditingDescription(event.target.value), className: "h-9 rounded-md border border-border/70 bg-card/60 px-2.5 text-sm outline-none focus:border-primary/40" })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-base font-semibold", children: board.name }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: board.description })] })), _jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [_jsxs("span", { className: "rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground", children: [stats.total, " ", t('boards.tasks')] }), _jsxs("span", { className: "rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground", children: [stats.progress, " ", t('boards.inProgress')] }), _jsxs("span", { className: "rounded-full border border-border/70 bg-background/35 px-2 py-0.5 text-[10px] text-muted-foreground", children: [stats.done, " ", t('boards.done')] }), isSelected ? (_jsxs("span", { className: "rounded-full border border-primary/50 bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-foreground", children: ["\u2713 ", t('boards.selected')] })) : null] })] }), _jsx("div", { className: "flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-2.5", children: isEditing ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => {
                                                        if (editingName.trim().length < 3) {
                                                            toast.error(t('boards.error.nameMin'));
                                                            return;
                                                        }
                                                        updateBoard(board.id, { name: editingName, description: editingDescription });
                                                        setEditingBoardId(null);
                                                        toast.success(t('boards.updated'));
                                                    }, className: "inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3.5 text-center text-sm font-medium text-primary-foreground sm:w-auto", children: t('common.save') }), _jsx("button", { type: "button", onClick: () => setEditingBoardId(null), className: "inline-flex h-9 w-full items-center justify-center rounded-md border border-border/70 px-3.5 text-center text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground sm:w-auto", children: t('common.cancel') })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => selectBoard(board.id), className: isSelected
                                                        ? 'inline-flex h-9 w-full items-center justify-center rounded-md border border-primary/45 bg-primary/15 px-3.5 text-center text-sm font-semibold text-foreground sm:w-auto'
                                                        : 'inline-flex h-9 w-full items-center justify-center rounded-md border border-border/70 bg-background/30 px-3.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/70 sm:w-auto', children: isSelected ? t('boards.selected') : t('boards.select') }), _jsx("button", { type: "button", onClick: () => {
                                                        setEditingBoardId(board.id);
                                                        setEditingName(board.name);
                                                        setEditingDescription(board.description);
                                                    }, className: "inline-flex h-9 w-full items-center justify-center rounded-md border border-border/70 px-3.5 text-center text-sm text-foreground transition-colors hover:bg-muted/70 sm:w-auto", children: t('boards.edit') }), _jsx("button", { type: "button", onClick: () => {
                                                        const removed = removeBoard(board.id);
                                                        if (!removed) {
                                                            toast.error(t('boards.error.deleteFailed'));
                                                            return;
                                                        }
                                                        toast.success(t('boards.deleted'));
                                                    }, className: "inline-flex h-9 w-full items-center justify-center rounded-md border border-border/70 px-3.5 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground sm:w-auto", children: t('boards.delete') }), _jsx(Link, { to: "/dashboard", onClick: () => selectBoard(board.id), className: "inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3.5 text-center text-sm font-medium text-primary-foreground sm:w-auto", children: t('boards.openBoard') })] })) })] }) }, board.id));
                    }), boards.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center text-sm text-muted-foreground", children: [t('boards.empty'), _jsx("div", { className: "mt-2 text-xs text-muted-foreground", children: t('boards.emptyHint') })] })) : null] })] }));
};
