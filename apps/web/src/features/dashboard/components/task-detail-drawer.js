import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, ChevronDown, CircleX, ExternalLink, MessagesSquare, Paperclip, Plus, Send, Tag, Trash2, UserRound, } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getBoardColumnLabel } from '@/features/dashboard/dashboard.utils';
import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';
const Section = ({ title, subtitle, children }) => {
    return (_jsxs("section", { className: "rounded-xl border border-border/70 bg-card/70 p-3.5 shadow-panel", children: [_jsxs("div", { className: "mb-2.5", children: [_jsx("h4", { className: "text-sm font-semibold tracking-tight", children: title }), subtitle ? _jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: subtitle }) : null] }), children] }));
};
const EditableField = ({ label, value, icon: Icon, tone = 'default' }) => {
    return (_jsxs("button", { type: "button", className: cn('group rounded-lg border px-2.5 py-2 text-left transition-all duration-200', tone === 'highlight'
            ? 'border-primary/35 bg-primary/10 hover:border-primary/45 hover:bg-primary/15'
            : 'border-border/70 bg-background/25 hover:border-border hover:bg-muted/40'), children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: label }), _jsxs("span", { className: "mt-1 flex items-center justify-between gap-2", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm font-medium", children: [Icon ? _jsx(Icon, { size: 13 }) : null, value] }), _jsx(ChevronDown, { size: 14, className: "text-muted-foreground transition-colors group-hover:text-foreground" })] })] }));
};
const StatPill = ({ icon: Icon, label }) => {
    return (_jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/25 px-2.5 py-1 text-xs text-muted-foreground", children: [_jsx(Icon, { size: 13 }), label] }));
};
const fieldGridClass = 'grid grid-cols-1 gap-2 sm:grid-cols-2';
const toDataUrl = async (file) => {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};
export const TaskDetailDrawer = ({ task, storageScope, columns, onClose, onSave, onDelete, isSaving = false, isDeleting = false }) => {
    const { t } = useI18n();
    const storageKey = `nexus:task-detail:${storageScope}`;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [column, setColumn] = useState('To Do');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState('');
    const [newTagInput, setNewTagInput] = useState('');
    const [checklistItems, setChecklistItems] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [commentsByTaskId, setCommentsByTaskId] = useState({});
    const [attachmentsByTaskId, setAttachmentsByTaskId] = useState({});
    const [checklistByTaskId, setChecklistByTaskId] = useState({});
    const fileInputRef = useRef(null);
    const [draftsByTaskId, setDraftsByTaskId] = useState({});
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
            const parsed = JSON.parse(raw);
            setCommentsByTaskId(parsed.commentsByTaskId ?? {});
            setAttachmentsByTaskId(parsed.attachmentsByTaskId ?? {});
            setChecklistByTaskId(parsed.checklistByTaskId ?? {});
            setDraftsByTaskId(parsed.draftsByTaskId ?? {});
        }
        catch {
            localStorage.removeItem(storageKey);
            setCommentsByTaskId({});
            setAttachmentsByTaskId({});
            setChecklistByTaskId({});
            setDraftsByTaskId({});
        }
    }, [storageKey]);
    useEffect(() => {
        const payload = {
            commentsByTaskId,
            attachmentsByTaskId,
            checklistByTaskId,
            draftsByTaskId,
        };
        try {
            localStorage.setItem(storageKey, JSON.stringify(payload));
        }
        catch {
            // ignore storage quota errors, state remains in-memory
        }
    }, [storageKey, commentsByTaskId, attachmentsByTaskId, checklistByTaskId, draftsByTaskId]);
    useEffect(() => {
        draftsByTaskIdRef.current = draftsByTaskId;
    }, [draftsByTaskId]);
    useEffect(() => {
        if (!task)
            return;
        const draft = draftsByTaskIdRef.current[task.id];
        if (draft) {
            setTitle(draft.title);
            setDescription(draft.description);
            setPriority(draft.priority);
            setColumn(draft.column);
            setStartDate(draft.startDate);
            setDueDate(draft.dueDate);
            setLabels(draft.labels);
        }
        else {
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
        }
        else {
            setChecklistItems([]);
        }
    }, [task?.id, t]);
    useEffect(() => {
        if (!task)
            return;
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
        if (!task)
            return;
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
            if (prevDraft &&
                prevDraft.title === nextDraft.title &&
                prevDraft.description === nextDraft.description &&
                prevDraft.priority === nextDraft.priority &&
                prevDraft.column === nextDraft.column &&
                prevDraft.startDate === nextDraft.startDate &&
                prevDraft.dueDate === nextDraft.dueDate &&
                prevDraft.labels === nextDraft.labels) {
                return current;
            }
            return {
                ...current,
                [task.id]: nextDraft,
            };
        });
    }, [task?.id, title, description, priority, column, startDate, dueDate, labels]);
    const parsedLabels = useMemo(() => labels.split(',').map((label) => label.trim()).filter(Boolean), [labels]);
    const titleError = title.trim().length === 0 ? t('task.error.titleRequired') : title.trim().length < 3 ? t('task.error.titleMin') : '';
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
        if (!task)
            return;
        const content = commentInput.trim();
        if (!content)
            return;
        const comment = {
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
    const handleFileUpload = async (files) => {
        if (!task || !files?.length)
            return;
        const uploaded = await Promise.all(Array.from(files).map(async (file) => {
            const isImage = file.type.startsWith('image/');
            const dataUrl = await toDataUrl(file);
            const entry = {
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
        }));
        setAttachmentsByTaskId((current) => ({
            ...current,
            [task.id]: [...(current[task.id] ?? []), ...uploaded],
        }));
    };
    const handleAddChecklistItem = () => {
        const titleValue = newChecklistItem.trim();
        if (!titleValue)
            return;
        setChecklistItems((current) => [...current, { id: crypto.randomUUID(), title: titleValue, done: false }]);
        setNewChecklistItem('');
    };
    const handleAddTag = () => {
        const value = newTagInput.trim();
        if (!value)
            return;
        setLabels((current) => {
            const currentTags = current
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            if (currentTags.includes(value))
                return current;
            return [...currentTags, value].join(', ');
        });
        setNewTagInput('');
    };
    const handleRemoveAttachment = (attachmentId) => {
        if (!task)
            return;
        setAttachmentsByTaskId((current) => ({
            ...current,
            [task.id]: (current[task.id] ?? []).filter((file) => file.id !== attachmentId),
        }));
    };
    const handleOpenAttachment = (file) => {
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
        const renderPreview = (content) => {
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
            const actionButtonStyle = (button) => {
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
    const handleRemoveComment = (commentId) => {
        if (!task)
            return;
        setCommentsByTaskId((current) => ({
            ...current,
            [task.id]: (current[task.id] ?? []).filter((comment) => comment.id !== commentId),
        }));
    };
    return (_jsx(AnimatePresence, { children: task ? (_jsxs(_Fragment, { children: [_jsx(motion.button, { type: "button", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, onClick: onClose, className: "fixed inset-0 z-40 bg-background/55 backdrop-blur-sm", "aria-label": "Close task details" }), _jsxs(motion.aside, { initial: { x: 460, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 460, opacity: 0 }, transition: { duration: 0.24, ease: 'easeOut' }, className: "fixed inset-0 z-50 flex h-screen w-full max-w-full flex-col border-l border-border/70 bg-card/95 p-4 pb-4 shadow-[0_24px_48px_-22px_hsl(var(--foreground)/0.6)] sm:top-0 sm:right-3 sm:bottom-0 sm:left-auto sm:h-screen sm:max-h-none sm:w-[min(680px,96vw)] sm:max-w-none sm:rounded-none sm:p-5", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4", children: [_jsxs("div", { className: "min-w-0 space-y-1", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: t('task.details') }), _jsx("h3", { className: "break-words text-xl font-semibold tracking-tight", children: task.title }), _jsx("p", { className: "break-words text-sm text-muted-foreground", children: task.description })] }), _jsx("button", { type: "button", onClick: onClose, className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: _jsx(CircleX, { size: 16 }) })] }), _jsxs("div", { className: "min-h-0 flex-1 space-y-3 overflow-y-auto pr-1", children: [_jsxs(Section, { title: t('task.section.overview'), subtitle: t('task.section.overviewHelp'), children: [_jsxs("div", { className: fieldGridClass, children: [_jsxs("label", { className: "rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-2 text-left", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.status') }), _jsx("select", { value: column, onChange: (event) => setColumn(event.target.value), className: "ui-select mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium", children: columns.map((item) => (_jsx("option", { value: item, className: "bg-card text-foreground", children: getBoardColumnLabel(item, t) }, item))) })] }), _jsxs("label", { className: "rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-2 text-left", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.priority') }), _jsxs("select", { value: priority, onChange: (event) => setPriority(event.target.value), className: "ui-select mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium", children: [_jsx("option", { value: "low", className: "bg-card text-foreground", children: t('task.priority.low') }), _jsx("option", { value: "medium", className: "bg-card text-foreground", children: t('task.priority.medium') }), _jsx("option", { value: "high", className: "bg-card text-foreground", children: t('task.priority.high') }), _jsx("option", { value: "urgent", className: "bg-card text-foreground", children: t('task.priority.urgent') })] })] }), _jsxs("label", { className: "rounded-lg border border-border/70 bg-background/25 px-2.5 py-2 text-left", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.startDate') }), _jsx("input", { type: "date", value: startDate, onChange: (event) => setStartDate(event.target.value), className: "ui-date mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium" })] }), _jsxs("label", { className: "rounded-lg border border-border/70 bg-background/25 px-2.5 py-2 text-left", children: [_jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.dueDate') }), _jsx("input", { type: "date", value: dueDate, onChange: (event) => setDueDate(event.target.value), className: "ui-date mt-1 h-8 w-full rounded-md bg-card/60 px-2.5 text-sm font-medium" })] }), _jsx(EditableField, { label: t('task.field.assignee'), value: task.assignee.name || t('task.unassigned'), icon: UserRound })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.title') }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value), className: "h-9 w-full rounded-md border border-border/70 bg-background/25 px-2.5 text-sm outline-none focus:border-primary/40" }), titleError ? _jsx("span", { className: "mt-1 block text-xs text-muted-foreground", children: titleError }) : null] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.field.description') }), _jsx("textarea", { rows: 3, value: description, onChange: (event) => setDescription(event.target.value), maxLength: 900, className: "w-full resize-none rounded-md border border-border/70 bg-background/25 p-2.5 text-sm outline-none focus:border-primary/40" }), _jsxs("span", { className: "mt-1 block text-right text-[11px] text-muted-foreground", children: [description.length, "/900"] })] })] })] }), _jsxs(Section, { title: t('task.section.tags'), subtitle: t('task.section.tagsHelp'), children: [_jsx("div", { className: "flex flex-wrap gap-2", children: parsedLabels.map((label) => (_jsxs("button", { type: "button", onClick: () => setLabels((current) => current.split(',').map((item) => item.trim()).filter((item) => item !== label).join(', ')), className: "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground", children: [_jsx(Tag, { size: 12 }), label, _jsx(Trash2, { size: 11, className: "ml-0.5" })] }, label))) }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 sm:flex-nowrap", children: [_jsx("input", { value: newTagInput, onChange: (event) => setNewTagInput(event.target.value), placeholder: t('task.newTagPrompt'), className: "h-8 w-full rounded-md border border-border/70 bg-card/60 px-2 text-xs outline-none focus:border-primary/40" }), _jsxs("button", { type: "button", onClick: handleAddTag, className: "inline-flex h-8 w-full shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:w-auto", children: [_jsx(Plus, { size: 12 }), " ", t('task.addTag')] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: t('task.editTags') }), _jsx("input", { value: labels, onChange: (event) => setLabels(event.target.value), placeholder: t('task.tagsPlaceholder'), className: "h-9 w-full rounded-md border border-border/70 bg-background/25 px-2.5 text-sm outline-none focus:border-primary/40" })] })] }), _jsx(Section, { title: t('task.section.checklist'), subtitle: t('task.section.checklistHelp'), children: _jsxs("div", { className: "rounded-lg border border-border/70 bg-background/25 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between text-xs text-muted-foreground", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(CheckSquare, { size: 12 }), " ", checklistCompleted, "/", checklistTotal, " ", t('task.completed')] }), _jsxs("span", { children: [checklistProgress, "%"] })] }), _jsx("div", { className: "h-1.5 rounded bg-muted/80", children: _jsx("div", { className: "h-1.5 rounded bg-primary transition-all", style: { width: `${checklistProgress}%` } }) }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 sm:flex-nowrap", children: [_jsx("input", { value: newChecklistItem, onChange: (event) => setNewChecklistItem(event.target.value), placeholder: t('task.checklist.newItem'), className: "h-8 w-full rounded-md border border-border/70 bg-card/60 px-2 text-xs outline-none focus:border-primary/40" }), _jsx("button", { type: "button", onClick: handleAddChecklistItem, className: "inline-flex h-8 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-border/70 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 sm:w-auto", children: t('task.checklist.addItem') })] }), _jsxs("div", { className: "mt-3 space-y-1.5", children: [checklistItems.length === 0 ? _jsx("p", { className: "text-xs text-muted-foreground", children: t('task.checklist.newItem') }) : null, checklistItems.map((item) => (_jsxs("div", { className: "flex items-center gap-1.5 rounded-md border border-border/70 bg-card/50 px-2.5 py-1.5", children: [_jsxs("button", { type: "button", onClick: () => setChecklistItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry))), className: "w-full text-left text-xs text-muted-foreground transition-colors hover:text-foreground", children: [item.done ? '☑' : '☐', " ", item.title] }), _jsx("button", { type: "button", onClick: () => setChecklistItems((current) => current.filter((entry) => entry.id !== item.id)), className: "inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground", "aria-label": "Delete checklist item", children: _jsx(Trash2, { size: 11 }) })] }, item.id)))] })] }) }), _jsx(Section, { title: t('task.section.activity'), subtitle: t('task.section.activityHelp'), children: _jsx("ul", { className: "space-y-1.5", children: task.activity.map((item) => (_jsx("li", { className: "rounded-md border border-border/70 bg-background/25 px-2.5 py-2 text-xs text-muted-foreground", children: item === 'task_sync' || item === 'backend_sync' ? t('activity.syncUpdate') : item }, item))) }) }), _jsx(Section, { title: t('task.section.files'), subtitle: t('task.section.filesHelp'), children: _jsxs("div", { className: "space-y-2.5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: t('task.filesHint') }), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-border/70 px-2.5 text-xs text-foreground transition-colors hover:bg-muted/60 sm:w-auto", children: [_jsx(Paperclip, { size: 12 }), t('task.uploadFiles')] }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, className: "hidden", onChange: (event) => {
                                                            void handleFileUpload(event.target.files);
                                                            event.currentTarget.value = '';
                                                        } })] }), attachments.length === 0 ? (_jsx("div", { className: "rounded-lg border border-dashed border-border/70 bg-background/25 p-3 text-xs text-muted-foreground", children: t('task.noAttachments') })) : (_jsx("ul", { className: "space-y-2", children: attachments.map((file) => (_jsxs("li", { className: "rounded-lg border border-border/70 bg-background/25 p-2.5", children: [file.previewUrl ? (_jsx("div", { className: "mb-2 overflow-hidden rounded-md border border-border/60 bg-card/50", children: _jsx("img", { src: file.previewUrl, alt: file.name, className: "h-28 w-full object-cover sm:h-32" }) })) : null, _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-xs font-semibold text-foreground", title: file.name, children: file.name }), _jsxs("p", { className: "text-[11px] text-muted-foreground", children: [file.type, " \u00B7 ", file.size] })] }), _jsxs("div", { className: "flex w-full items-center gap-1.5 sm:w-auto", children: [_jsxs("button", { type: "button", onClick: () => handleOpenAttachment(file), className: "inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-border/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:h-7 sm:flex-none sm:px-2", children: [_jsx(ExternalLink, { size: 11 }), t('task.openFile')] }), _jsx("button", { type: "button", onClick: () => handleRemoveAttachment(file.id), className: "inline-flex h-7 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:w-7", "aria-label": "Delete attachment", children: _jsx(Trash2, { size: 11 }) })] })] })] }, file.id))) }))] }) }), _jsx(Section, { title: t('task.section.comments'), subtitle: t('task.section.commentsHelp'), children: _jsxs("div", { className: "space-y-2.5", children: [comments.length === 0 ? (_jsxs("div", { className: "rounded-lg border border-border/70 bg-background/25 p-3 text-xs text-muted-foreground", children: [_jsx("p", { className: "mb-2 text-sm text-foreground", children: t('task.commentsEmpty') }), t('task.commentsConnect')] })) : (_jsx("ul", { className: "space-y-2", children: comments.map((comment) => (_jsxs("li", { className: "rounded-lg border border-border/70 bg-background/25 p-3", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-xs font-medium text-foreground", children: comment.author }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("p", { className: "text-[11px] text-muted-foreground", children: new Date(comment.createdAt).toLocaleString() }), _jsx("button", { type: "button", onClick: () => handleRemoveComment(comment.id), className: "inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground", "aria-label": "Delete comment", children: _jsx(Trash2, { size: 11 }) })] })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: comment.content })] }, comment.id))) })), _jsxs("div", { className: "rounded-lg border border-border/70 bg-background/25 p-2.5", children: [_jsx("div", { className: "mb-2 text-[11px] uppercase tracking-wide text-muted-foreground", children: t('task.writeComment') }), _jsx("textarea", { rows: 3, value: commentInput, onChange: (event) => setCommentInput(event.target.value), maxLength: 450, placeholder: t('task.commentPlaceholder'), className: "w-full resize-none rounded-md border border-border/70 bg-card/60 p-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40" }), _jsxs("p", { className: "mt-1 text-right text-[11px] text-muted-foreground", children: [commentInput.length, "/450"] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(StatPill, { icon: MessagesSquare, label: `${comments.length} ${t('task.commentsCount')}` }), _jsx(StatPill, { icon: Paperclip, label: `${attachments.length} ${t('task.attachmentsCount')}` })] }), _jsxs("button", { type: "button", onClick: handleSendComment, className: "inline-flex h-8 w-full items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:brightness-110 sm:w-auto", children: [_jsx(Send, { size: 12 }), t('task.send')] })] })] })] }) })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 border-t border-border/70 bg-card/95 pt-3", children: [_jsx("button", { type: "button", onClick: () => !isSaving &&
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
                                        })(), className: "inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto", disabled: !canSave || isSaving || isDeleting, children: t('task.save') }), _jsx("button", { type: "button", onClick: () => {
                                        if (isSaving || isDeleting)
                                            return;
                                        if (task) {
                                            setDraftsByTaskId((current) => {
                                                const next = { ...current };
                                                delete next[task.id];
                                                return next;
                                            });
                                        }
                                        onDelete();
                                    }, disabled: isSaving || isDeleting, className: "inline-flex h-9 w-full items-center justify-center rounded-lg border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-auto", children: t('task.delete') }), _jsx("button", { type: "button", onClick: onClose, disabled: isSaving || isDeleting, className: "inline-flex h-9 w-full items-center justify-center rounded-lg border border-border/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:ml-auto sm:w-auto", children: t('common.close') })] })] })] })) : null }));
};
