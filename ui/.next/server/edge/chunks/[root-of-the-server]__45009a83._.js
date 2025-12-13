(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__45009a83._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/ [middleware-edge] (unsupported edge import 'crypto', ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.n(__import_unsupported(`crypto`));
}),
"[project]/docgen/ui/src/lib/auth0.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth0",
    ()=>auth0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/@auth0/nextjs-auth0/dist/server/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$client$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/node_modules/@auth0/nextjs-auth0/dist/server/client.js [middleware-edge] (ecmascript)");
;
const auth0 = new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$client$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Auth0Client"]();
}),
"[project]/docgen/ui/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$auth0$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/ui/src/lib/auth0.ts [middleware-edge] (ecmascript)");
;
async function middleware(request) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$ui$2f$src$2f$lib$2f$auth0$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth0"].middleware(request);
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */ "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__45009a83._.js.map