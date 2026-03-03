import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '@/i18n/use-i18n';
export const EmptyColumnState = ({ onCreate }) => {
    const { t } = useI18n();
    return (_jsxs("div", { className: "flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-background/30 p-4 text-center text-xs leading-5 text-muted-foreground", children: [_jsx("span", { children: t('board.emptyColumn') }), _jsx("button", { type: "button", onClick: onCreate, className: "inline-flex h-8 items-center rounded-md border border-border/70 px-2.5 text-xs text-foreground transition-colors hover:bg-muted/60", children: t('board.addFirstCard') })] }));
};
