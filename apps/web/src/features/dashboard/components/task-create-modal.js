import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getBoardColumnLabel } from '@/features/dashboard/dashboard.utils';
import { useI18n } from '@/i18n/use-i18n';
const emptyDraft = {
    title: '',
    description: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    labels: '',
};
export const TaskCreateModal = ({ column, draftScope, onClose, onCreate, isCreating = false }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState('');
    const titleError = title.trim().length === 0 ? t('task.error.titleRequired') : title.trim().length < 3 ? t('task.error.titleMin') : '';
    const startDateError = !startDate ? t('task.error.startDateRequired') : '';
    const dueDateError = !dueDate
        ? t('task.error.dueDateRequired')
        : startDate && new Date(dueDate) < new Date(startDate)
            ? t('task.error.dueAfterStart')
            : '';
    const canSubmit = !titleError && !startDateError && !dueDateError;
    const draftKey = column ? `nexus:task-create-draft:${draftScope}:${column}` : null;
    const persistDraftNow = () => {
        if (!draftKey || !column)
            return;
        const nextDraft = {
            title,
            description,
            priority,
            startDate,
            dueDate,
            labels,
        };
        localStorage.setItem(draftKey, JSON.stringify(nextDraft));
    };
    const handleClose = () => {
        persistDraftNow();
        onClose();
    };
    const handleBackdropClick = (event) => {
        if (event.target !== event.currentTarget)
            return;
        handleClose();
    };
    const columnLabel = column ? getBoardColumnLabel(column, t) : '';
    useEffect(() => {
        if (column && !startDate) {
            setStartDate(new Date().toISOString().slice(0, 10));
        }
    }, [column, startDate]);
    useEffect(() => {
        if (!draftKey)
            return;
        const raw = localStorage.getItem(draftKey);
        if (!raw) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStartDate(new Date().toISOString().slice(0, 10));
            setDueDate('');
            setLabels('');
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            setTitle(parsed.title ?? emptyDraft.title);
            setDescription(parsed.description ?? emptyDraft.description);
            setPriority(parsed.priority ?? emptyDraft.priority);
            setStartDate(parsed.startDate || new Date().toISOString().slice(0, 10));
            setDueDate(parsed.dueDate ?? emptyDraft.dueDate);
            setLabels(parsed.labels ?? emptyDraft.labels);
        }
        catch {
            localStorage.removeItem(draftKey);
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStartDate(new Date().toISOString().slice(0, 10));
            setDueDate('');
            setLabels('');
        }
    }, [draftKey]);
    useEffect(() => {
        if (!draftKey || !column)
            return;
        const nextDraft = {
            title,
            description,
            priority,
            startDate,
            dueDate,
            labels,
        };
        localStorage.setItem(draftKey, JSON.stringify(nextDraft));
    }, [draftKey, column, title, description, priority, startDate, dueDate, labels]);
    return (_jsx(AnimatePresence, { children: column ? (_jsxs(_Fragment, { children: [_jsx(motion.button, { type: "button", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: handleClose, className: "fixed inset-0 z-40 bg-background/55 backdrop-blur-sm", "aria-label": "Close create task" }), _jsx(motion.div, { initial: { opacity: 0, y: 18, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 12, scale: 0.98 }, onClick: handleBackdropClick, className: "fixed inset-0 z-50 flex items-center justify-center px-2.5 pb-2.5 pt-0 sm:px-4 sm:pb-4 sm:pt-0", children: _jsxs("div", { className: "flex w-[min(96vw,680px)] max-h-[90dvh] flex-col rounded-2xl border border-border/70 bg-card/95 p-4 shadow-panel sm:p-5", children: [_jsx("h3", { className: "text-lg font-semibold tracking-tight", children: t('task.createTitle') }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [t('task.createSubtitle'), " ", _jsx("span", { className: "font-medium text-foreground", children: columnLabel })] }), _jsx("p", { className: "mt-3 mb-1 text-xs text-muted-foreground", children: t('task.help.form') }), _jsxs("form", { className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-0.5 pt-1", onSubmit: async (event) => {
                                    event.preventDefault();
                                    if (!canSubmit || isCreating)
                                        return;
                                    const created = await onCreate({
                                        title: title.trim(),
                                        description: description.trim(),
                                        priority,
                                        startDate,
                                        dueDate,
                                        labels: labels
                                            .split(',')
                                            .map((item) => item.trim())
                                            .filter(Boolean),
                                        column,
                                    });
                                    if (!created)
                                        return;
                                    if (draftKey) {
                                        localStorage.removeItem(draftKey);
                                    }
                                    setTitle(emptyDraft.title);
                                    setDescription(emptyDraft.description);
                                    setPriority(emptyDraft.priority);
                                    setStartDate(new Date().toISOString().slice(0, 10));
                                    setDueDate(emptyDraft.dueDate);
                                    setLabels(emptyDraft.labels);
                                    onClose();
                                }, children: [_jsxs("label", { className: "block", children: [_jsxs("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: [t('task.field.title'), " \u00B7 ", t('task.field.required')] }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value), placeholder: t('task.titlePlaceholder'), className: "h-10 w-full rounded-md border border-border/70 bg-background/25 px-3 text-sm outline-none focus:border-primary/45" }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: titleError || t('task.help.title') })] }), _jsxs("label", { className: "block", children: [_jsxs("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: [t('task.field.description'), " \u00B7 ", t('task.field.optional')] }), _jsx("textarea", { value: description, onChange: (event) => setDescription(event.target.value), maxLength: 700, rows: 3, placeholder: t('task.descriptionPlaceholder'), className: "w-full resize-none rounded-md border border-border/70 bg-background/25 p-2.5 text-sm outline-none focus:border-primary/45" }), _jsxs("span", { className: "mt-1 block text-right text-[11px] text-muted-foreground", children: [description.length, "/700"] }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: t('task.help.description') })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsxs("label", { className: "block space-y-1", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.priority') }), _jsxs("select", { value: priority, onChange: (event) => setPriority(event.target.value), className: "ui-select h-10 w-full rounded-md px-3 text-sm", children: [_jsx("option", { value: "low", children: t('task.priority.low') }), _jsx("option", { value: "medium", children: t('task.priority.medium') }), _jsx("option", { value: "high", children: t('task.priority.high') }), _jsx("option", { value: "urgent", children: t('task.priority.urgent') })] }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: t('task.help.priority') })] }), _jsxs("label", { className: "block space-y-1", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.startDate') }), _jsx("input", { type: "date", value: startDate, onChange: (event) => setStartDate(event.target.value), className: "ui-date h-10 w-full rounded-md px-3 text-sm" }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: startDateError || t('task.help.startDate') })] }), _jsxs("label", { className: "block space-y-1", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.dueDate') }), _jsx("input", { type: "date", value: dueDate, onChange: (event) => setDueDate(event.target.value), className: "ui-date h-10 w-full rounded-md px-3 text-sm" }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: dueDateError || t('task.help.dueDate') })] }), _jsxs("label", { className: "block space-y-1", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.labels') }), _jsx("input", { value: labels, onChange: (event) => setLabels(event.target.value), placeholder: t('task.labelsPlaceholder'), className: "h-10 w-full rounded-md border border-border/70 bg-background/25 px-3 text-sm outline-none focus:border-primary/45" }), _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: t('task.help.labels') })] })] }), _jsxs("div", { className: "sticky bottom-0 mt-auto flex flex-wrap justify-end gap-2 border-t border-border/60 bg-card/95 pt-3", children: [_jsx("button", { type: "button", onClick: handleClose, disabled: isCreating, className: "h-9 w-full rounded-md border border-border/70 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:w-auto", children: t('common.cancel') }), _jsx("button", { type: "submit", disabled: !canSubmit || isCreating, className: "h-9 w-full rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto", children: t('task.createAction') })] })] })] }) })] })) : null }));
};
