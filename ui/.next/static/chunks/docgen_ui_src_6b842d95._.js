(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/docgen/ui/src/components/download-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DownloadButton",
    ()=>DownloadButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
;
;
function DownloadButton(param) {
    let { downloadPath } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center my-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: downloadPath,
            download: true,
            className: "inline-flex items-center justify-center h-14 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all text-white font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                    className: "w-5 h-5 mr-2"
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/download-button.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                "Download Generated Document"
            ]
        }, void 0, true, {
            fileName: "[project]/docgen/ui/src/components/download-button.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/download-button.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = DownloadButton;
var _c;
__turbopack_context__.k.register(_c, "DownloadButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/error-alert.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorAlert",
    ()=>ErrorAlert
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function ErrorAlert(param) {
    let { message } = param;
    if (!message) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-red-50 border border-red-200 rounded-xl p-4 mb-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-red-800",
            children: message
        }, void 0, false, {
            fileName: "[project]/docgen/ui/src/components/error-alert.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/error-alert.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = ErrorAlert;
var _c;
__turbopack_context__.k.register(_c, "ErrorAlert");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
;
;
function Header() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "max-w-6xl mx-auto px-6 py-4 flex items-center justify-between",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                            className: "w-5 h-5 text-white"
                        }, void 0, false, {
                            fileName: "[project]/docgen/ui/src/components/header.tsx",
                            lineNumber: 9,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/header.tsx",
                        lineNumber: 8,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl font-bold text-slate-900 tracking-tight",
                        children: "DocGen"
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/header.tsx",
                        lineNumber: 11,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/header.tsx",
                lineNumber: 7,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/docgen/ui/src/components/header.tsx",
            lineNumber: 6,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/header.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/how-it-works.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HowItWorks",
    ()=>HowItWorks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const STEPS = [
    {
        title: "Add context",
        description: "Upload images or documents for reference."
    },
    {
        title: "Choose template",
        description: "Upload the template to fill."
    },
    {
        title: "Generate",
        description: "Let AI create your document."
    }
];
function HowItWorks() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-semibold text-slate-900 mb-3",
                children: "How it works"
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row gap-6 text-sm text-slate-600",
                children: STEPS.map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0",
                                children: index + 1
                            }, void 0, false, {
                                fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                                lineNumber: 19,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-medium text-slate-900 mb-1",
                                        children: step.title
                                    }, void 0, false, {
                                        fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                                        lineNumber: 23,
                                        columnNumber: 15
                                    }, this),
                                    step.description
                                ]
                            }, void 0, true, {
                                fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                                lineNumber: 22,
                                columnNumber: 13
                            }, this)
                        ]
                    }, step.title, true, {
                        fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                        lineNumber: 18,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/docgen/ui/src/components/how-it-works.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = HowItWorks;
var _c;
__turbopack_context__.k.register(_c, "HowItWorks");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/rolling-updates.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RollingUpdates",
    ()=>RollingUpdates
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>"); // Import Loader2 for the activity indicator
;
var _s = __turbopack_context__.k.signature();
;
;
// Custom Activity Indicator using Loader2 for a "breathing" effect
const ActivityIndicator = ()=>// Use an icon with a gentle animation instead of a standard spinner
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
        className: "size-8 text-blue-500 animate-spin animate-[pulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]"
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/rolling-updates.tsx",
        lineNumber: 15,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = ActivityIndicator;
const RollingUpdates = (param)=>{
    let { updates, tokenDelayMs = 80, dwellMs = 2000 } = param;
    _s();
    const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [baseText, setBaseText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [tokens, setTokens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tokenIndex, setTokenIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [displayed, setDisplayed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Chunk text into fake tokens of 3–4 characters
    const chunkIntoTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RollingUpdates.useCallback[chunkIntoTokens]": (text)=>{
            const tokens = [];
            let i = 0;
            while(i < text.length){
                const chunkSize = Math.floor(Math.random() * 2) + 3; // 3–4 chars
                tokens.push(text.slice(i, i + chunkSize));
                i += chunkSize;
            }
            return tokens;
        }
    }["RollingUpdates.useCallback[chunkIntoTokens]"], []);
    // When currentIndex changes (or the text at that index changes),
    // (re)initialise the typing state.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RollingUpdates.useEffect": ()=>{
            if (updates.length === 0) {
                setBaseText("");
                setTokens([]);
                setDisplayed("");
                setTokenIndex(0);
                setCurrentIndex(0);
                return;
            }
            // Clamp index if updates got shorter (unlikely, but safe)
            if (currentIndex > updates.length - 1) {
                setCurrentIndex(updates.length - 1);
                return;
            }
            var _updates_currentIndex;
            const nextText = (_updates_currentIndex = updates[currentIndex]) !== null && _updates_currentIndex !== void 0 ? _updates_currentIndex : "";
            // If the text for this index has not changed, don’t restart typing
            if (nextText === baseText) return;
            setBaseText(nextText);
            setTokens(chunkIntoTokens(nextText));
            setDisplayed("");
            setTokenIndex(0);
            // When a new update arrives, always jump to the start of the updates.
            // This ensures if the user provided 3 updates instantly, we cycle through them.
            if (updates.length > 0) {
                setCurrentIndex(updates.length - 1);
            }
        }
    }["RollingUpdates.useEffect"], [
        updates,
        baseText,
        chunkIntoTokens,
        currentIndex
    ]);
    // Typing effect + advancing to the next update
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RollingUpdates.useEffect": ()=>{
            if (updates.length === 0) return;
            if (!tokens.length) return;
            // Still typing this update
            if (tokenIndex < tokens.length) {
                const timeout = setTimeout({
                    "RollingUpdates.useEffect.timeout": ()=>{
                        setDisplayed({
                            "RollingUpdates.useEffect.timeout": (prev)=>prev + tokens[tokenIndex]
                        }["RollingUpdates.useEffect.timeout"]);
                        setTokenIndex({
                            "RollingUpdates.useEffect.timeout": (prev)=>prev + 1
                        }["RollingUpdates.useEffect.timeout"]);
                    }
                }["RollingUpdates.useEffect.timeout"], tokenDelayMs);
                return ({
                    "RollingUpdates.useEffect": ()=>clearTimeout(timeout)
                })["RollingUpdates.useEffect"];
            }
            // Finished typing this update; dwell before moving on
            // This logic is designed to loop between *received* updates
            if (tokenIndex >= tokens.length && updates.length > 1) {
                const timeout = setTimeout({
                    "RollingUpdates.useEffect.timeout": ()=>{
                        // If we are showing the latest update, do nothing until a new one arrives.
                        // If there are older updates, cycle through them.
                        if (currentIndex < updates.length - 1) {
                            setCurrentIndex(updates.length - 1);
                        } else if (currentIndex > 0) {
                            // Start cycling from the second-to-last update upwards,
                            // or just stay on the last one if it's the only one.
                            setCurrentIndex(0);
                        }
                    }
                }["RollingUpdates.useEffect.timeout"], dwellMs);
                return ({
                    "RollingUpdates.useEffect": ()=>clearTimeout(timeout)
                })["RollingUpdates.useEffect"];
            }
        }
    }["RollingUpdates.useEffect"], [
        tokenIndex,
        tokens,
        tokenDelayMs,
        dwellMs,
        currentIndex,
        updates.length
    ]);
    const textToShow = updates.length === 0 ? "Initialising model and context..." : displayed || " ";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-xs text-slate-500 font-mono",
        children: textToShow
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/rolling-updates.tsx",
        lineNumber: 116,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(RollingUpdates, "E2Se6P9hi6SWEYpaYQ130w7hfd4=");
_c1 = RollingUpdates;
var _c, _c1;
__turbopack_context__.k.register(_c, "ActivityIndicator");
__turbopack_context__.k.register(_c1, "RollingUpdates");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/job-status-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobStatusPanel",
    ()=>JobStatusPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$rolling$2d$updates$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/rolling-updates.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function JobStatusPanel(param) {
    let { canStart, isStreaming, isCompleted, onStart, updates } = param;
    _s();
    const [showDetails, setShowDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const isIdle = !isStreaming && !isCompleted;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center mb-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "\n          w-full mx-auto \n          transition-all duration-500 ease-out\n          ".concat(isStreaming ? "max-w-3xl" : "max-w-md", "\n        "),
            children: [
                isIdle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: onStart,
                        disabled: !canStart,
                        size: "lg",
                        className: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                className: "w-5 h-5 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this),
                            "Generate Document"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                        lineNumber: 36,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                    lineNumber: 35,
                    columnNumber: 11
                }, this),
                isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-5 transition-all duration-500 ease-out",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "w-6 h-6 animate-spin text-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                    lineNumber: 52,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-slate-900",
                                        children: "Generating document…"
                                    }, void 0, false, {
                                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                        lineNumber: 55,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-500 mt-1",
                                        children: "We are reading your files, extracting the details and filling your template."
                                    }, void 0, false, {
                                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                        lineNumber: 58,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowDetails((prev)=>!prev),
                                        className: "mt-4 w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500 mt-1",
                                                children: "See what the AI is thinking"
                                            }, void 0, false, {
                                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                                lineNumber: 67,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-4 h-4 transition-transform duration-300 ".concat(showDetails ? "rotate-180" : "")
                                            }, void 0, false, {
                                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                                lineNumber: 68,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "\n                    overflow-hidden transition-all duration-500 ease-out\n                    ".concat(showDetails ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0", "\n                  "),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs sm:text-sm text-slate-700 bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$rolling$2d$updates$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RollingUpdates"], {
                                                updates: updates
                                            }, void 0, false, {
                                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                                lineNumber: 80,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                            lineNumber: 79,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                        lineNumber: 73,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                                lineNumber: 54,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                        lineNumber: 50,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/job-status-panel.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(JobStatusPanel, "jUNGuGoBPCutpdConOLf07+2c2U=");
_c = JobStatusPanel;
var _c;
__turbopack_context__.k.register(_c, "JobStatusPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dropzone",
    ()=>Dropzone,
    "DropzoneContent",
    ()=>DropzoneContent,
    "DropzoneEmptyState",
    ()=>DropzoneEmptyState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadIcon$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as UploadIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/react-dropzone/dist/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const renderBytes = (bytes)=>{
    const units = [
        'B',
        'KB',
        'MB',
        'GB',
        'TB',
        'PB'
    ];
    let size = bytes;
    let unitIndex = 0;
    while(size >= 1024 && unitIndex < units.length - 1){
        size /= 1024;
        unitIndex++;
    }
    return "".concat(size.toFixed(2)).concat(units[unitIndex]);
};
const DropzoneContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const Dropzone = (param)=>{
    let { accept, maxFiles = 1, maxSize, minSize, onDrop, onError, disabled, src, className, children, ...props } = param;
    _s();
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        accept,
        maxFiles,
        maxSize,
        minSize,
        onError,
        disabled,
        onDrop: {
            "Dropzone.useDropzone": (acceptedFiles, fileRejections, event)=>{
                if (fileRejections.length > 0) {
                    var _fileRejections_at_errors_at, _fileRejections_at;
                    const message = (_fileRejections_at = fileRejections.at(0)) === null || _fileRejections_at === void 0 ? void 0 : (_fileRejections_at_errors_at = _fileRejections_at.errors.at(0)) === null || _fileRejections_at_errors_at === void 0 ? void 0 : _fileRejections_at_errors_at.message;
                    onError === null || onError === void 0 ? void 0 : onError(new Error(message));
                    return;
                }
                onDrop === null || onDrop === void 0 ? void 0 : onDrop(acceptedFiles, fileRejections, event);
            }
        }["Dropzone.useDropzone"],
        ...props
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DropzoneContext.Provider, {
        value: {
            src,
            accept,
            maxSize,
            minSize,
            maxFiles
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative h-auto w-full flex-col overflow-hidden p-8', isDragActive && 'outline-none ring-1 ring-ring', className),
            disabled: disabled,
            type: "button",
            variant: "outline",
            ...getRootProps(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ...getInputProps(),
                    disabled: disabled
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
            lineNumber: 84,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, JSON.stringify(src), false, {
        fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Dropzone, "YfI2qKQYNDOj7ozxGshQtast5Mk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"]
    ];
});
_c = Dropzone;
const useDropzoneContext = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DropzoneContext);
    if (!context) {
        throw new Error('useDropzoneContext must be used within a Dropzone');
    }
    return context;
};
_s1(useDropzoneContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const maxLabelItems = 3;
const DropzoneContent = (param)=>{
    let { children, className } = param;
    _s2();
    const { src } = useDropzoneContext();
    if (!src) {
        return null;
    }
    if (children) {
        return children;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-center justify-center', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadIcon$3e$__["UploadIcon"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                    lineNumber: 136,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "my-2 w-full truncate font-medium text-sm",
                children: src.length > maxLabelItems ? "".concat(new Intl.ListFormat('en').format(src.slice(0, maxLabelItems).map((file)=>file.name)), " and ").concat(src.length - maxLabelItems, " more") : new Intl.ListFormat('en').format(src.map((file)=>file.name))
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "w-full text-wrap text-muted-foreground text-xs",
                children: "Drag and drop or click to replace"
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(DropzoneContent, "zLPOs9LSCiuGBvGn7ecabmWCxTs=", false, function() {
    return [
        useDropzoneContext
    ];
});
_c1 = DropzoneContent;
const DropzoneEmptyState = (param)=>{
    let { children, className } = param;
    _s3();
    const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();
    if (src) {
        return null;
    }
    if (children) {
        return children;
    }
    let caption = '';
    if (accept) {
        caption += 'Accepts ';
        caption += new Intl.ListFormat('en').format(Object.keys(accept));
    }
    if (minSize && maxSize) {
        caption += " between ".concat(renderBytes(minSize), " and ").concat(renderBytes(maxSize));
    } else if (minSize) {
        caption += " at least ".concat(renderBytes(minSize));
    } else if (maxSize) {
        caption += " less than ".concat(renderBytes(maxSize));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-center justify-center', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadIcon$3e$__["UploadIcon"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "my-2 w-full truncate text-wrap font-medium text-sm",
                children: [
                    "Upload ",
                    maxFiles === 1 ? 'a file' : 'files'
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "w-full truncate text-wrap text-muted-foreground text-xs",
                children: "Drag and drop or click to upload"
            }, void 0, false, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            caption && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-wrap text-muted-foreground text-xs",
                children: [
                    caption,
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
                lineNumber: 198,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s3(DropzoneEmptyState, "in43v91RObl9w5JFmdn5ELoldXA=", false, function() {
    return [
        useDropzoneContext
    ];
});
_c2 = DropzoneEmptyState;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Dropzone");
__turbopack_context__.k.register(_c1, "DropzoneContent");
__turbopack_context__.k.register(_c2, "DropzoneEmptyState");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/upload-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UploadCard",
    ()=>UploadCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$shadcn$2d$io$2f$dropzone$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/ui/shadcn-io/dropzone/index.tsx [app-client] (ecmascript)");
;
;
function UploadCard(param) {
    let { title, icon, hint, required = false, files, onDrop, maxFiles = 1 } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-2xl shadow-sm border border-slate-200 p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-4",
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-slate-900",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs ml-auto ".concat(required ? "text-red-500" : "text-slate-500"),
                        children: hint !== null && hint !== void 0 ? hint : required ? "Required" : "Optional"
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$shadcn$2d$io$2f$dropzone$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dropzone"], {
                maxFiles: maxFiles,
                onDrop: onDrop,
                src: files,
                className: "border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl bg-slate-50/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$shadcn$2d$io$2f$dropzone$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropzoneEmptyState"], {}, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$ui$2f$shadcn$2d$io$2f$dropzone$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropzoneContent"], {}, void 0, false, {
                        fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-600 mt-3",
                children: [
                    files.length,
                    " file",
                    files.length !== 1 ? "s" : "",
                    " added"
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/docgen/ui/src/components/upload-card.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = UploadCard;
var _c;
__turbopack_context__.k.register(_c, "UploadCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/components/footer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Footer",
    ()=>Footer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Footer() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        className: "border-t border-slate-200 bg-white/70 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-6 py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-semibold text-slate-800",
                    children: "DocGen"
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/footer.tsx",
                    lineNumber: 5,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-slate-500",
                    children: "Generate polished documents from your templates and context."
                }, void 0, false, {
                    fileName: "[project]/docgen/ui/src/components/footer.tsx",
                    lineNumber: 6,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/docgen/ui/src/components/footer.tsx",
            lineNumber: 4,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/docgen/ui/src/components/footer.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
_c = Footer;
var _c;
__turbopack_context__.k.register(_c, "Footer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/hooks/use-document-job.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDocumentJob",
    ()=>useDocumentJob
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const EVENT_TYPES = [
    "response.code_interpreter_call_code.done",
    "response.output_text.done"
];
function useDocumentJob() {
    _s();
    const [jobId, setJobId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updates, setUpdates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const eventSourceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const appendUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDocumentJob.useCallback[appendUpdate]": (raw)=>{
            if (!raw) return;
            let parsed;
            try {
                const json = JSON.parse(raw);
                parsed = typeof json === "string" ? json : JSON.stringify(json);
            } catch (e) {
                parsed = raw;
            }
            const lines = parsed.replace(/['"]/g, "").split(/\r?\n/);
            setUpdates({
                "useDocumentJob.useCallback[appendUpdate]": (prev)=>prev.concat(lines)
            }["useDocumentJob.useCallback[appendUpdate]"]);
        }
    }["useDocumentJob.useCallback[appendUpdate]"], []);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDocumentJob.useCallback[reset]": ()=>{
            var _eventSourceRef_current;
            setJobId(null);
            setUpdates([]);
            setError(null);
            setStatus("idle");
            (_eventSourceRef_current = eventSourceRef.current) === null || _eventSourceRef_current === void 0 ? void 0 : _eventSourceRef_current.close();
            eventSourceRef.current = null;
        }
    }["useDocumentJob.useCallback[reset]"], []);
    const start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDocumentJob.useCallback[start]": async (param)=>{
            let { templateFile, contextFiles } = param;
            setError(null);
            setUpdates([]);
            setStatus("uploading");
            if (!templateFile) {
                setError("Template file is missing.");
                setStatus("idle");
                return;
            }
            try {
                const form = new FormData();
                contextFiles.forEach({
                    "useDocumentJob.useCallback[start]": (file)=>form.append("contextFiles", file)
                }["useDocumentJob.useCallback[start]"]);
                form.append("templateFiles", templateFile);
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: form
                });
                if (!res.ok) {
                    throw new Error("Upload failed.");
                }
                const { jobId: newJobId } = await res.json();
                setJobId(newJobId);
                setStatus("streaming");
                const es = new EventSource("/api/stream/".concat(newJobId));
                eventSourceRef.current = es;
                es.onerror = ({
                    "useDocumentJob.useCallback[start]": ()=>{
                        if (es.readyState === EventSource.CLOSED) {
                            setError("Connection interrupted. The generation may have failed.");
                            setStatus("error");
                        }
                    }
                })["useDocumentJob.useCallback[start]"];
                EVENT_TYPES.forEach({
                    "useDocumentJob.useCallback[start]": (eventType)=>{
                        es.addEventListener(eventType, {
                            "useDocumentJob.useCallback[start]": (event)=>{
                                var _event_data;
                                appendUpdate((_event_data = event.data) !== null && _event_data !== void 0 ? _event_data : "");
                            }
                        }["useDocumentJob.useCallback[start]"]);
                    }
                }["useDocumentJob.useCallback[start]"]);
                es.addEventListener("completed", {
                    "useDocumentJob.useCallback[start]": ()=>{
                        setStatus("completed");
                        es.close();
                    }
                }["useDocumentJob.useCallback[start]"]);
                es.addEventListener("modelError", {
                    "useDocumentJob.useCallback[start]": (event)=>{
                        setError("Server error: ".concat(event.data));
                        setStatus("error");
                        es.close();
                    }
                }["useDocumentJob.useCallback[start]"]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to start generation. Please try again.");
                setStatus("error");
            }
        }
    }["useDocumentJob.useCallback[start]"], [
        appendUpdate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDocumentJob.useEffect": ()=>{
            return ({
                "useDocumentJob.useEffect": ()=>{
                    var _eventSourceRef_current;
                    (_eventSourceRef_current = eventSourceRef.current) === null || _eventSourceRef_current === void 0 ? void 0 : _eventSourceRef_current.close();
                }
            })["useDocumentJob.useEffect"];
        }
    }["useDocumentJob.useEffect"], []);
    const isStreaming = status === "streaming";
    const isCompleted = status === "completed";
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDocumentJob.useMemo[state]": ()=>({
                jobId,
                updates,
                error,
                status,
                isStreaming,
                isCompleted
            })
    }["useDocumentJob.useMemo[state]"], [
        error,
        isCompleted,
        isStreaming,
        jobId,
        status,
        updates
    ]);
    return {
        ...state,
        start,
        reset
    };
}
_s(useDocumentJob, "Ye2beHJsC7hGe0ZxjWNHbjX7UiI=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/docgen/ui/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$download$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/download-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$error$2d$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/error-alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$how$2d$it$2d$works$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/how-it-works.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$job$2d$status$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/job-status-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$upload$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/upload-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/components/footer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$hooks$2f$use$2d$document$2d$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/hooks/use-document-job.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const [contextFiles, setContextFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [templateFile, setTemplateFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { jobId, updates, error, status, isStreaming, isCompleted, start } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$hooks$2f$use$2d$document$2d$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDocumentJob"])();
    const canStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[canStart]": ()=>Boolean(templateFile) && !isStreaming && !isCompleted
    }["Home.useMemo[canStart]"], [
        isCompleted,
        isStreaming,
        templateFile
    ]);
    const downloadPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[downloadPath]": ()=>{
            if (!jobId || !templateFile) return "";
            return "/api/download/".concat(jobId, "/").concat(encodeURIComponent(templateFile.name));
        }
    }["Home.useMemo[downloadPath]"], [
        jobId,
        templateFile
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
                fileName: "[project]/docgen/ui/src/app/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-6xl mx-auto px-6 py-12 flex-1 w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$how$2d$it$2d$works$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HowItWorks"], {}, void 0, false, {
                        fileName: "[project]/docgen/ui/src/app/page.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid md:grid-cols-2 gap-6 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$upload$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UploadCard"], {
                                title: "Context Files",
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                    className: "w-5 h-5 text-slate-600"
                                }, void 0, false, {
                                    fileName: "[project]/docgen/ui/src/app/page.tsx",
                                    lineNumber: 42,
                                    columnNumber: 19
                                }, void 0),
                                hint: "Optional",
                                files: contextFiles,
                                onDrop: setContextFiles,
                                maxFiles: 100
                            }, void 0, false, {
                                fileName: "[project]/docgen/ui/src/app/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$upload$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UploadCard"], {
                                title: "Template File",
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    className: "w-5 h-5 text-slate-600"
                                }, void 0, false, {
                                    fileName: "[project]/docgen/ui/src/app/page.tsx",
                                    lineNumber: 50,
                                    columnNumber: 19
                                }, void 0),
                                hint: "Required",
                                required: true,
                                files: templateFile ? [
                                    templateFile
                                ] : [],
                                onDrop: (files)=>setTemplateFile(files[0] || null),
                                maxFiles: 1
                            }, void 0, false, {
                                fileName: "[project]/docgen/ui/src/app/page.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/docgen/ui/src/app/page.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$error$2d$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorAlert"], {
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/app/page.tsx",
                        lineNumber: 59,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$job$2d$status$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobStatusPanel"], {
                        canStart: canStart,
                        isStreaming: isStreaming,
                        isCompleted: isCompleted,
                        onStart: ()=>start({
                                templateFile,
                                contextFiles
                            }),
                        updates: updates
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/app/page.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    isCompleted && downloadPath && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$download$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DownloadButton"], {
                        downloadPath: downloadPath
                    }, void 0, false, {
                        fileName: "[project]/docgen/ui/src/app/page.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/docgen/ui/src/app/page.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$components$2f$footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Footer"], {}, void 0, false, {
                fileName: "[project]/docgen/ui/src/app/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/docgen/ui/src/app/page.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(Home, "OQflvGL8TMo+N+HYV2eXGF/eG28=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$hooks$2f$use$2d$document$2d$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDocumentJob"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=docgen_ui_src_6b842d95._.js.map