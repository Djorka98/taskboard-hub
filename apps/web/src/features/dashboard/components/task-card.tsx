import { CalendarClock } from 'lucide-react';

import type { TaskItem } from '@/features/dashboard/dashboard.types';
import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';

const transparentDragPixel =
  typeof window !== 'undefined'
    ? (() => {
        const image = new Image();
        image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        return image;
      })()
    : null;

type TaskCardProps = {
  task: TaskItem;
  onSelect: (task: TaskItem) => void;
  onDragStart: (task: TaskItem) => void;
  onDragMove: (position: { x: number; y: number }) => void;
  onDragEnd: () => void;
};

const priorityClassMap: Record<TaskItem['priority'], string> = {
  low: 'border-border/70 bg-muted/45 text-muted-foreground',
  medium: 'border-border/70 bg-background/35 text-foreground',
  high: 'border-primary/40 bg-primary/15 text-foreground',
  urgent: 'border-primary/60 bg-primary/25 text-foreground',
};

export const TaskCard = ({ task, onSelect, onDragStart, onDragMove, onDragEnd }: TaskCardProps) => {
  const { t } = useI18n();
  const isOverdue = new Date(task.dueDate) < new Date() && task.column !== 'Done';

  const priorityLabelMap: Record<TaskItem['priority'], string> = {
    low: t('task.priority.low'),
    medium: t('task.priority.medium'),
    high: t('task.priority.high'),
    urgent: t('task.priority.urgent'),
  };

  return (
    <button
      type="button"
      draggable
      onClick={() => onSelect(task)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        if (transparentDragPixel) {
          event.dataTransfer.setDragImage(transparentDragPixel, 0, 0);
        }
        onDragStart(task);
      }}
      onDrag={(event) => {
        if (event.clientX > 0 && event.clientY > 0) {
          onDragMove({ x: event.clientX, y: event.clientY });
        }
      }}
      onDragEnd={onDragEnd}
      className="group mx-auto w-full max-w-[390px] rounded-lg border border-border/70 bg-card/85 p-2 text-left shadow-panel transition-colors duration-150 hover:border-primary/35 hover:bg-card"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-semibold leading-5 tracking-tight text-foreground">{task.title}</h4>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            priorityClassMap[task.priority],
          )}
        >
          {priorityLabelMap[task.priority]}
        </span>
      </div>

      <div className="mt-2.5 rounded-md border border-border/60 bg-background/25 px-2 py-1">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
          <CalendarClock size={12} className="mb-0.5 inline-block" /> {t('task.field.startDate')}{' '}
          <span className="font-medium text-foreground">{new Date(task.startDate).toLocaleDateString()}</span> -{' '}
          <span className={cn(isOverdue ? 'text-foreground' : 'text-muted-foreground')}>
            <CalendarClock size={12} className="mb-0.5 inline-block" /> {t('task.field.dueDate')}{' '}
            <span className="font-medium text-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
          </span>
        </p>
      </div>
    </button>
  );
};
