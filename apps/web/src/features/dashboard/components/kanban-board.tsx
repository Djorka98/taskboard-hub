import type { TaskItem } from '@/features/dashboard/dashboard.types';
import { KanbanColumn } from '@/features/dashboard/components/kanban-column';
import { boardColumns } from '@/features/dashboard/dashboard.utils';
import type { BoardColumn } from '@/features/tasks/tasks.types';
import { useI18n } from '@/i18n/use-i18n';

type KanbanBoardProps = {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onCreateTask: (column: BoardColumn) => void;
  onDropTask: (column: BoardColumn) => void;
  onDragTaskOver: (column: BoardColumn) => void;
  onDragTaskStart: (task: TaskItem) => void;
  onDragTaskMove: (position: { x: number; y: number }) => void;
  onDragTaskEnd: () => void;
  activeDropColumn: BoardColumn | null;
  isDragging: boolean;
};

export const KanbanBoard = ({
  tasks,
  onSelectTask,
  onCreateTask,
  onDropTask,
  onDragTaskOver,
  onDragTaskStart,
  onDragTaskMove,
  onDragTaskEnd,
  activeDropColumn,
  isDragging,
}: KanbanBoardProps) => {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-border/70 bg-card/55 p-2.5 shadow-panel sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 px-1 text-[11px] text-muted-foreground">
        <span>{t('board.meta')}</span>
        <span>{t('board.dragReady')}</span>
      </div>
      <div className="overflow-x-auto rounded-xl bg-background/25 p-1.5 pb-2 [scrollbar-width:thin] lg:overflow-x-hidden">
        <div className="grid min-w-max grid-flow-col auto-cols-[280px] items-start snap-x snap-mandatory gap-3 pb-1 sm:auto-cols-[320px] lg:min-w-0 lg:auto-cols-fr lg:gap-2.5">
          {boardColumns.map((column) => (
            <KanbanColumn
              key={column}
              column={column}
              tasks={tasks.filter((task) => task.column === column)}
              onSelectTask={onSelectTask}
              onCreateTask={onCreateTask}
              onDropTask={onDropTask}
              onDragTaskOver={onDragTaskOver}
              onDragTaskStart={onDragTaskStart}
              onDragTaskMove={onDragTaskMove}
              onDragTaskEnd={onDragTaskEnd}
              isDropTarget={activeDropColumn === column}
              isDragging={isDragging}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
