import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Languages } from 'lucide-react';
import { useI18n } from '@/i18n/use-i18n';
import { cn } from '@/lib/utils';
export const LanguageSwitcher = ({ compact = false }) => {
    const { language, setLanguage, t } = useI18n();
    return (_jsxs("div", { className: cn('inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card/70 p-1', compact && 'bg-background/40'), "aria-label": t('language.aria'), children: [!compact && _jsx(Languages, { size: 14, className: "mx-1 text-muted-foreground" }), _jsx("button", { type: "button", onClick: () => setLanguage('en'), className: cn('rounded-md px-2 py-1 text-xs font-medium transition-colors', language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'), children: t('language.english') }), _jsx("button", { type: "button", onClick: () => setLanguage('es'), className: cn('rounded-md px-2 py-1 text-xs font-medium transition-colors', language === 'es' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'), children: t('language.spanish') })] }));
};
