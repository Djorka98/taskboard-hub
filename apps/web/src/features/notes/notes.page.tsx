import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { notesApi } from '@/features/notes/notes.api';
import { useI18n } from '@/i18n/use-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';

export const NotesPage = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const userScope = user?.id ?? 'guest';
  const globalSearchQuery = useUiStore((state) => state.searchQuery);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const notesQuery = useQuery({
    queryKey: ['notes', userScope],
    queryFn: notesApi.getAll,
    enabled: Boolean(user?.id),
  });

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      setTitle('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
      void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
      toast.success(t('notes.toast.created'));
    },
    onError: () => toast.error(t('notes.toast.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => notesApi.update(id, { pinned }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
      void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: notesApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes', userScope] });
      void queryClient.invalidateQueries({ queryKey: ['activity', userScope] });
      toast.success(t('notes.toast.deleted'));
    },
    onError: () => toast.error(t('notes.toast.deleteError')),
  });

  const filteredNotes = (notesQuery.data ?? []).filter((note) => {
    const value = globalSearchQuery.trim().toLowerCase();
    if (!value) return true;
    return `${note.title} ${note.content} ${note.label ?? ''}`.toLowerCase().includes(value);
  });

  return (
    <section className="mx-auto max-h-[calc(100vh-124px)] w-full max-w-[1080px] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/70 p-4 shadow-panel">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('notes.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('notes.subtitle')}</p>
      </div>

      <form
        className="grid gap-2.5 rounded-xl border border-border/70 bg-background/25 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title || !content || createMutation.isPending) return;
          createMutation.mutate({ title, content, pinned: false, label: 'quick' });
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={90}
          placeholder={t('notes.titlePlaceholder')}
          className="h-9 rounded-md border border-border/70 bg-card px-3 text-sm outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={800}
          rows={3}
          placeholder={t('notes.contentPlaceholder')}
          className="resize-none rounded-md border border-border/70 bg-card p-2.5 text-sm outline-none"
        />
        <p className="text-right text-[11px] text-muted-foreground">{content.length}/800</p>
        <button
          disabled={createMutation.isPending || !title.trim() || !content.trim()}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-center text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('notes.save')}
        </button>
      </form>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {filteredNotes.map((note) => (
          <article key={note.id} className="rounded-xl border border-border/70 bg-background/25 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">{note.title}</h3>
              <button
                type="button"
                onClick={() => updateMutation.mutate({ id: note.id, pinned: !note.pinned })}
                disabled={updateMutation.isPending}
                className="rounded-md border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {note.pinned ? t('notes.unpin') : t('notes.pin')}
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{note.content}</p>
            <button
              type="button"
              onClick={() => removeMutation.mutate(note.id)}
              disabled={removeMutation.isPending}
              className="mt-3 h-8 rounded-md border border-border/70 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t('common.delete')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
