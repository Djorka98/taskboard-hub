import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Language } from '@/i18n/translations';
import { translations } from '@/i18n/translations';

type I18nState = {
  language: Language;
  languageTransitionPhase: 'idle' | 'out' | 'in';
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'es';

const getPersistedLanguage = (): Language | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem('nexus-i18n');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { language?: unknown } };
    const candidate = parsed?.state?.language;
    return isLanguage(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

const detectPreferredLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const persistedLanguage = getPersistedLanguage();
  if (persistedLanguage) {
    return persistedLanguage;
  }

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
    (navigator as Navigator & { userLanguage?: string }).userLanguage,
  ].filter(Boolean) as string[];

  const normalized = candidates.map((value) => value.toLowerCase());

  if (normalized.some((value) => value.startsWith('es'))) {
    return 'es';
  }

  if (normalized.some((value) => value.startsWith('en'))) {
    return 'en';
  }

  return 'en';
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: detectPreferredLanguage(),
      languageTransitionPhase: 'idle',
      setLanguage: (language) => {
        if (get().language === language) return;

        set({ languageTransitionPhase: 'out' });

        window.setTimeout(() => {
          set({ language, languageTransitionPhase: 'in' });

          window.setTimeout(() => {
            set({ languageTransitionPhase: 'idle' });
          }, 180);
        }, 120);
      },
      t: (key) => {
        const language = get().language;
        return translations[language][key] ?? translations.en[key] ?? key;
      },
    }),
    {
      name: 'nexus-i18n',
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
