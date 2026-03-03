import { useI18n } from '@/i18n/use-i18n';

type EmptyColumnStateProps = {
  onCreate?: () => void;
};

export const EmptyColumnState = ({ onCreate }: EmptyColumnStateProps) => {
  const { t } = useI18n();

  return (
    <div className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-background/30 p-4 text-center text-xs leading-5 text-muted-foreground">
      <span>{t('board.emptyColumn')}</span>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-8 items-center rounded-md border border-border/70 px-2.5 text-xs text-foreground transition-colors hover:bg-muted/60"
      >
        {t('board.addFirstCard')}
      </button>
    </div>
  );
};
