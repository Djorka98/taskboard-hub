import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckSquare,
  ChevronDown,
  CircleX,
  ExternalLink,
  MessagesSquare,
  Paperclip,
  Plus,
  Send,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { toast } from 'sonner';

import type { TaskItem } from '@/features/dashboard/dashboard.types';
import { getBoardColumnLabel } from '@/features/dashboard/dashboard.utils';
import { useI18n } from '@/i18n/use-i18n';
import type { BoardColumn } from '@/features/tasks/tasks.types';
import { cn } from '@/lib/utils';

type TaskDetailDrawerProps = {
  task: TaskItem | null;
  storageScope: string;
  columns: BoardColumn[];
  onClose: () => void;
  onSave: (input: {
    title: string;
    description: string;
    priority: TaskItem['priority'];
    startDate: string;
    dueDate: string;
    labels: string[];
    column: BoardColumn;
  }) => void;
  onDelete: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const Section = ({ title, subtitle, children }: SectionProps) => {
  return (
    <section className="mt-3 rounded-xl border border-border/70 bg-card/70 p-3.5 shadow-panel first:mt-0">
      <div className="mb-2.5">
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
};

type EditableFieldProps = {
  label: string;
  value: string;
  icon?: ComponentType<{ size?: number }>;
  tone?: 'default' | 'highlight';
};

const EditableField = ({ label, value, icon: Icon, tone = 'default' }: EditableFieldProps) => {
  return (
    <button
      type="button"
      className={cn(
        'group rounded-lg border px-2.5 py-2 text-left transition-all duration-200',
        tone === 'highlight'
          ? 'border-primary/35 bg-primary/10 hover:border-primary/45 hover:bg-primary/15'
          : 'border-border/70 bg-background/25 hover:border-border hover:bg-muted/40',
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="mt-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
          {Icon ? <Icon size={13} /> : null}
          {value}
        </span>
        <ChevronDown size={14} className="text-muted-foreground transition-colors group-hover:text-foreground" />
      </span>
    </button>
  );
};

const StatPill = ({ icon: Icon, label }: { icon: ComponentType<{ size?: number }>; label: string }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/25 px-2.5 py-1 text-xs text-muted-foreground">
      <Icon size={13} />
      {label}
    </span>
  );
};

const fieldGridClass = 'grid grid-cols-1 gap-2 sm:grid-cols-2';

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
};

type CommentEntry = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type AttachmentEntry = {
  id: string;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
  dataUrl?: string;
};

type TaskDetailStorage = {
  commentsByTaskId: Record<string, CommentEntry[]>;
  attachmentsByTaskId: Record<string, AttachmentEntry[]>;
  checklistByTaskId: Record<string, ChecklistItem[]>;
  draftsByTaskId: Record<
    string,
    {
      title: string;
      description: string;
      priority: TaskItem['priority'];
      column: BoardColumn;
      startDate: string;
      dueDate: string;
      labels: string;
    }
  >;
};

const toDataUrl = async (file: File) => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const TaskDetailDrawer = ({ task, storageScope, columns, onClose, onSave, onDelete, isSaving = false, isDeleting = false }: TaskDetailDrawerProps) => {
  const { t } = useI18n();
  const storageKey = `nexus:task-detail:${storageScope}`;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [column, setColumn] = useState<BoardColumn>('To Do');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [commentsByTaskId, setCommentsByTaskId] = useState<Record<string, CommentEntry[]>>({});
  const [attachmentsByTaskId, setAttachmentsByTaskId] = useState<Record<string, AttachmentEntry[]>>({});
  const [checklistByTaskId, setChecklistByTaskId] = useState<Record<string, ChecklistItem[]>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draftsByTaskId, setDraftsByTaskId] = useState<
    Record<
      string,
      {
        title: string;
        description: string;
        priority: TaskItem['priority'];
        column: BoardColumn;
        startDate: string;
        dueDate: string;
        labels: string;
      }
    >
  >({});
  const draftsByTaskIdRef = useRef(draftsByTaskId);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setCommentsByTaskId({});
      setAttachmentsByTaskId({});
      setChecklistByTaskId({});
      setDraftsByTaskId({});
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TaskDetailStorage;
      setCommentsByTaskId(parsed.commentsByTaskId ?? {});
      setAttachmentsByTaskId(parsed.attachmentsByTaskId ?? {});
      setChecklistByTaskId(parsed.checklistByTaskId ?? {});
      setDraftsByTaskId(parsed.draftsByTaskId ?? {});
    } catch {
      localStorage.removeItem(storageKey);
      setCommentsByTaskId({});
      setAttachmentsByTaskId({});
      setChecklistByTaskId({});
      setDraftsByTaskId({});
    }
  }, [storageKey]);

  useEffect(() => {
    const payload: TaskDetailStorage = {
      commentsByTaskId,
      attachmentsByTaskId,
      checklistByTaskId,
      draftsByTaskId,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors, state remains in-memory
    }
  }, [storageKey, commentsByTaskId, attachmentsByTaskId, checklistByTaskId, draftsByTaskId]);

  useEffect(() => {
    draftsByTaskIdRef.current = draftsByTaskId;
  }, [draftsByTaskId]);

  useEffect(() => {
    if (!task) return;
    const draft = draftsByTaskIdRef.current[task.id];
    if (draft) {
      setTitle(draft.title);
      setDescription(draft.description);
      setPriority(draft.priority);
      setColumn(draft.column);
      setStartDate(draft.startDate);
      setDueDate(draft.dueDate);
      setLabels(draft.labels);
    } else {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setColumn(task.column);
      setStartDate(task.startDate.slice(0, 10));
      setDueDate(task.dueDate.slice(0, 10));
      setLabels(task.labels.join(', '));
    }
    setCommentInput('');
    setNewTagInput('');

    const savedChecklist = checklistByTaskId[task.id];
    if (savedChecklist) {
      setChecklistItems(savedChecklist);
    } else {
      setChecklistItems([]);
    }
  }, [task?.id, t]);

  useEffect(() => {
    if (!task) return;
    setChecklistByTaskId((current) => ({
      ...current,
      [task.id]: checklistItems,
    }));
  }, [task?.id, checklistItems]);

  useEffect(() => {
    return () => {
      Object.values(attachmentsByTaskId)
        .flat()
        .forEach((file) => {
          if (file.previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
    };
  }, [attachmentsByTaskId]);

  useEffect(() => {
    if (!task) return;
    setDraftsByTaskId((current) => {
      const nextDraft = {
        title,
        description,
        priority,
        column,
        startDate,
        dueDate,
        labels,
      };

      const prevDraft = current[task.id];
      if (
        prevDraft &&
        prevDraft.title === nextDraft.title &&
        prevDraft.description === nextDraft.description &&
        prevDraft.priority === nextDraft.priority &&
        prevDraft.column === nextDraft.column &&
        prevDraft.startDate === nextDraft.startDate &&
        prevDraft.dueDate === nextDraft.dueDate &&
        prevDraft.labels === nextDraft.labels
      ) {
        return current;
      }

      return {
        ...current,
        [task.id]: nextDraft,
      };
    });
  }, [task?.id, title, description, priority, column, startDate, dueDate, labels]);

  const parsedLabels = useMemo(
    () => labels.split(',').map((label) => label.trim()).filter(Boolean),
    [labels],
  );

  const titleError =
    title.trim().length === 0 ? t('task.error.titleRequired') : title.trim().length < 3 ? t('task.error.titleMin') : '';
  const startDateError = !startDate ? t('task.error.startDateRequired') : '';
  const dueDateError = !dueDate
    ? t('task.error.dueDateRequired')
    : startDate && new Date(dueDate) < new Date(startDate)
      ? t('task.error.dueAfterStart')
      : '';
  const canSave = !titleError && !startDateError && !dueDateError;
  const comments = task ? commentsByTaskId[task.id] ?? [] : [];
  const attachments = task ? attachmentsByTaskId[task.id] ?? [] : [];
  const checklistCompleted = checklistItems.filter((item) => item.done).length;
  const checklistTotal = checklistItems.length;
  const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const handleSendComment = () => {
    if (!task) return;
    const content = commentInput.trim();
    if (!content) return;

    const comment: CommentEntry = {
      id: crypto.randomUUID(),
      author: task.assignee.name || t('task.unassigned'),
      content,
      createdAt: new Date().toISOString(),
    };

    setCommentsByTaskId((current) => ({
      ...current,
      [task.id]: [...(current[task.id] ?? []), comment],
    }));
    setCommentInput('');
    toast.success(t('task.commentQueued'));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!task || !files?.length) return;

    const uploaded = await Promise.all(
      Array.from(files).map(async (file): Promise<AttachmentEntry> => {
        const isImage = file.type.startsWith('image/');
        const dataUrl = await toDataUrl(file);
        const entry: AttachmentEntry = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          dataUrl,
        };

        if (isImage) {
          entry.previewUrl = dataUrl;
        }

        return entry;
      }),
    );

    setAttachmentsByTaskId((current) => ({
      ...current,
      [task.id]: [...(current[task.id] ?? []), ...uploaded],
    }));
  };

  const handleAddChecklistItem = () => {
    const titleValue = newChecklistItem.trim();
    if (!titleValue) return;
    setChecklistItems((current) => [...current, { id: crypto.randomUUID(), title: titleValue, done: false }]);
    setNewChecklistItem('');
  };

  const handleAddTag = () => {
    const value = newTagInput.trim();
    if (!value) return;
    setLabels((current) => {
      const currentTags = current
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (currentTags.includes(value)) return current;
      return [...currentTags, value].join(', ');
    });
    setNewTagInput('');
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!task) return;
    setAttachmentsByTaskId((current) => ({
      ...current,
      [task.id]: (current[task.id] ?? []).filter((file) => file.id !== attachmentId),
    }));
  };

  const handleOpenAttachment = (file: AttachmentEntry) => {
    const source = file.dataUrl ?? file.previewUrl;
    if (!source) {
      toast.error(t('task.noAttachments'));
      return;
    }

    const openedWindow = window.open('', '_blank');
    if (!openedWindow) {
      toast.error(t('task.toast.updateError'));
      return;
    }

    const renderPreview = (content: HTMLElement) => {
      const doc = openedWindow.document;
      doc.title = file.name;
      doc.body.style.margin = '0';
      doc.body.style.minHeight = '100vh';
      doc.body.style.background = '#0b1220';
      doc.body.style.display = 'flex';
      doc.body.style.alignItems = 'center';
      doc.body.style.justifyContent = 'center';
      doc.body.style.padding = '20px';
      doc.body.style.boxSizing = 'border-box';

      const wrapper = doc.createElement('div');
      wrapper.style.width = 'min(1120px, 100%)';
      wrapper.style.height = 'min(90vh, 960px)';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.border = '1px solid rgba(148,163,184,0.35)';
      wrapper.style.borderRadius = '14px';
      wrapper.style.background = 'rgba(15,23,42,0.92)';
      wrapper.style.overflow = 'hidden';

      const toolbar = doc.createElement('div');
      toolbar.style.display = 'flex';
      toolbar.style.alignItems = 'center';
      toolbar.style.justifyContent = 'space-between';
      toolbar.style.gap = '10px';
      toolbar.style.padding = '10px 12px';
      toolbar.style.borderBottom = '1px solid rgba(148,163,184,0.25)';

      const title = doc.createElement('p');
      title.textContent = file.name;
      title.style.margin = '0';
      title.style.color = '#e2e8f0';
      title.style.font = '600 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      title.style.whiteSpace = 'nowrap';

      const actions = doc.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';

      const actionButtonStyle = (button: HTMLButtonElement) => {
        button.style.border = '1px solid rgba(148,163,184,0.45)';
        button.style.background = 'transparent';
        button.style.color = '#e2e8f0';
        button.style.borderRadius = '8px';
        button.style.padding = '6px 10px';
        button.style.cursor = 'pointer';
        button.style.font = '500 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      };

      const downloadButton = doc.createElement('button');
      downloadButton.type = 'button';
      downloadButton.textContent = t('task.downloadFile');
      actionButtonStyle(downloadButton);
      downloadButton.onclick = () => {
        const anchor = doc.createElement('a');
        anchor.href = source;
        anchor.download = file.name;
        anchor.click();
      };

      const closeButton = doc.createElement('button');
      closeButton.type = 'button';
      closeButton.textContent = t('common.close');
      actionButtonStyle(closeButton);
      closeButton.onclick = () => openedWindow.close();

      const contentArea = doc.createElement('div');
      contentArea.style.flex = '1';
      contentArea.style.minHeight = '0';
      contentArea.style.display = 'flex';
      contentArea.style.alignItems = 'center';
      contentArea.style.justifyContent = 'center';
      contentArea.style.padding = '10px';

      actions.append(downloadButton, closeButton);
      toolbar.append(title, actions);
      contentArea.appendChild(content);
      wrapper.append(toolbar, contentArea);
      doc.body.replaceChildren(wrapper);
    };

    if (file.type.startsWith('image/')) {
      const image = openedWindow.document.createElement('img');
      image.src = source;
      image.alt = file.name;
      image.style.maxWidth = '100%';
      image.style.maxHeight = '100%';
      image.style.objectFit = 'contain';
      renderPreview(image);
      return;
    }

    if (file.type.includes('pdf')) {
      const iframe = openedWindow.document.createElement('iframe');
      iframe.src = source;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      renderPreview(iframe);
      return;
    }

    openedWindow.location.href = source;
  };

  const handleRemoveComment = (commentId: string) => {
    if (!task) return;
    setCommentsByTaskId((current) => ({
      ...current,
      [task.id]: (current[task.id] ?? []).filter((comment) => comment.id !== commentId),
    }));
  };

  return (
    <AnimatePresence>
      {task ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/55 backdrop-blur-sm"
            aria-label="Close task details"
          />
          <motion.aside
            initial={{ x: 460, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 460, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex h-screen w-full max-w-full flex-col border-l border-border/70 bg-card/95 p-4 pb-4 shadow-[0_24px_48px_-22px_hsl(var(--foreground)/0.6)] sm:top-0 sm:right-3 sm:bottom-0 sm:left-auto sm:h-screen sm:max-h-none sm:w-[min(680px,96vw)] sm:max-w-none sm:rounded-none sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('task.details')}</p>
                <h3 className="break-words text-xl font-semibold tracking-tight">{task.title}</h3>
                <p className="break-words text-sm text-muted-foreground">{task.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CircleX size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              <Section title={t('task.section.overview')} subtitle={t('task.section.overviewHelp')}>
                <div className={fieldGridClass}>
                  <label className="rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-2 text-left">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.status')}</span>
                    <select
                      value={column}
                      onChange={(event) => setColumn(event.target.value as BoardColumn)}
                      className="ui-select mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium"
                    >
                      {columns.map((item) => (
                        <option key={item} value={item} className="bg-card text-foreground">
                          {getBoardColumnLabel(item, t)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-2 text-left">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.priority')}</span>
                    <select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value as TaskItem['priority'])}
                      className="ui-select mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium"
                    >
                      <option value="low" className="bg-card text-foreground">
                        {t('task.priority.low')}
                      </option>
                      <option value="medium" className="bg-card text-foreground">
                        {t('task.priority.medium')}
                      </option>
                      <option value="high" className="bg-card text-foreground">
                        {t('task.priority.high')}
                      </option>
                      <option value="urgent" className="bg-card text-foreground">
                        {t('task.priority.urgent')}
                      </option>
                    </select>
                  </label>

                  <label className="rounded-lg border border-border/70 bg-background/25 px-2.5 py-2 text-left">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.startDate')}</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="ui-date mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium"
                    />
                  </label>

                  <label className="rounded-lg border border-border/70 bg-background/25 px-2.5 py-2 text-left">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.dueDate')}</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="ui-date mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium"
                    />
                  </label>

                  <EditableField label={t('task.field.assignee')} value={task.assignee.name || t('task.unassigned')} icon={UserRound} />
                </div>

                <div className="mt-3 grid gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.title')}</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/25 px-2.5 text-sm outline-none focus:border-primary/40"
                    />
                    {titleError ? <span className="mt-1 block text-xs text-muted-foreground">{titleError}</span> : null}
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.field.description')}</span>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={900}
                      className="w-full resize-none rounded-md border border-border/70 bg-background/25 p-2.5 text-sm outline-none focus:border-primary/40"
                    />
                    <span className="mt-1 block text-right text-[11px] text-muted-foreground">{description.length}/900</span>
                  </label>
                </div>
              </Section>

              <Section title={t('task.section.tags')} subtitle={t('task.section.tagsHelp')}>
                <div className="flex flex-wrap gap-2">
                  {parsedLabels.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setLabels((current) => current.split(',').map((item) => item.trim()).filter((item) => item !== label).join(', '))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      <Tag size={12} />
                      {label}
                      <Trash2 size={11} className="ml-0.5" />
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap">
                  <input
                    value={newTagInput}
                    onChange={(event) => setNewTagInput(event.target.value)}
                    placeholder={t('task.newTagPrompt')}
                    className="h-8 w-full rounded-md border border-border/70 bg-card/60 px-2 text-xs outline-none focus:border-primary/40"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:w-auto"
                  >
                    <Plus size={12} /> {t('task.addTag')}
                  </button>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('task.editTags')}</span>
                  <input
                    value={labels}
                    onChange={(event) => setLabels(event.target.value)}
                    placeholder={t('task.tagsPlaceholder')}
                    className="h-9 w-full rounded-md border border-border/70 bg-background/25 px-2.5 text-sm outline-none focus:border-primary/40"
                  />
                </label>
              </Section>

              <Section title={t('task.section.checklist')} subtitle={t('task.section.checklistHelp')}>
                <div className="rounded-lg border border-border/70 bg-background/25 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CheckSquare size={12} /> {checklistCompleted}/{checklistTotal} {t('task.completed')}
                    </span>
                    <span>{checklistProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded bg-muted/80">
                    <div className="h-1.5 rounded bg-primary transition-all" style={{ width: `${checklistProgress}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap">
                    <input
                      value={newChecklistItem}
                      onChange={(event) => setNewChecklistItem(event.target.value)}
                      placeholder={t('task.checklist.newItem')}
                      className="h-8 w-full rounded-md border border-border/70 bg-card/60 px-2 text-xs outline-none focus:border-primary/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="inline-flex h-8 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-border/70 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 sm:w-auto"
                    >
                      {t('task.checklist.addItem')}
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {checklistItems.length === 0 ? <p className="text-xs text-muted-foreground">{t('task.checklist.newItem')}</p> : null}
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/50 px-2.5 py-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setChecklistItems((current) =>
                              current.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)),
                            )
                          }
                          className="w-full text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.done ? '☑' : '☐'} {item.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => setChecklistItems((current) => current.filter((entry) => entry.id !== item.id))}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                          aria-label="Delete checklist item"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title={t('task.section.activity')} subtitle={t('task.section.activityHelp')}>
                <ul className="space-y-1.5">
                  {task.activity.map((item) => (
                    <li key={item} className="rounded-md border border-border/70 bg-background/25 px-2.5 py-2 text-xs text-muted-foreground">
                      {item === 'task_sync' || item === 'backend_sync' ? t('activity.syncUpdate') : item}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={t('task.section.files')} subtitle={t('task.section.filesHelp')}>
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{t('task.filesHint')}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-border/70 px-2.5 text-xs text-foreground transition-colors hover:bg-muted/60 sm:w-auto"
                    >
                      <Paperclip size={12} />
                      {t('task.uploadFiles')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        void handleFileUpload(event.target.files);
                        event.currentTarget.value = '';
                      }}
                    />
                  </div>

                  {attachments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-background/25 p-3 text-xs text-muted-foreground">
                      {t('task.noAttachments')}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {attachments.map((file) => (
                        <li key={file.id} className="rounded-lg border border-border/70 bg-background/25 p-2.5">
                          {file.previewUrl ? (
                            <div className="mb-2 overflow-hidden rounded-md border border-border/60 bg-card/50">
                              <img src={file.previewUrl} alt={file.name} className="h-28 w-full object-cover sm:h-32" />
                            </div>
                          ) : null}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground" title={file.name}>{file.name}</p>
                              <p className="text-[11px] text-muted-foreground">{file.type} · {file.size}</p>
                            </div>
                            <div className="flex w-full items-center gap-1.5 sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleOpenAttachment(file)}
                                className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-border/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:h-7 sm:flex-none sm:px-2"
                              >
                                <ExternalLink size={11} />
                                {t('task.openFile')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(file.id)}
                                className="inline-flex h-7 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:w-7"
                                aria-label="Delete attachment"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>

              <Section title={t('task.section.comments')} subtitle={t('task.section.commentsHelp')}>
                <div className="space-y-2.5">
                  {comments.length === 0 ? (
                    <div className="rounded-lg border border-border/70 bg-background/25 p-3 text-xs text-muted-foreground">
                      <p className="mb-2 text-sm text-foreground">{t('task.commentsEmpty')}</p>
                      {t('task.commentsConnect')}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {comments.map((comment) => (
                        <li key={comment.id} className="rounded-lg border border-border/70 bg-background/25 p-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground">{comment.author}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                              <button
                                type="button"
                                onClick={() => handleRemoveComment(comment.id)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                aria-label="Delete comment"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="rounded-lg border border-border/70 bg-background/25 p-2.5">
                    <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">{t('task.writeComment')}</div>
                    <textarea
                      rows={3}
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      maxLength={450}
                      placeholder={t('task.commentPlaceholder')}
                      className="w-full resize-none rounded-md border border-border/70 bg-card/60 p-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
                    />
                    <p className="mt-1 text-right text-[11px] text-muted-foreground">{commentInput.length}/450</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatPill icon={MessagesSquare} label={`${comments.length} ${t('task.commentsCount')}`} />
                        <StatPill icon={Paperclip} label={`${attachments.length} ${t('task.attachmentsCount')}`} />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendComment}
                        className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:brightness-110 sm:w-auto"
                      >
                        <Send size={12} />
                        {t('task.send')}
                      </button>
                    </div>
                  </div>
                </div>
              </Section>

            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/70 bg-card/95 pt-3">
              <button
                type="button"
                onClick={() =>
                  !isSaving &&
                  !isDeleting &&
                  canSave &&
                  task &&
                  (() => {
                    onSave({
                      title,
                      description,
                      priority,
                      startDate,
                      dueDate,
                      labels: parsedLabels,
                      column,
                    });
                    setDraftsByTaskId((current) => {
                      const next = { ...current };
                      delete next[task.id];
                      return next;
                    });
                  })()
                }
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={!canSave || isSaving || isDeleting}
              >
                {t('task.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isSaving || isDeleting) return;
                  if (task) {
                    setDraftsByTaskId((current) => {
                      const next = { ...current };
                      delete next[task.id];
                      return next;
                    });
                  }
                  onDelete();
                }}
                disabled={isSaving || isDeleting}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-auto"
              >
                {t('task.delete')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:ml-auto sm:w-auto"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
