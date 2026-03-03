import { AnimatePresence, motion } from 'framer-motion';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import { getBoardColumnLabel } from '@/features/dashboard/dashboard.utils';
import type { BoardColumn } from '@/features/tasks/tasks.types';
import { useI18n } from '@/i18n/use-i18n';

type TaskCreateModalProps = {
  column: BoardColumn | null;
  draftScope: string;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate: string;
    dueDate: string;
    labels: string[];
    column: BoardColumn;
  }) => Promise<boolean>;
  isCreating?: boolean;
};

type TaskCreateDraft = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  dueDate: string;
  labels: string;
};

const emptyDraft: TaskCreateDraft = {
  title: '',
  description: '',
  priority: 'medium',
  startDate: '',
  dueDate: '',
  labels: '',
};

export const TaskCreateModal = ({ column, draftScope, onClose, onCreate, isCreating = false }: TaskCreateModalProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
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
    if (!draftKey || !column) return;
    const nextDraft: TaskCreateDraft = {
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

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    handleClose();
  };

  const columnLabel = column ? getBoardColumnLabel(column, t) : '';

  useEffect(() => {
    if (column && !startDate) {
      setStartDate(new Date().toISOString().slice(0, 10));
    }
  }, [column, startDate]);

  useEffect(() => {
    if (!draftKey) return;
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
      const parsed = JSON.parse(raw) as TaskCreateDraft;
      setTitle(parsed.title ?? emptyDraft.title);
      setDescription(parsed.description ?? emptyDraft.description);
      setPriority(parsed.priority ?? emptyDraft.priority);
      setStartDate(parsed.startDate || new Date().toISOString().slice(0, 10));
      setDueDate(parsed.dueDate ?? emptyDraft.dueDate);
      setLabels(parsed.labels ?? emptyDraft.labels);
    } catch {
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
    if (!draftKey || !column) return;
    const nextDraft: TaskCreateDraft = {
      title,
      description,
      priority,
      startDate,
      dueDate,
      labels,
    };
    localStorage.setItem(draftKey, JSON.stringify(nextDraft));
  }, [draftKey, column, title, description, priority, startDate, dueDate, labels]);

  return (
    <AnimatePresence>
      {column ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-background/55 backdrop-blur-sm"
            aria-label="Close create task"
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center px-2.5 pb-2.5 pt-0 sm:px-4 sm:pb-4 sm:pt-0"
          >
            <div className="flex w-[min(96vw,680px)] max-h-[90dvh] flex-col rounded-2xl border border-border/70 bg-card/95 p-4 shadow-panel sm:p-5">
              <h3 className="text-lg font-semibold tracking-tight">{t('task.createTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('task.createSubtitle')} <span className="font-medium text-foreground">{columnLabel}</span>
              </p>
              <p className="mt-3 mb-1 text-xs text-muted-foreground">
                {t('task.help.form')}
              </p>

              <form
                className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-0.5 pt-1"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canSubmit || isCreating) return;

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
                  if (!created) return;

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
                }}
              >
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t('task.field.title')} · {t('task.field.required')}
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={t('task.titlePlaceholder')}
                    className="h-10 w-full rounded-md border border-border/70 bg-background/25 px-3 text-sm outline-none focus:border-primary/45"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">{titleError || t('task.help.title')}</span>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t('task.field.description')} · {t('task.field.optional')}
                  </span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={700}
                    rows={3}
                    placeholder={t('task.descriptionPlaceholder')}
                    className="w-full resize-none rounded-md border border-border/70 bg-background/25 p-2.5 text-sm outline-none focus:border-primary/45"
                  />
                  <span className="mt-1 block text-right text-[11px] text-muted-foreground">{description.length}/700</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t('task.help.description')}</span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.priority')}</span>
                    <select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                      className="ui-select h-10 w-full rounded-md px-3 text-sm"
                    >
                      <option value="low">{t('task.priority.low')}</option>
                      <option value="medium">{t('task.priority.medium')}</option>
                      <option value="high">{t('task.priority.high')}</option>
                      <option value="urgent">{t('task.priority.urgent')}</option>
                    </select>
                    <span className="mt-1 block text-xs text-muted-foreground">{t('task.help.priority')}</span>
                  </label>

                  <label className="block space-y-1">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.startDate')}</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="ui-date h-10 w-full rounded-md px-3 text-sm"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">{startDateError || t('task.help.startDate')}</span>
                  </label>

                  <label className="block space-y-1">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.dueDate')}</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="ui-date h-10 w-full rounded-md px-3 text-sm"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">{dueDateError || t('task.help.dueDate')}</span>
                  </label>

                  <label className="block space-y-1">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.labels')}</span>
                    <input
                      value={labels}
                      onChange={(event) => setLabels(event.target.value)}
                      placeholder={t('task.labelsPlaceholder')}
                      className="h-10 w-full rounded-md border border-border/70 bg-background/25 px-3 text-sm outline-none focus:border-primary/45"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">{t('task.help.labels')}</span>
                  </label>
                </div>

                <div className="sticky bottom-0 mt-auto flex flex-wrap justify-end gap-2 border-t border-border/60 bg-card/95 pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="h-9 w-full rounded-md border border-border/70 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:w-auto"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit || isCreating}
                    className="h-9 w-full rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {t('task.createAction')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
