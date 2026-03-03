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
    if (!value) return activityQuery.data ?? [];
    return (activityQuery.data ?? []).filter((item) => `${item.action} ${item.entityType}`.toLowerCase().includes(value));
  }, [activityQuery.data, globalSearchQuery]);

  return (
    <section className="mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('activity.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('activity.subtitle')}</p>
      </div>

      <div className="space-y-3">
        {filteredActivity.map((item) => (
          <article key={item.id} className="rounded-xl border border-border/70 bg-background/25 p-3">
            <p className="text-sm font-medium">{item.action.replaceAll('_', ' ')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('activity.entity')}: {item.entityType}
            </p>
          </article>
        ))}

        {!activityQuery.isLoading && filteredActivity.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center text-sm text-muted-foreground">
            {t('activity.empty')}
          </div>
        ) : null}
      </div>
    </section>
  );
};
