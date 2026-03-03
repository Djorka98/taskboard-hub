import { Sparkles } from 'lucide-react';

import { FilterBar } from '@/features/dashboard/components/filter-bar';
import type { DashboardPriorityFilter, DashboardQuickFilter } from '@/features/dashboard/dashboard.filters';
import { MemberAvatars } from '@/features/dashboard/components/member-avatars';
import { NewTaskButton } from '@/features/dashboard/components/new-task-button';
import type { TaskMember } from '@/features/dashboard/dashboard.types';
import { useI18n } from '@/i18n/use-i18n';

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  members: TaskMember[];
  onCreateTask: () => void;
  activeFilter: DashboardQuickFilter;
  onFilterChange: (filter: DashboardQuickFilter) => void;
  selectedPriority: DashboardPriorityFilter;
  onPriorityChange: (priority: DashboardPriorityFilter) => void;
  groupedByPriority: boolean;
  onToggleGroup: () => void;
  descendingSort: boolean;
  onToggleSort: () => void;
};

export const BoardHeader = ({
  title,
  subtitle,
  members,
  onCreateTask,
  activeFilter,
  onFilterChange,
  selectedPriority,
  onPriorityChange,
  groupedByPriority,
  onToggleGroup,
  descendingSort,
  onToggleSort,
}: BoardHeaderProps) => {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-border/70 bg-card/72 p-3.5 shadow-panel sm:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/35 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Sparkles size={13} />
            {t('board.activeWorkspace')}
          </div>
          <h2 className="break-words text-lg font-semibold tracking-tight sm:text-xl lg:text-[1.35rem]">{title}</h2>
          <p className="max-w-2xl break-words text-sm text-muted-foreground">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="rounded-full border border-border/70 bg-background/30 px-2 py-0.5 text-[10px] text-muted-foreground">
              {t('board.sprintBoard')}
            </span>
            <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
              {t('board.updated')}
            </span>
            <span className="rounded-full border border-primary/45 bg-primary/15 px-2 py-0.5 text-[10px] text-foreground">
              {t('board.selectedBoardBadge')}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-start justify-center gap-2.5 self-start sm:w-auto sm:items-end lg:self-center">
          <MemberAvatars members={members} />
          <NewTaskButton onClick={onCreateTask} />
        </div>
      </div>

      <div className="mt-3.5 border-t border-border/60 pt-3.5">
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          selectedPriority={selectedPriority}
          onPriorityChange={onPriorityChange}
          groupedByPriority={groupedByPriority}
          onToggleGroup={onToggleGroup}
          descendingSort={descendingSort}
          onToggleSort={onToggleSort}
        />
      </div>
    </section>
  );
};
