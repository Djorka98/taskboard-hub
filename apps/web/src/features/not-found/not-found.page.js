import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export const NotFoundPage = () => {
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center", children: [_jsx("h1", { className: "text-4xl font-semibold", children: "404" }), _jsx("p", { className: "text-muted-foreground", children: "The requested view does not exist." }), _jsx(Link, { to: "/dashboard", className: "rounded-lg bg-primary px-4 py-2 text-primary-foreground", children: "Go to Dashboard" })] }));
};
