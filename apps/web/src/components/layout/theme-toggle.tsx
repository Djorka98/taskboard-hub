import { Moon, Sun } from 'lucide-react';

import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui.store';

export const ThemeToggle = () => {
  const { t } = useI18n();
  const { theme, setTheme } = useUiStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 px-3 text-sm text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground',
      )}
      aria-label={t('theme.toggle')}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden sm:inline">{isDark ? t('theme.light') : t('theme.dark')}</span>
    </button>
  );
};
