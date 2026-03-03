import { useEffect } from 'react';

import { useI18n } from '@/i18n/use-i18n';

export const LanguageTransition = () => {
  const { languageTransitionPhase } = useI18n();

  useEffect(() => {
    document.documentElement.dataset.i18nPhase = languageTransitionPhase;
  }, [languageTransitionPhase]);

  return null;
};
