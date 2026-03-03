import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KanbanColumn } from '@/features/dashboard/components/kanban-column';
import { boardColumns } from '@/features/dashboard/dashboard.utils';
import { useI18n } from '@/i18n/use-i18n';
export const KanbanBoard = ({ tasks, onSelectTask, onCreateTask, onDropTask, onDragTaskOver, onDragTaskStart, onDragTaskMove, onDragTaskEnd, activeDropColumn, isDragging, }) => {
    const { t } = useI18n();
    return (_jsxs("section", { className: "rounded-2xl border border-border/70 bg-card/55 p-2.5 shadow-panel sm:p-3", children: [_jsxs("div", { className: "mb-2 flex flex-wrap items-center justify-between gap-1.5 px-1 text-[11px] text-muted-foreground", children: [_jsx("span", { children: t('board.meta') }), _jsx("span", { children: t('board.dragReady') })] }), _jsx("div", { className: "overflow-x-auto rounded-xl bg-background/25 p-1.5 pb-2 [scrollbar-width:thin] lg:overflow-x-hidden", children: _jsx("div", { className: "grid min-w-max grid-flow-col auto-cols-[280px] items-start snap-x snap-mandatory gap-3 pb-1 sm:auto-cols-[320px] lg:min-w-0 lg:auto-cols-fr lg:gap-2.5", children: boardColumns.map((column) => (_jsx(KanbanColumn, { column: column, tasks: tasks.filter((task) => task.column === column), onSelectTask: onSelectTask, onCreateTask: onCreateTask, onDropTask: onDropTask, onDragTaskOver: onDragTaskOver, onDragTaskStart: onDragTaskStart, onDragTaskMove: onDragTaskMove, onDragTaskEnd: onDragTaskEnd, isDropTarget: activeDropColumn === column, isDragging: isDragging }, column))) }) })] }));
};
