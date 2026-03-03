import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '@/i18n/use-i18n';
import { useUiStore } from '@/stores/ui.store';

type PaletteItem = {
  labelKey: string;
  to: string;
  keywords: string[];
};

const items: PaletteItem[] = [
  { labelKey: 'nav.dashboard', to: '/dashboard', keywords: ['kpi', 'home', 'overview'] },
  { labelKey: 'nav.boards', to: '/boards', keywords: ['kanban', 'todo', 'work'] },
  { labelKey: 'nav.myTasks', to: '/my-tasks', keywords: ['assigned', 'priority', 'work'] },
  { labelKey: 'nav.calendar', to: '/calendar', keywords: ['meeting', 'schedule', 'events'] },
  { labelKey: 'nav.notes', to: '/notes', keywords: ['memo', 'quick notes'] },
  { labelKey: 'nav.activity', to: '/activity', keywords: ['feed', 'audit', 'recent'] },
  { labelKey: 'nav.settings', to: '/settings', keywords: ['profile', 'preferences'] },
];

export const CommandPalette = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const commandPaletteOpen = useUiStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;

    return items.filter((item) => {
      const source = `${t(item.labelKey)} ${item.keywords.join(' ')}`.toLowerCase();
      return source.includes(value);
    });
  }, [query, t]);

  const handleNavigate = (to: string) => {
    navigate(to);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-2xl rounded-xl border border-border/70 bg-card/95 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2">
              <Search size={16} className="text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('palette.searchPlaceholder')}
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground">
                ESC
              </span>
            </div>
            <div className="max-h-[380px] overflow-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="rounded-lg p-3 text-sm text-muted-foreground">{t('palette.noMatch')}</div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => handleNavigate(item.to)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{t(item.labelKey)}</span>
                    <span className="text-xs text-muted-foreground">{t('palette.goTo')}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
