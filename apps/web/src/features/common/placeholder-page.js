import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export const PlaceholderPage = ({ title, description }) => {
    return (_jsxs(motion.section, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.24, ease: 'easeOut' }, className: "rounded-2xl border border-border/80 bg-card/70 p-6 shadow-panel", children: [_jsx("h1", { className: "text-2xl font-semibold", children: title }), _jsx("p", { className: "mt-2 max-w-2xl text-muted-foreground", children: description })] }));
};
