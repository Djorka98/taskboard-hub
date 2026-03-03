import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCheck, CircleDashed, Clock3, FolderKanban } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n/use-i18n';
const useAnimatedNumber = (target) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const totalDuration = 500;
        const steps = 24;
        const stepTime = totalDuration / steps;
        let current = 0;
        const timer = window.setInterval(() => {
            current += 1;
            const nextValue = Math.round((target * current) / steps);
            setValue(nextValue);
            if (current >= steps) {
                window.clearInterval(timer);
            }
        }, stepTime);
        return () => window.clearInterval(timer);
    }, [target]);
    return value;
};
const KpiMetric = ({ card }) => {
    const value = useAnimatedNumber(card.value);
    const Icon = card.icon;
    return (_jsxs("article", { className: "group rounded-xl border border-border/70 bg-card/80 p-3 shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card sm:p-3.5", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("span", { className: "min-w-0 break-words text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: card.title }), _jsx("div", { className: "rounded-md border border-border/70 bg-background/40 p-1.5 text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:text-foreground", children: _jsx(Icon, { size: 14 }) })] }), _jsxs("div", { className: "mt-2 flex items-end justify-between gap-2", children: [_jsx("p", { className: "text-[1.45rem] font-semibold tracking-tight", children: value }), _jsx("span", { className: "max-w-[65%] text-right text-[11px] leading-4 text-muted-foreground", children: card.hint })] })] }));
};
export const KpiRow = ({ tasks }) => {
    const { t } = useI18n();
    const cards = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return [
            { title: t('board.kpi.total'), value: tasks.length, hint: t('board.kpi.totalHint'), icon: FolderKanban },
            {
                title: t('board.kpi.progress'),
                value: tasks.filter((task) => task.raw.status === 'in_progress').length,
                hint: t('board.kpi.progressHint'),
                icon: CircleDashed,
            },
            {
                title: t('board.kpi.overdue'),
                value: tasks.filter((task) => {
                    if (task.raw.status === 'completed')
                        return false;
                    if (!task.raw.dueDate)
                        return false;
                    return new Date(task.raw.dueDate) < now;
                }).length,
                hint: t('board.kpi.overdueHint'),
                icon: Clock3,
            },
            {
                title: t('board.kpi.completed'),
                value: tasks.filter((task) => {
                    if (task.raw.status !== 'completed')
                        return false;
                    return new Date(task.raw.updatedAt) >= weekAgo;
                }).length,
                hint: t('board.kpi.completedHint'),
                icon: CheckCheck,
            },
        ];
    }, [tasks, t]);
    return (_jsx("section", { className: "grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4", children: cards.map((card) => (_jsx(KpiMetric, { card: card }, card.title))) }));
};
