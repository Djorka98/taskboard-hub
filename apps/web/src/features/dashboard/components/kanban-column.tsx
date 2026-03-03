import type { TaskItem } from '@/features/dashboard/dashboard.types';
import { EmptyColumnState } from '@/features/dashboard/components/empty-column-state';
import { NewTaskButton } from '@/features/dashboard/components/new-task-button';
import { TaskCard } from '@/features/dashboard/components/task-card';
import { getBoardColumnLabel } from '@/features/dashboard/dashboard.utils';
import type { BoardColumn } from '@/features/tasks/tasks.types';
import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';

type KanbanColumnProps = {
  column: BoardColumn;
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onCreateTask: (column: BoardColumn) => void;
  onDropTask: (column: BoardColumn) => void;
  onDragTaskOver: (column: BoardColumn) => void;
  onDragTaskStart: (task: TaskItem) => void;
  onDragTaskMove: (position: { x: number; y: number }) => void;
  onDragTaskEnd: () => void;
  isDropTarget: boolean;
  isDragging: boolean;
};

export const KanbanColumn = ({
  column,
  tasks,
  onSelectTask,
  onCreateTask,
  onDropTask,
  onDragTaskOver,
  onDragTaskStart,
  onDragTaskMove,
  onDragTaskEnd,
  isDropTarget,
  isDragging,
}: KanbanColumnProps) => {
  const { t } = useI18n();
  const columnLabel = getBoardColumnLabel(column, t);

  const statusTone: Record<BoardColumn, string> = {
    Backlog: 'border-border/80 bg-muted/35 text-muted-foreground',
    'To Do': 'border-border/80 bg-background/40 text-foreground',
    'In Progress': 'border-primary/35 bg-primary/15 text-foreground',
    Review: 'border-border/80 bg-card text-foreground',
    Done: 'border-primary/25 bg-primary/10 text-foreground',
  };

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        onDragTaskOver(column);
      }}
      onDrop={() => onDropTask(column)}
      className={cn(
        'relative flex h-[520px] min-w-[280px] snap-start flex-col rounded-xl border border-border/70 bg-card/72 p-3 shadow-panel transition-all sm:min-w-[320px] lg:min-w-0 lg:h-[560px]',
        isDragging && 'border-primary/25',
        isDropTarget && 'border-primary/60 bg-primary/12 shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_18px_34px_-24px_hsl(var(--primary)/0.7)]',
      )}
    >
      <header className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">{columnLabel}</h3>
          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', statusTone[column])}>
            {tasks.length}
          </span>
        </div>
        <NewTaskButton compact onClick={() => onCreateTask(column)} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {isDragging && isDropTarget ? (
          <div className="mb-1 rounded-lg border border-primary/45 bg-primary/12 px-2.5 py-1.5 text-center text-[11px] font-medium text-foreground animate-pulse">
            {t('board.dropHere')}
          </div>
        ) : null}
        {tasks.length === 0 ? (
          <EmptyColumnState onCreate={() => onCreateTask(column)} />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelectTask}
                onDragStart={onDragTaskStart}
                onDragMove={onDragTaskMove}
                onDragEnd={onDragTaskEnd}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
