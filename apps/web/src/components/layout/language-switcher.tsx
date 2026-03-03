import { Languages } from 'lucide-react';

import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export const LanguageSwitcher = ({ compact = false }: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card/70 p-1',
        compact && 'bg-background/40',
      )}
      aria-label={t('language.aria')}
    >
      {!compact && <Languages size={14} className="mx-1 text-muted-foreground" />}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-md px-2 py-1 text-xs font-medium transition-colors',
          language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {t('language.english')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={cn(
          'rounded-md px-2 py-1 text-xs font-medium transition-colors',
          language === 'es' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {t('language.spanish')}
      </button>
    </div>
  );
};
