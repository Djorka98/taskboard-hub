import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { notesApi } from '@/features/notes/notes.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
export const NotesPage = () => {
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const globalSearchQuery = useUiStore((state) => state.searchQuery);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const notesQuery = useQuery({
        queryKey: ['notes', userScope],
        queryFn: notesApi.getAll,
        enabled: Boolean(user?.id),
    });
    const createMutation = useMutation({
        mutationFn: notesApi.create,
        onSuccess: () => {
            setTitle('');
            setContent('');
            void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('notes.toast.created'));
        },
        onError: () => toast.error(t('notes.toast.createError')),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, pinned }) => notesApi.update(id, { pinned }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
        },
    });
    const removeMutation = useMutation({
        mutationFn: notesApi.remove,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('notes.toast.deleted'));
        },
        onError: () => toast.error(t('notes.toast.deleteError')),
    });
    const filteredNotes = (notesQuery.data ?? []).filter((note) => {
        const value = globalSearchQuery.trim().toLowerCase();
        if (!value)
            return true;
        return `${note.title} ${note.content} ${note.label ?? ''}`.toLowerCase().includes(value);
    });
    return (_jsxs("section", { className: "mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('notes.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('notes.subtitle') })] }), _jsxs("form", { className: "grid gap-2.5 rounded-xl border border-border/70 bg-background/25 p-3", onSubmit: (event) => {
                    event.preventDefault();
                    if (!title || !content || createMutation.isPending)
                        return;
                    createMutation.mutate({ title, content, pinned: false, label: 'quick' });
                }, children: [_jsx("input", { value: title, onChange: (event) => setTitle(event.target.value), maxLength: 90, placeholder: t('notes.titlePlaceholder'), className: "h-9 rounded-md border border-border/70 bg-card px-3 text-sm outline-none" }), _jsx("textarea", { value: content, onChange: (event) => setContent(event.target.value), maxLength: 800, rows: 3, placeholder: t('notes.contentPlaceholder'), className: "resize-none rounded-md border border-border/70 bg-card p-2.5 text-sm outline-none" }), _jsxs("p", { className: "text-right text-[11px] text-muted-foreground", children: [content.length, "/800"] }), _jsx("button", { disabled: createMutation.isPending || !title.trim() || !content.trim(), className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-center text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60", children: t('notes.save') })] }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3", children: filteredNotes.map((note) => (_jsxs("article", { className: "rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: "font-medium", children: note.title }), _jsx("button", { type: "button", onClick: () => updateMutation.mutate({ id: note.id, pinned: !note.pinned }), disabled: updateMutation.isPending, className: "rounded-md border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground", children: note.pinned ? t('notes.unpin') : t('notes.pin') })] }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: note.content }), _jsx("button", { type: "button", onClick: () => removeMutation.mutate(note.id), disabled: removeMutation.isPending, className: "mt-3 h-8 rounded-md border border-border/70 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground", children: t('common.delete') })] }, note.id))) })] }));
};
