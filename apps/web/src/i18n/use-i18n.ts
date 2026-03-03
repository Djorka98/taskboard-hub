import { useI18nStore } from '@/i18n/i18n.store';

export const useI18n = () => {
  const language = useI18nStore((state) => state.language);
  const languageTransitionPhase = useI18nStore((state) => state.languageTransitionPhase);
  const setLanguage = useI18nStore((state) => state.setLanguage);
  const t = useI18nStore((state) => state.t);

  return {
    language,
    languageTransitionPhase,
    setLanguage,
    t,
  };
};
