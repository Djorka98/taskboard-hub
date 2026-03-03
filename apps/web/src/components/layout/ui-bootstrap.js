import { useEffect } from 'react';
import { useI18nStore } from '@/i18n/i18n.store';
import { useUiStore } from '@/stores/ui.store';
export const UiBootstrap = () => {
    const theme = useUiStore((state) => state.theme);
    const language = useI18nStore((state) => state.language);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);
    return null;
};
