import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { eventsApi } from '@/features/events/events.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
export const EventsPage = () => {
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const [title, setTitle] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const eventsQuery = useQuery({
        queryKey: ['events', userScope],
        queryFn: eventsApi.getAll,
        enabled: Boolean(user?.id),
    });
    const createMutation = useMutation({
        mutationFn: eventsApi.create,
        onSuccess: () => {
            setTitle('');
            setStartsAt('');
            void queryClient.invalidateQueries({ queryKey: ['events', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('calendar.toast.created'));
        },
        onError: () => toast.error(t('calendar.toast.createError')),
    });
    const removeMutation = useMutation({
        mutationFn: eventsApi.remove,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['events', userScope] });
            void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
            toast.success(t('calendar.toast.deleted'));
        },
        onError: () => toast.error(t('calendar.toast.deleteError')),
    });
    const sorted = useMemo(() => [...(eventsQuery.data ?? [])].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [eventsQuery.data]);
    return (_jsxs("section", { className: "mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('calendar.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('calendar.subtitle') })] }), _jsxs("form", { className: "grid gap-2 rounded-xl border border-border/70 bg-background/25 p-3 sm:grid-cols-[1fr_220px_auto]", onSubmit: (event) => {
                    event.preventDefault();
                    if (!title || !startsAt || createMutation.isPending)
                        return;
                    createMutation.mutate({
                        title,
                        startsAt: new Date(startsAt).toISOString(),
                        category: 'task',
                        description: t('calendar.createdFromPanel'),
                    });
                }, children: [_jsx("input", { value: title, onChange: (event) => setTitle(event.target.value), maxLength: 100, placeholder: t('calendar.newEventPlaceholder'), className: "h-9 rounded-md border border-border/70 bg-card px-3 text-sm outline-none" }), _jsx("input", { type: "datetime-local", value: startsAt, onChange: (event) => setStartsAt(event.target.value), className: "ui-datetime h-9 rounded-md bg-card px-3 text-sm" }), _jsx("button", { disabled: createMutation.isPending || !title.trim() || !startsAt, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-center text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60", children: t('common.add') })] }), _jsxs("div", { className: "space-y-3", children: [sorted.map((eventItem) => (_jsxs("article", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: eventItem.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: new Date(eventItem.startsAt).toLocaleString() })] }), _jsx("button", { type: "button", onClick: () => removeMutation.mutate(eventItem.id), disabled: removeMutation.isPending, className: "h-8 rounded-md border border-border/70 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground", children: t('common.delete') })] }, eventItem.id))), sorted.length === 0 && !eventsQuery.isLoading ? (_jsx("div", { className: "rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center text-sm text-muted-foreground", children: t('calendar.empty') })) : null] })] }));
};
