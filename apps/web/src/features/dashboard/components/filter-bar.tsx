import { ListFilter, SlidersHorizontal } from 'lucide-react';

import type { DashboardPriorityFilter, DashboardQuickFilter } from '@/features/dashboard/dashboard.filters';
import { useI18n } from '@/i18n/use-i18n';

const filters = [
  { key: 'all', label: 'board.filter.all' },
  { key: 'dueWeek', label: 'board.filter.dueWeek' },
] as const;

type FilterBarProps = {
  activeFilter: DashboardQuickFilter;
  onFilterChange: (filter: DashboardQuickFilter) => void;
  selectedPriority: DashboardPriorityFilter;
  onPriorityChange: (priority: DashboardPriorityFilter) => void;
  groupedByPriority: boolean;
  onToggleGroup: () => void;
  descendingSort: boolean;
  onToggleSort: () => void;
};

export const FilterBar = ({
  activeFilter,
  onFilterChange,
  selectedPriority,
  onPriorityChange,
  groupedByPriority,
  onToggleGroup,
  descendingSort,
  onToggleSort,
}: FilterBarProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('board.filter.optionsLabel')}</p>
      <div className="flex flex-wrap items-start gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.key)}
            className={
              activeFilter === item.key
                ? 'inline-flex min-h-8 items-center rounded-full border border-primary/35 bg-primary/15 px-3 text-xs font-semibold text-foreground'
                : 'inline-flex min-h-8 items-center rounded-full border border-border/70 bg-background/20 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground'
            }
          >
            {t(item.label)}
          </button>
        ))}

        <label className="inline-flex min-h-8 w-full items-center gap-1.5 rounded-full border border-border/70 bg-background/20 px-2.5 text-xs text-muted-foreground sm:w-auto">
          <span className="text-[11px] text-muted-foreground">{t('board.filter.priorityLabel')}</span>
          <select
            value={selectedPriority}
            onChange={(event) => onPriorityChange(event.target.value as DashboardPriorityFilter)}
            className="ui-select h-6 min-w-[120px] flex-1 rounded-md bg-card/70 px-2 text-xs sm:flex-none"
          >
            <option value="all">{t('board.filter.priorityAll')}</option>
            <option value="low">{t('task.priority.low')}</option>
            <option value="medium">{t('task.priority.medium')}</option>
            <option value="high">{t('task.priority.high')}</option>
            <option value="urgent">{t('task.priority.urgent')}</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onToggleGroup}
          className={
            groupedByPriority
              ? 'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/35 bg-primary/15 px-3 text-xs font-semibold text-foreground'
              : 'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border/70 bg-background/20 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground'
          }
        >
          <ListFilter size={14} />
          {t('board.group')}
        </button>
        <button
          type="button"
          onClick={onToggleSort}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border/70 bg-background/20 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
        >
          <SlidersHorizontal size={14} />
          {t('board.sort')} {descendingSort ? '↓' : '↑'}
        </button>
      </div>
    </div>
  );
};
