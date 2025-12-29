module.exports = [
"[project]/.next-internal/server/app/api/generate/status/[jobId]/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/auth0.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth0",
    ()=>auth0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@auth0/nextjs-auth0/dist/server/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth0/nextjs-auth0/dist/server/client.js [app-route] (ecmascript)");
;
const auth0 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth0$2f$nextjs$2d$auth0$2f$dist$2f$server$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Auth0Client"]();
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/src/lib/serviceToken.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signServiceToken",
    ()=>signServiceToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
const SECRET = process.env.JWT_SECRET;
function signServiceToken(sub) {
    const claims = {
        iss: "nextjs-bff",
        aud: "fastapi",
        sub
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(claims, SECRET, {
        algorithm: "HS256",
        expiresIn: "60s"
    });
}
}),
"[project]/src/lib/backendFetch.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "backendFetch",
    ()=>backendFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serviceToken$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/serviceToken.ts [app-route] (ecmascript)");
;
const PY_BACKEND_URL = process.env.PY_BACKEND_URL;
if (!PY_BACKEND_URL) throw new Error("Missing PY_BACKEND_URL");
async function backendFetch(path, { sub = "system", headers, ...init } = {}) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serviceToken$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signServiceToken"])(sub);
    const res = await fetch(`${PY_BACKEND_URL}${path}`, {
        ...init,
        headers: {
            "Authorization": `Bearer ${token}`,
            ...init.body ? {
                "Content-Type": "application/json"
            } : {},
            ...headers ?? {}
        },
        cache: "no-store"
    });
    return res;
}
}),
"[project]/src/app/api/generate/status/[jobId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth0$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth0.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendFetch.ts [app-route] (ecmascript)");
;
;
async function GET(req, { params }) {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth0$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth0"].getSession();
    if (!session?.user) return new Response("Unauthorized", {
        status: 401
    });
    const { jobId } = await params;
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backendFetch"])(`/generate/status/${jobId}`, {
        method: "GET",
        sub: session.user.sub
    });
    const text = await res.text();
    return new Response(text, {
        status: res.status,
        headers: {
            "Content-Type": res.headers.get("content-type") ?? "application/json"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5e671562._.js.map