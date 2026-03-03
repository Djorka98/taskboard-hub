import { Plus } from 'lucide-react';

import { useI18n } from '@/i18n/use-i18n';

type NewTaskButtonProps = {
  compact?: boolean;
  onClick?: () => void;
};

export const NewTaskButton = ({ compact = false, onClick }: NewTaskButtonProps) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className={compact
        ? 'inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background/30 px-3 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground'
        : 'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-center text-sm font-semibold text-primary-foreground shadow-panel transition-all hover:-translate-y-0.5 hover:brightness-110 sm:w-auto'}
    >
      <Plus size={compact ? 14 : 16} />
      <span>{compact ? t('common.add') : t('topbar.newTask')}</span>
    </button>
  );
};
