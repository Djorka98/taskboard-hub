import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { activityApi } from '@/features/activity/activity.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
export const ActivityPage = () => {
    const { t } = useI18n();
    const user = useAuthStore((state) => state.user);
    const userScope = user?.id ?? 'guest';
    const globalSearchQuery = useUiStore((state) => state.searchQuery);
    const activityQuery = useQuery({
        queryKey: ['activity', userScope],
        queryFn: activityApi.getAll,
        enabled: Boolean(user?.id),
    });
    const filteredActivity = useMemo(() => {
        const value = globalSearchQuery.trim().toLowerCase();
        if (!value)
            return activityQuery.data ?? [];
        return (activityQuery.data ?? []).filter((item) => `${item.action} ${item.entityType}`.toLowerCase().includes(value));
    }, [activityQuery.data, globalSearchQuery]);
    return (_jsxs("section", { className: "mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: t('activity.title') }), _jsx("p", { className: "text-sm text-muted-foreground", children: t('activity.subtitle') })] }), _jsxs("div", { className: "space-y-3", children: [filteredActivity.map((item) => (_jsxs("article", { className: "rounded-xl border border-border/70 bg-background/25 p-3", children: [_jsx("p", { className: "text-sm font-medium", children: item.action.replaceAll('_', ' ') }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: new Date(item.createdAt).toLocaleString() }), _jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [t('activity.entity'), ": ", item.entityType] })] }, item.id))), !activityQuery.isLoading && filteredActivity.length === 0 ? (_jsx("div", { className: "rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center text-sm text-muted-foreground", children: t('activity.empty') })) : null] })] }));
};
