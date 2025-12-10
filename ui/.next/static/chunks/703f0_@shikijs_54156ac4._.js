(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/docgen/doc-gen-ui/node_modules/@shikijs/types/dist/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShikiError",
    ()=>ShikiError
]);
class ShikiError extends Error {
    constructor(message){
        super(message);
        this.name = "ShikiError";
    }
}
;
}),
"[project]/docgen/doc-gen-ui/node_modules/@shikijs/core/dist/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addClassToHast",
    ()=>addClassToHast,
    "applyColorReplacements",
    ()=>applyColorReplacements,
    "codeToHast",
    ()=>codeToHast,
    "codeToHtml",
    ()=>codeToHtml,
    "codeToTokens",
    ()=>codeToTokens,
    "codeToTokensBase",
    ()=>codeToTokensBase,
    "codeToTokensWithThemes",
    ()=>codeToTokensWithThemes,
    "createCssVariablesTheme",
    ()=>createCssVariablesTheme,
    "createHighlighterCore",
    ()=>createHighlighterCore,
    "createHighlighterCoreSync",
    ()=>createHighlighterCoreSync,
    "createPositionConverter",
    ()=>createPositionConverter,
    "createShikiInternal",
    ()=>createShikiInternal,
    "createShikiInternalSync",
    ()=>createShikiInternalSync,
    "createSingletonShorthands",
    ()=>createSingletonShorthands,
    "createdBundledHighlighter",
    ()=>createdBundledHighlighter,
    "enableDeprecationWarnings",
    ()=>enableDeprecationWarnings,
    "flatTokenVariants",
    ()=>flatTokenVariants,
    "getSingletonHighlighterCore",
    ()=>getSingletonHighlighterCore,
    "getTokenStyleObject",
    ()=>getTokenStyleObject,
    "guessEmbeddedLanguages",
    ()=>guessEmbeddedLanguages,
    "hastToHtml",
    ()=>hastToHtml,
    "isNoneTheme",
    ()=>isNoneTheme,
    "isPlainLang",
    ()=>isPlainLang,
    "isSpecialLang",
    ()=>isSpecialLang,
    "isSpecialTheme",
    ()=>isSpecialTheme,
    "makeSingletonHighlighter",
    ()=>makeSingletonHighlighter,
    "makeSingletonHighlighterCore",
    ()=>makeSingletonHighlighterCore,
    "normalizeGetter",
    ()=>normalizeGetter,
    "normalizeTheme",
    ()=>normalizeTheme,
    "resolveColorReplacements",
    ()=>resolveColorReplacements,
    "splitLines",
    ()=>splitLines,
    "splitToken",
    ()=>splitToken,
    "splitTokens",
    ()=>splitTokens,
    "stringifyTokenStyle",
    ()=>stringifyTokenStyle,
    "toArray",
    ()=>toArray,
    "tokenizeAnsiWithTheme",
    ()=>tokenizeAnsiWithTheme,
    "tokenizeWithTheme",
    ()=>tokenizeWithTheme,
    "tokensToHast",
    ()=>tokensToHast,
    "transformerDecorations",
    ()=>transformerDecorations,
    "warnDeprecated",
    ()=>warnDeprecated
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/@shikijs/types/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/@shikijs/vscode-textmate/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$hast$2d$util$2d$to$2d$html$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/hast-util-to-html/lib/index.js [app-client] (ecmascript)");
;
;
;
;
;
function resolveColorReplacements(theme, options) {
    const replacements = typeof theme === "string" ? {} : {
        ...theme.colorReplacements
    };
    const themeName = typeof theme === "string" ? theme : theme.name;
    for (const [key, value] of Object.entries((options === null || options === void 0 ? void 0 : options.colorReplacements) || {})){
        if (typeof value === "string") replacements[key] = value;
        else if (key === themeName) Object.assign(replacements, value);
    }
    return replacements;
}
function applyColorReplacements(color, replacements) {
    if (!color) return color;
    return (replacements === null || replacements === void 0 ? void 0 : replacements[color === null || color === void 0 ? void 0 : color.toLowerCase()]) || color;
}
function toArray(x) {
    return Array.isArray(x) ? x : [
        x
    ];
}
async function normalizeGetter(p) {
    return Promise.resolve(typeof p === "function" ? p() : p).then((r)=>r.default || r);
}
function isPlainLang(lang) {
    return !lang || [
        "plaintext",
        "txt",
        "text",
        "plain"
    ].includes(lang);
}
function isSpecialLang(lang) {
    return lang === "ansi" || isPlainLang(lang);
}
function isNoneTheme(theme) {
    return theme === "none";
}
function isSpecialTheme(theme) {
    return isNoneTheme(theme);
}
function addClassToHast(node, className) {
    var _node, _node_properties;
    if (!className) return node;
    (_node = node).properties || (_node.properties = {});
    (_node_properties = node.properties).class || (_node_properties.class = []);
    if (typeof node.properties.class === "string") node.properties.class = node.properties.class.split(/\s+/g);
    if (!Array.isArray(node.properties.class)) node.properties.class = [];
    const targets = Array.isArray(className) ? className : className.split(/\s+/g);
    for (const c of targets){
        if (c && !node.properties.class.includes(c)) node.properties.class.push(c);
    }
    return node;
}
function splitLines(code) {
    let preserveEnding = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    const parts = code.split(/(\r?\n)/g);
    let index = 0;
    const lines = [];
    for(let i = 0; i < parts.length; i += 2){
        var _parts_;
        const line = preserveEnding ? parts[i] + (parts[i + 1] || "") : parts[i];
        lines.push([
            line,
            index
        ]);
        index += parts[i].length;
        index += ((_parts_ = parts[i + 1]) === null || _parts_ === void 0 ? void 0 : _parts_.length) || 0;
    }
    return lines;
}
function createPositionConverter(code) {
    const lines = splitLines(code, true).map((param)=>{
        let [line] = param;
        return line;
    });
    function indexToPos(index) {
        if (index === code.length) {
            return {
                line: lines.length - 1,
                character: lines[lines.length - 1].length
            };
        }
        let character = index;
        let line = 0;
        for (const lineText of lines){
            if (character < lineText.length) break;
            character -= lineText.length;
            line++;
        }
        return {
            line,
            character
        };
    }
    function posToIndex(line, character) {
        let index = 0;
        for(let i = 0; i < line; i++)index += lines[i].length;
        index += character;
        return index;
    }
    return {
        lines,
        indexToPos,
        posToIndex
    };
}
function guessEmbeddedLanguages(code, _lang, highlighter) {
    const langs = /* @__PURE__ */ new Set();
    for (const match of code.matchAll(/lang=["']([\w-]+)["']/g)){
        langs.add(match[1]);
    }
    for (const match of code.matchAll(/(?:```|~~~)([\w-]+)/g)){
        langs.add(match[1]);
    }
    for (const match of code.matchAll(/\\begin\{([\w-]+)\}/g)){
        langs.add(match[1]);
    }
    if (!highlighter) return Array.from(langs);
    const bundle = highlighter.getBundledLanguages();
    return Array.from(langs).filter((l)=>l && bundle[l]);
}
const DEFAULT_COLOR_LIGHT_DARK = "light-dark()";
const COLOR_KEYS = [
    "color",
    "background-color"
];
function splitToken(token, offsets) {
    let lastOffset = 0;
    const tokens = [];
    for (const offset of offsets){
        if (offset > lastOffset) {
            tokens.push({
                ...token,
                content: token.content.slice(lastOffset, offset),
                offset: token.offset + lastOffset
            });
        }
        lastOffset = offset;
    }
    if (lastOffset < token.content.length) {
        tokens.push({
            ...token,
            content: token.content.slice(lastOffset),
            offset: token.offset + lastOffset
        });
    }
    return tokens;
}
function splitTokens(tokens, breakpoints) {
    const sorted = Array.from(breakpoints instanceof Set ? breakpoints : new Set(breakpoints)).sort((a, b)=>a - b);
    if (!sorted.length) return tokens;
    return tokens.map((line)=>{
        return line.flatMap((token)=>{
            const breakpointsInToken = sorted.filter((i)=>token.offset < i && i < token.offset + token.content.length).map((i)=>i - token.offset).sort((a, b)=>a - b);
            if (!breakpointsInToken.length) return token;
            return splitToken(token, breakpointsInToken);
        });
    });
}
function flatTokenVariants(merged, variantsOrder, cssVariablePrefix, defaultColor) {
    let colorsRendering = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : "css-vars";
    const token = {
        content: merged.content,
        explanation: merged.explanation,
        offset: merged.offset
    };
    const styles = variantsOrder.map((t)=>getTokenStyleObject(merged.variants[t]));
    const styleKeys = new Set(styles.flatMap((t)=>Object.keys(t)));
    const mergedStyles = {};
    const varKey = (idx, key)=>{
        const keyName = key === "color" ? "" : key === "background-color" ? "-bg" : "-".concat(key);
        return cssVariablePrefix + variantsOrder[idx] + (key === "color" ? "" : keyName);
    };
    styles.forEach((cur, idx)=>{
        for (const key of styleKeys){
            const value = cur[key] || "inherit";
            if (idx === 0 && defaultColor && COLOR_KEYS.includes(key)) {
                if (defaultColor === DEFAULT_COLOR_LIGHT_DARK && styles.length > 1) {
                    const lightIndex = variantsOrder.findIndex((t)=>t === "light");
                    const darkIndex = variantsOrder.findIndex((t)=>t === "dark");
                    if (lightIndex === -1 || darkIndex === -1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]('When using `defaultColor: "light-dark()"`, you must provide both `light` and `dark` themes');
                    const lightValue = styles[lightIndex][key] || "inherit";
                    const darkValue = styles[darkIndex][key] || "inherit";
                    mergedStyles[key] = "light-dark(".concat(lightValue, ", ").concat(darkValue, ")");
                    if (colorsRendering === "css-vars") mergedStyles[varKey(idx, key)] = value;
                } else {
                    mergedStyles[key] = value;
                }
            } else {
                if (colorsRendering === "css-vars") mergedStyles[varKey(idx, key)] = value;
            }
        }
    });
    token.htmlStyle = mergedStyles;
    return token;
}
function getTokenStyleObject(token) {
    const styles = {};
    if (token.color) styles.color = token.color;
    if (token.bgColor) styles["background-color"] = token.bgColor;
    if (token.fontStyle) {
        if (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Italic) styles["font-style"] = "italic";
        if (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Bold) styles["font-weight"] = "bold";
        const decorations = [];
        if (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Underline) decorations.push("underline");
        if (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Strikethrough) decorations.push("line-through");
        if (decorations.length) styles["text-decoration"] = decorations.join(" ");
    }
    return styles;
}
function stringifyTokenStyle(token) {
    if (typeof token === "string") return token;
    return Object.entries(token).map((param)=>{
        let [key, value] = param;
        return "".concat(key, ":").concat(value);
    }).join(";");
}
const _grammarStateMap = /* @__PURE__ */ new WeakMap();
function setLastGrammarStateToMap(keys, state) {
    _grammarStateMap.set(keys, state);
}
function getLastGrammarStateFromMap(keys) {
    return _grammarStateMap.get(keys);
}
class GrammarState {
    get themes() {
        return Object.keys(this._stacks);
    }
    get theme() {
        return this.themes[0];
    }
    get _stack() {
        return this._stacks[this.theme];
    }
    /**
   * Static method to create a initial grammar state.
   */ static initial(lang, themes) {
        return new GrammarState(Object.fromEntries(toArray(themes).map((theme)=>[
                theme,
                __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL"]
            ])), lang);
    }
    /**
   * Get the internal stack object.
   * @internal
   */ getInternalStack() {
        let theme = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.theme;
        return this._stacks[theme];
    }
    getScopes() {
        let theme = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.theme;
        return getScopes(this._stacks[theme]);
    }
    toJSON() {
        return {
            lang: this.lang,
            theme: this.theme,
            themes: this.themes,
            scopes: this.getScopes()
        };
    }
    constructor(...args){
        /**
   * Theme to Stack mapping
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_stacks", {});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "lang", void 0);
        if (args.length === 2) {
            const [stacksMap, lang] = args;
            this.lang = lang;
            this._stacks = stacksMap;
        } else {
            const [stack, lang, theme] = args;
            this.lang = lang;
            this._stacks = {
                [theme]: stack
            };
        }
    }
}
function getScopes(stack) {
    const scopes = [];
    const visited = /* @__PURE__ */ new Set();
    function pushScope(stack2) {
        var _stack2_nameScopesList;
        if (visited.has(stack2)) return;
        visited.add(stack2);
        const name = stack2 === null || stack2 === void 0 ? void 0 : (_stack2_nameScopesList = stack2.nameScopesList) === null || _stack2_nameScopesList === void 0 ? void 0 : _stack2_nameScopesList.scopeName;
        if (name) scopes.push(name);
        if (stack2.parent) pushScope(stack2.parent);
    }
    pushScope(stack);
    return scopes;
}
function getGrammarStack(state, theme) {
    if (!(state instanceof GrammarState)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid grammar state");
    return state.getInternalStack(theme);
}
function transformerDecorations() {
    const map = /* @__PURE__ */ new WeakMap();
    function getContext(shiki) {
        if (!map.has(shiki.meta)) {
            let normalizePosition = function(p) {
                if (typeof p === "number") {
                    if (p < 0 || p > shiki.source.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid decoration offset: ".concat(p, ". Code length: ").concat(shiki.source.length));
                    return {
                        ...converter.indexToPos(p),
                        offset: p
                    };
                } else {
                    const line = converter.lines[p.line];
                    if (line === void 0) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid decoration position ".concat(JSON.stringify(p), ". Lines length: ").concat(converter.lines.length));
                    let character = p.character;
                    if (character < 0) character = line.length + character;
                    if (character < 0 || character > line.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid decoration position ".concat(JSON.stringify(p), ". Line ").concat(p.line, " length: ").concat(line.length));
                    return {
                        ...p,
                        character,
                        offset: converter.posToIndex(p.line, character)
                    };
                }
            };
            const converter = createPositionConverter(shiki.source);
            const decorations = (shiki.options.decorations || []).map((d)=>({
                    ...d,
                    start: normalizePosition(d.start),
                    end: normalizePosition(d.end)
                }));
            verifyIntersections(decorations);
            map.set(shiki.meta, {
                decorations,
                converter,
                source: shiki.source
            });
        }
        return map.get(shiki.meta);
    }
    return {
        name: "shiki:decorations",
        tokens (tokens) {
            var _this_options_decorations;
            if (!((_this_options_decorations = this.options.decorations) === null || _this_options_decorations === void 0 ? void 0 : _this_options_decorations.length)) return;
            const ctx = getContext(this);
            const breakpoints = ctx.decorations.flatMap((d)=>[
                    d.start.offset,
                    d.end.offset
                ]);
            const splitted = splitTokens(tokens, breakpoints);
            return splitted;
        },
        code (codeEl) {
            var _this_options_decorations;
            if (!((_this_options_decorations = this.options.decorations) === null || _this_options_decorations === void 0 ? void 0 : _this_options_decorations.length)) return;
            const ctx = getContext(this);
            const lines = Array.from(codeEl.children).filter((i)=>i.type === "element" && i.tagName === "span");
            if (lines.length !== ctx.converter.lines.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Number of lines in code element (".concat(lines.length, ") does not match the number of lines in the source (").concat(ctx.converter.lines.length, "). Failed to apply decorations."));
            function applyLineSection(line, start, end, decoration) {
                const lineEl = lines[line];
                let text = "";
                let startIndex = -1;
                let endIndex = -1;
                if (start === 0) startIndex = 0;
                if (end === 0) endIndex = 0;
                if (end === Number.POSITIVE_INFINITY) endIndex = lineEl.children.length;
                if (startIndex === -1 || endIndex === -1) {
                    for(let i = 0; i < lineEl.children.length; i++){
                        text += stringify(lineEl.children[i]);
                        if (startIndex === -1 && text.length === start) startIndex = i + 1;
                        if (endIndex === -1 && text.length === end) endIndex = i + 1;
                    }
                }
                if (startIndex === -1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Failed to find start index for decoration ".concat(JSON.stringify(decoration.start)));
                if (endIndex === -1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Failed to find end index for decoration ".concat(JSON.stringify(decoration.end)));
                const children = lineEl.children.slice(startIndex, endIndex);
                if (!decoration.alwaysWrap && children.length === lineEl.children.length) {
                    applyDecoration(lineEl, decoration, "line");
                } else if (!decoration.alwaysWrap && children.length === 1 && children[0].type === "element") {
                    applyDecoration(children[0], decoration, "token");
                } else {
                    const wrapper = {
                        type: "element",
                        tagName: "span",
                        properties: {},
                        children
                    };
                    applyDecoration(wrapper, decoration, "wrapper");
                    lineEl.children.splice(startIndex, children.length, wrapper);
                }
            }
            function applyLine(line, decoration) {
                lines[line] = applyDecoration(lines[line], decoration, "line");
            }
            function applyDecoration(el, decoration, type) {
                var _decoration_properties;
                const properties = decoration.properties || {};
                const transform = decoration.transform || ((i)=>i);
                el.tagName = decoration.tagName || "span";
                el.properties = {
                    ...el.properties,
                    ...properties,
                    class: el.properties.class
                };
                if ((_decoration_properties = decoration.properties) === null || _decoration_properties === void 0 ? void 0 : _decoration_properties.class) addClassToHast(el, decoration.properties.class);
                el = transform(el, type) || el;
                return el;
            }
            const lineApplies = [];
            const sorted = ctx.decorations.sort((a, b)=>b.start.offset - a.start.offset || a.end.offset - b.end.offset);
            for (const decoration of sorted){
                const { start, end } = decoration;
                if (start.line === end.line) {
                    applyLineSection(start.line, start.character, end.character, decoration);
                } else if (start.line < end.line) {
                    applyLineSection(start.line, start.character, Number.POSITIVE_INFINITY, decoration);
                    for(let i = start.line + 1; i < end.line; i++)lineApplies.unshift(()=>applyLine(i, decoration));
                    applyLineSection(end.line, 0, end.character, decoration);
                }
            }
            lineApplies.forEach((i)=>i());
        }
    };
}
function verifyIntersections(items) {
    for(let i = 0; i < items.length; i++){
        const foo = items[i];
        if (foo.start.offset > foo.end.offset) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid decoration range: ".concat(JSON.stringify(foo.start), " - ").concat(JSON.stringify(foo.end)));
        for(let j = i + 1; j < items.length; j++){
            const bar = items[j];
            const isFooHasBarStart = foo.start.offset <= bar.start.offset && bar.start.offset < foo.end.offset;
            const isFooHasBarEnd = foo.start.offset < bar.end.offset && bar.end.offset <= foo.end.offset;
            const isBarHasFooStart = bar.start.offset <= foo.start.offset && foo.start.offset < bar.end.offset;
            const isBarHasFooEnd = bar.start.offset < foo.end.offset && foo.end.offset <= bar.end.offset;
            if (isFooHasBarStart || isFooHasBarEnd || isBarHasFooStart || isBarHasFooEnd) {
                if (isFooHasBarStart && isFooHasBarEnd) continue;
                if (isBarHasFooStart && isBarHasFooEnd) continue;
                if (isBarHasFooStart && foo.start.offset === foo.end.offset) continue;
                if (isFooHasBarEnd && bar.start.offset === bar.end.offset) continue;
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Decorations ".concat(JSON.stringify(foo.start), " and ").concat(JSON.stringify(bar.start), " intersect."));
            }
        }
    }
}
function stringify(el) {
    if (el.type === "text") return el.value;
    if (el.type === "element") return el.children.map(stringify).join("");
    return "";
}
const builtInTransformers = [
    /* @__PURE__ */ transformerDecorations()
];
function getTransformers(options) {
    const transformers = sortTransformersByEnforcement(options.transformers || []);
    return [
        ...transformers.pre,
        ...transformers.normal,
        ...transformers.post,
        ...builtInTransformers
    ];
}
function sortTransformersByEnforcement(transformers) {
    const pre = [];
    const post = [];
    const normal = [];
    for (const transformer of transformers){
        switch(transformer.enforce){
            case "pre":
                pre.push(transformer);
                break;
            case "post":
                post.push(transformer);
                break;
            default:
                normal.push(transformer);
        }
    }
    return {
        pre,
        post,
        normal
    };
}
// src/colors.ts
var namedColors = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "brightBlack",
    "brightRed",
    "brightGreen",
    "brightYellow",
    "brightBlue",
    "brightMagenta",
    "brightCyan",
    "brightWhite"
];
// src/decorations.ts
var decorations = {
    1: "bold",
    2: "dim",
    3: "italic",
    4: "underline",
    7: "reverse",
    8: "hidden",
    9: "strikethrough"
};
// src/parser.ts
function findSequence(value, position) {
    const nextEscape = value.indexOf("\x1B", position);
    if (nextEscape !== -1) {
        if (value[nextEscape + 1] === "[") {
            const nextClose = value.indexOf("m", nextEscape);
            if (nextClose !== -1) {
                return {
                    sequence: value.substring(nextEscape + 2, nextClose).split(";"),
                    startPosition: nextEscape,
                    position: nextClose + 1
                };
            }
        }
    }
    return {
        position: value.length
    };
}
function parseColor(sequence) {
    const colorMode = sequence.shift();
    if (colorMode === "2") {
        const rgb = sequence.splice(0, 3).map((x)=>Number.parseInt(x));
        if (rgb.length !== 3 || rgb.some((x)=>Number.isNaN(x))) return;
        return {
            type: "rgb",
            rgb
        };
    } else if (colorMode === "5") {
        const index = sequence.shift();
        if (index) {
            return {
                type: "table",
                index: Number(index)
            };
        }
    }
}
function parseSequence(sequence) {
    const commands = [];
    while(sequence.length > 0){
        const code = sequence.shift();
        if (!code) continue;
        const codeInt = Number.parseInt(code);
        if (Number.isNaN(codeInt)) continue;
        if (codeInt === 0) {
            commands.push({
                type: "resetAll"
            });
        } else if (codeInt <= 9) {
            const decoration = decorations[codeInt];
            if (decoration) {
                commands.push({
                    type: "setDecoration",
                    value: decorations[codeInt]
                });
            }
        } else if (codeInt <= 29) {
            const decoration = decorations[codeInt - 20];
            if (decoration) {
                commands.push({
                    type: "resetDecoration",
                    value: decoration
                });
                if (decoration === "dim") {
                    commands.push({
                        type: "resetDecoration",
                        value: "bold"
                    });
                }
            }
        } else if (codeInt <= 37) {
            commands.push({
                type: "setForegroundColor",
                value: {
                    type: "named",
                    name: namedColors[codeInt - 30]
                }
            });
        } else if (codeInt === 38) {
            const color = parseColor(sequence);
            if (color) {
                commands.push({
                    type: "setForegroundColor",
                    value: color
                });
            }
        } else if (codeInt === 39) {
            commands.push({
                type: "resetForegroundColor"
            });
        } else if (codeInt <= 47) {
            commands.push({
                type: "setBackgroundColor",
                value: {
                    type: "named",
                    name: namedColors[codeInt - 40]
                }
            });
        } else if (codeInt === 48) {
            const color = parseColor(sequence);
            if (color) {
                commands.push({
                    type: "setBackgroundColor",
                    value: color
                });
            }
        } else if (codeInt === 49) {
            commands.push({
                type: "resetBackgroundColor"
            });
        } else if (codeInt === 53) {
            commands.push({
                type: "setDecoration",
                value: "overline"
            });
        } else if (codeInt === 55) {
            commands.push({
                type: "resetDecoration",
                value: "overline"
            });
        } else if (codeInt >= 90 && codeInt <= 97) {
            commands.push({
                type: "setForegroundColor",
                value: {
                    type: "named",
                    name: namedColors[codeInt - 90 + 8]
                }
            });
        } else if (codeInt >= 100 && codeInt <= 107) {
            commands.push({
                type: "setBackgroundColor",
                value: {
                    type: "named",
                    name: namedColors[codeInt - 100 + 8]
                }
            });
        }
    }
    return commands;
}
function createAnsiSequenceParser() {
    let foreground = null;
    let background = null;
    let decorations2 = /* @__PURE__ */ new Set();
    return {
        parse (value) {
            const tokens = [];
            let position = 0;
            do {
                const findResult = findSequence(value, position);
                const text = findResult.sequence ? value.substring(position, findResult.startPosition) : value.substring(position);
                if (text.length > 0) {
                    tokens.push({
                        value: text,
                        foreground,
                        background,
                        decorations: new Set(decorations2)
                    });
                }
                if (findResult.sequence) {
                    const commands = parseSequence(findResult.sequence);
                    for (const styleToken of commands){
                        if (styleToken.type === "resetAll") {
                            foreground = null;
                            background = null;
                            decorations2.clear();
                        } else if (styleToken.type === "resetForegroundColor") {
                            foreground = null;
                        } else if (styleToken.type === "resetBackgroundColor") {
                            background = null;
                        } else if (styleToken.type === "resetDecoration") {
                            decorations2.delete(styleToken.value);
                        }
                    }
                    for (const styleToken of commands){
                        if (styleToken.type === "setForegroundColor") {
                            foreground = styleToken.value;
                        } else if (styleToken.type === "setBackgroundColor") {
                            background = styleToken.value;
                        } else if (styleToken.type === "setDecoration") {
                            decorations2.add(styleToken.value);
                        }
                    }
                }
                position = findResult.position;
            }while (position < value.length)
            return tokens;
        }
    };
}
// src/palette.ts
var defaultNamedColorsMap = {
    black: "#000000",
    red: "#bb0000",
    green: "#00bb00",
    yellow: "#bbbb00",
    blue: "#0000bb",
    magenta: "#ff00ff",
    cyan: "#00bbbb",
    white: "#eeeeee",
    brightBlack: "#555555",
    brightRed: "#ff5555",
    brightGreen: "#00ff00",
    brightYellow: "#ffff55",
    brightBlue: "#5555ff",
    brightMagenta: "#ff55ff",
    brightCyan: "#55ffff",
    brightWhite: "#ffffff"
};
function createColorPalette() {
    let namedColorsMap = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : defaultNamedColorsMap;
    function namedColor(name) {
        return namedColorsMap[name];
    }
    function rgbColor(rgb) {
        return "#".concat(rgb.map((x)=>Math.max(0, Math.min(x, 255)).toString(16).padStart(2, "0")).join(""));
    }
    let colorTable;
    function getColorTable() {
        if (colorTable) {
            return colorTable;
        }
        colorTable = [];
        for(let i = 0; i < namedColors.length; i++){
            colorTable.push(namedColor(namedColors[i]));
        }
        let levels = [
            0,
            95,
            135,
            175,
            215,
            255
        ];
        for(let r = 0; r < 6; r++){
            for(let g = 0; g < 6; g++){
                for(let b = 0; b < 6; b++){
                    colorTable.push(rgbColor([
                        levels[r],
                        levels[g],
                        levels[b]
                    ]));
                }
            }
        }
        let level = 8;
        for(let i = 0; i < 24; i++, level += 10){
            colorTable.push(rgbColor([
                level,
                level,
                level
            ]));
        }
        return colorTable;
    }
    function tableColor(index) {
        return getColorTable()[index];
    }
    function value(color) {
        switch(color.type){
            case "named":
                return namedColor(color.name);
            case "rgb":
                return rgbColor(color.rgb);
            case "table":
                return tableColor(color.index);
        }
    }
    return {
        value
    };
}
const defaultAnsiColors = {
    black: "#000000",
    red: "#cd3131",
    green: "#0DBC79",
    yellow: "#E5E510",
    blue: "#2472C8",
    magenta: "#BC3FBC",
    cyan: "#11A8CD",
    white: "#E5E5E5",
    brightBlack: "#666666",
    brightRed: "#F14C4C",
    brightGreen: "#23D18B",
    brightYellow: "#F5F543",
    brightBlue: "#3B8EEA",
    brightMagenta: "#D670D6",
    brightCyan: "#29B8DB",
    brightWhite: "#FFFFFF"
};
function tokenizeAnsiWithTheme(theme, fileContents, options) {
    const colorReplacements = resolveColorReplacements(theme, options);
    const lines = splitLines(fileContents);
    const ansiPalette = Object.fromEntries(namedColors.map((name)=>{
        var _theme_colors;
        const key = "terminal.ansi".concat(name[0].toUpperCase()).concat(name.substring(1));
        const themeColor = (_theme_colors = theme.colors) === null || _theme_colors === void 0 ? void 0 : _theme_colors[key];
        return [
            name,
            themeColor || defaultAnsiColors[name]
        ];
    }));
    const colorPalette = createColorPalette(ansiPalette);
    const parser = createAnsiSequenceParser();
    return lines.map((line)=>parser.parse(line[0]).map((token)=>{
            let color;
            let bgColor;
            if (token.decorations.has("reverse")) {
                color = token.background ? colorPalette.value(token.background) : theme.bg;
                bgColor = token.foreground ? colorPalette.value(token.foreground) : theme.fg;
            } else {
                color = token.foreground ? colorPalette.value(token.foreground) : theme.fg;
                bgColor = token.background ? colorPalette.value(token.background) : void 0;
            }
            color = applyColorReplacements(color, colorReplacements);
            bgColor = applyColorReplacements(bgColor, colorReplacements);
            if (token.decorations.has("dim")) color = dimColor(color);
            let fontStyle = __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].None;
            if (token.decorations.has("bold")) fontStyle |= __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Bold;
            if (token.decorations.has("italic")) fontStyle |= __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Italic;
            if (token.decorations.has("underline")) fontStyle |= __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Underline;
            if (token.decorations.has("strikethrough")) fontStyle |= __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Strikethrough;
            return {
                content: token.value,
                offset: line[1],
                // TODO: more accurate offset? might need to fork ansi-sequence-parser
                color,
                bgColor,
                fontStyle
            };
        }));
}
function dimColor(color) {
    const hexMatch = color.match(/#([0-9a-f]{3})([0-9a-f]{3})?([0-9a-f]{2})?/i);
    if (hexMatch) {
        if (hexMatch[3]) {
            const alpha = Math.round(Number.parseInt(hexMatch[3], 16) / 2).toString(16).padStart(2, "0");
            return "#".concat(hexMatch[1]).concat(hexMatch[2]).concat(alpha);
        } else if (hexMatch[2]) {
            return "#".concat(hexMatch[1]).concat(hexMatch[2], "80");
        } else {
            return "#".concat(Array.from(hexMatch[1]).map((x)=>"".concat(x).concat(x)).join(""), "80");
        }
    }
    const cssVarMatch = color.match(/var\((--[\w-]+-ansi-[\w-]+)\)/);
    if (cssVarMatch) return "var(".concat(cssVarMatch[1], "-dim)");
    return color;
}
function codeToTokensBase(internal, code) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const { lang = "text", theme: themeName = internal.getLoadedThemes()[0] } = options;
    if (isPlainLang(lang) || isNoneTheme(themeName)) return splitLines(code).map((line)=>[
            {
                content: line[0],
                offset: line[1]
            }
        ]);
    const { theme, colorMap } = internal.setTheme(themeName);
    if (lang === "ansi") return tokenizeAnsiWithTheme(theme, code, options);
    const _grammar = internal.getLanguage(lang);
    if (options.grammarState) {
        if (options.grammarState.lang !== _grammar.name) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]('Grammar state language "'.concat(options.grammarState.lang, '" does not match highlight language "').concat(_grammar.name, '"'));
        }
        if (!options.grammarState.themes.includes(theme.name)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]('Grammar state themes "'.concat(options.grammarState.themes, '" do not contain highlight theme "').concat(theme.name, '"'));
        }
    }
    return tokenizeWithTheme(code, _grammar, theme, colorMap, options);
}
function getLastGrammarState() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    if (args.length === 2) {
        return getLastGrammarStateFromMap(args[1]);
    }
    const [internal, code, options = {}] = args;
    const { lang = "text", theme: themeName = internal.getLoadedThemes()[0] } = options;
    if (isPlainLang(lang) || isNoneTheme(themeName)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Plain language does not have grammar state");
    if (lang === "ansi") throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("ANSI language does not have grammar state");
    const { theme, colorMap } = internal.setTheme(themeName);
    const _grammar = internal.getLanguage(lang);
    return new GrammarState(_tokenizeWithTheme(code, _grammar, theme, colorMap, options).stateStack, _grammar.name, theme.name);
}
function tokenizeWithTheme(code, grammar, theme, colorMap, options) {
    const result = _tokenizeWithTheme(code, grammar, theme, colorMap, options);
    const grammarState = new GrammarState(_tokenizeWithTheme(code, grammar, theme, colorMap, options).stateStack, grammar.name, theme.name);
    setLastGrammarStateToMap(result.tokens, grammarState);
    return result.tokens;
}
function _tokenizeWithTheme(code, grammar, theme, colorMap, options) {
    const colorReplacements = resolveColorReplacements(theme, options);
    const { tokenizeMaxLineLength = 0, tokenizeTimeLimit = 500 } = options;
    const lines = splitLines(code);
    var _getGrammarStack;
    let stateStack = options.grammarState ? (_getGrammarStack = getGrammarStack(options.grammarState, theme.name)) !== null && _getGrammarStack !== void 0 ? _getGrammarStack : __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL"] : options.grammarContextCode != null ? _tokenizeWithTheme(options.grammarContextCode, grammar, theme, colorMap, {
        ...options,
        grammarState: void 0,
        grammarContextCode: void 0
    }).stateStack : __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL"];
    let actual = [];
    const final = [];
    for(let i = 0, len = lines.length; i < len; i++){
        const [line, lineOffset] = lines[i];
        if (line === "") {
            actual = [];
            final.push([]);
            continue;
        }
        if (tokenizeMaxLineLength > 0 && line.length >= tokenizeMaxLineLength) {
            actual = [];
            final.push([
                {
                    content: line,
                    offset: lineOffset,
                    color: "",
                    fontStyle: 0
                }
            ]);
            continue;
        }
        let resultWithScopes;
        let tokensWithScopes;
        let tokensWithScopesIndex;
        if (options.includeExplanation) {
            resultWithScopes = grammar.tokenizeLine(line, stateStack, tokenizeTimeLimit);
            tokensWithScopes = resultWithScopes.tokens;
            tokensWithScopesIndex = 0;
        }
        const result = grammar.tokenizeLine2(line, stateStack, tokenizeTimeLimit);
        const tokensLength = result.tokens.length / 2;
        for(let j = 0; j < tokensLength; j++){
            const startIndex = result.tokens[2 * j];
            const nextStartIndex = j + 1 < tokensLength ? result.tokens[2 * j + 2] : line.length;
            if (startIndex === nextStartIndex) continue;
            const metadata = result.tokens[2 * j + 1];
            const color = applyColorReplacements(colorMap[__TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EncodedTokenMetadata"].getForeground(metadata)], colorReplacements);
            const fontStyle = __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EncodedTokenMetadata"].getFontStyle(metadata);
            const token = {
                content: line.substring(startIndex, nextStartIndex),
                offset: lineOffset + startIndex,
                color,
                fontStyle
            };
            if (options.includeExplanation) {
                const themeSettingsSelectors = [];
                if (options.includeExplanation !== "scopeName") {
                    for (const setting of theme.settings){
                        let selectors;
                        switch(typeof setting.scope){
                            case "string":
                                selectors = setting.scope.split(/,/).map((scope)=>scope.trim());
                                break;
                            case "object":
                                selectors = setting.scope;
                                break;
                            default:
                                continue;
                        }
                        themeSettingsSelectors.push({
                            settings: setting,
                            selectors: selectors.map((selector)=>selector.split(/ /))
                        });
                    }
                }
                token.explanation = [];
                let offset = 0;
                while(startIndex + offset < nextStartIndex){
                    const tokenWithScopes = tokensWithScopes[tokensWithScopesIndex];
                    const tokenWithScopesText = line.substring(tokenWithScopes.startIndex, tokenWithScopes.endIndex);
                    offset += tokenWithScopesText.length;
                    token.explanation.push({
                        content: tokenWithScopesText,
                        scopes: options.includeExplanation === "scopeName" ? explainThemeScopesNameOnly(tokenWithScopes.scopes) : explainThemeScopesFull(themeSettingsSelectors, tokenWithScopes.scopes)
                    });
                    tokensWithScopesIndex += 1;
                }
            }
            actual.push(token);
        }
        final.push(actual);
        actual = [];
        stateStack = result.ruleStack;
    }
    return {
        tokens: final,
        stateStack
    };
}
function explainThemeScopesNameOnly(scopes) {
    return scopes.map((scope)=>({
            scopeName: scope
        }));
}
function explainThemeScopesFull(themeSelectors, scopes) {
    const result = [];
    for(let i = 0, len = scopes.length; i < len; i++){
        const scope = scopes[i];
        result[i] = {
            scopeName: scope,
            themeMatches: explainThemeScope(themeSelectors, scope, scopes.slice(0, i))
        };
    }
    return result;
}
function matchesOne(selector, scope) {
    return selector === scope || scope.substring(0, selector.length) === selector && scope[selector.length] === ".";
}
function matches(selectors, scope, parentScopes) {
    if (!matchesOne(selectors[selectors.length - 1], scope)) return false;
    let selectorParentIndex = selectors.length - 2;
    let parentIndex = parentScopes.length - 1;
    while(selectorParentIndex >= 0 && parentIndex >= 0){
        if (matchesOne(selectors[selectorParentIndex], parentScopes[parentIndex])) selectorParentIndex -= 1;
        parentIndex -= 1;
    }
    if (selectorParentIndex === -1) return true;
    return false;
}
function explainThemeScope(themeSettingsSelectors, scope, parentScopes) {
    const result = [];
    for (const { selectors, settings } of themeSettingsSelectors){
        for (const selectorPieces of selectors){
            if (matches(selectorPieces, scope, parentScopes)) {
                result.push(settings);
                break;
            }
        }
    }
    return result;
}
function codeToTokensWithThemes(internal, code, options) {
    const themes = Object.entries(options.themes).filter((i)=>i[1]).map((i)=>({
            color: i[0],
            theme: i[1]
        }));
    const themedTokens = themes.map((t)=>{
        const tokens2 = codeToTokensBase(internal, code, {
            ...options,
            theme: t.theme
        });
        const state = getLastGrammarStateFromMap(tokens2);
        const theme = typeof t.theme === "string" ? t.theme : t.theme.name;
        return {
            tokens: tokens2,
            state,
            theme
        };
    });
    const tokens = syncThemesTokenization(...themedTokens.map((i)=>i.tokens));
    const mergedTokens = tokens[0].map((line, lineIdx)=>line.map((_token, tokenIdx)=>{
            const mergedToken = {
                content: _token.content,
                variants: {},
                offset: _token.offset
            };
            if ("includeExplanation" in options && options.includeExplanation) {
                mergedToken.explanation = _token.explanation;
            }
            tokens.forEach((t, themeIdx)=>{
                const { content: _, explanation: __, offset: ___, ...styles } = t[lineIdx][tokenIdx];
                mergedToken.variants[themes[themeIdx].color] = styles;
            });
            return mergedToken;
        }));
    const mergedGrammarState = themedTokens[0].state ? new GrammarState(Object.fromEntries(themedTokens.map((s)=>{
        var _s_state;
        return [
            s.theme,
            (_s_state = s.state) === null || _s_state === void 0 ? void 0 : _s_state.getInternalStack(s.theme)
        ];
    })), themedTokens[0].state.lang) : void 0;
    if (mergedGrammarState) setLastGrammarStateToMap(mergedTokens, mergedGrammarState);
    return mergedTokens;
}
function syncThemesTokenization() {
    for(var _len = arguments.length, themes = new Array(_len), _key = 0; _key < _len; _key++){
        themes[_key] = arguments[_key];
    }
    const outThemes = themes.map(()=>[]);
    const count = themes.length;
    for(let i = 0; i < themes[0].length; i++){
        const lines = themes.map((t)=>t[i]);
        const outLines = outThemes.map(()=>[]);
        outThemes.forEach((t, i2)=>t.push(outLines[i2]));
        const indexes = lines.map(()=>0);
        const current = lines.map((l)=>l[0]);
        while(current.every((t)=>t)){
            const minLength = Math.min(...current.map((t)=>t.content.length));
            for(let n = 0; n < count; n++){
                const token = current[n];
                if (token.content.length === minLength) {
                    outLines[n].push(token);
                    indexes[n] += 1;
                    current[n] = lines[n][indexes[n]];
                } else {
                    outLines[n].push({
                        ...token,
                        content: token.content.slice(0, minLength)
                    });
                    current[n] = {
                        ...token,
                        content: token.content.slice(minLength),
                        offset: token.offset + minLength
                    };
                }
            }
        }
    }
    return outThemes;
}
function codeToTokens(internal, code, options) {
    let bg;
    let fg;
    let tokens;
    let themeName;
    let rootStyle;
    let grammarState;
    if ("themes" in options) {
        const { defaultColor = "light", cssVariablePrefix = "--shiki-", colorsRendering = "css-vars" } = options;
        const themes = Object.entries(options.themes).filter((i)=>i[1]).map((i)=>({
                color: i[0],
                theme: i[1]
            })).sort((a, b)=>a.color === defaultColor ? -1 : b.color === defaultColor ? 1 : 0);
        if (themes.length === 0) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("`themes` option must not be empty");
        const themeTokens = codeToTokensWithThemes(internal, code, options);
        grammarState = getLastGrammarStateFromMap(themeTokens);
        if (defaultColor && DEFAULT_COLOR_LIGHT_DARK !== defaultColor && !themes.find((t)=>t.color === defaultColor)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("`themes` option must contain the defaultColor key `".concat(defaultColor, "`"));
        const themeRegs = themes.map((t)=>internal.getTheme(t.theme));
        const themesOrder = themes.map((t)=>t.color);
        tokens = themeTokens.map((line)=>line.map((token)=>flatTokenVariants(token, themesOrder, cssVariablePrefix, defaultColor, colorsRendering)));
        if (grammarState) setLastGrammarStateToMap(tokens, grammarState);
        const themeColorReplacements = themes.map((t)=>resolveColorReplacements(t.theme, options));
        fg = mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, "fg", colorsRendering);
        bg = mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, "bg", colorsRendering);
        themeName = "shiki-themes ".concat(themeRegs.map((t)=>t.name).join(" "));
        rootStyle = defaultColor ? void 0 : [
            fg,
            bg
        ].join(";");
    } else if ("theme" in options) {
        const colorReplacements = resolveColorReplacements(options.theme, options);
        tokens = codeToTokensBase(internal, code, options);
        const _theme = internal.getTheme(options.theme);
        bg = applyColorReplacements(_theme.bg, colorReplacements);
        fg = applyColorReplacements(_theme.fg, colorReplacements);
        themeName = _theme.name;
        grammarState = getLastGrammarStateFromMap(tokens);
    } else {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Invalid options, either `theme` or `themes` must be provided");
    }
    return {
        tokens,
        fg,
        bg,
        themeName,
        rootStyle,
        grammarState
    };
}
function mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, property, colorsRendering) {
    return themes.map((t, idx)=>{
        const value = applyColorReplacements(themeRegs[idx][property], themeColorReplacements[idx]) || "inherit";
        const cssVar = "".concat(cssVariablePrefix + t.color).concat(property === "bg" ? "-bg" : "", ":").concat(value);
        if (idx === 0 && defaultColor) {
            if (defaultColor === DEFAULT_COLOR_LIGHT_DARK && themes.length > 1) {
                const lightIndex = themes.findIndex((t2)=>t2.color === "light");
                const darkIndex = themes.findIndex((t2)=>t2.color === "dark");
                if (lightIndex === -1 || darkIndex === -1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]('When using `defaultColor: "light-dark()"`, you must provide both `light` and `dark` themes');
                const lightValue = applyColorReplacements(themeRegs[lightIndex][property], themeColorReplacements[lightIndex]) || "inherit";
                const darkValue = applyColorReplacements(themeRegs[darkIndex][property], themeColorReplacements[darkIndex]) || "inherit";
                return "light-dark(".concat(lightValue, ", ").concat(darkValue, ");").concat(cssVar);
            }
            return value;
        }
        if (colorsRendering === "css-vars") {
            return cssVar;
        }
        return null;
    }).filter((i)=>!!i).join(";");
}
function codeToHast(internal, code, options) {
    let transformerContext = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {
        meta: {},
        options,
        codeToHast: (_code, _options)=>codeToHast(internal, _code, _options),
        codeToTokens: (_code, _options)=>codeToTokens(internal, _code, _options)
    };
    var _transformer_preprocess, _transformer_tokens;
    let input = code;
    for (const transformer of getTransformers(options))input = ((_transformer_preprocess = transformer.preprocess) === null || _transformer_preprocess === void 0 ? void 0 : _transformer_preprocess.call(transformerContext, input, options)) || input;
    let { tokens, fg, bg, themeName, rootStyle, grammarState } = codeToTokens(internal, input, options);
    const { mergeWhitespaces = true, mergeSameStyleTokens = false } = options;
    if (mergeWhitespaces === true) tokens = mergeWhitespaceTokens(tokens);
    else if (mergeWhitespaces === "never") tokens = splitWhitespaceTokens(tokens);
    if (mergeSameStyleTokens) {
        tokens = mergeAdjacentStyledTokens(tokens);
    }
    const contextSource = {
        ...transformerContext,
        get source () {
            return input;
        }
    };
    for (const transformer of getTransformers(options))tokens = ((_transformer_tokens = transformer.tokens) === null || _transformer_tokens === void 0 ? void 0 : _transformer_tokens.call(contextSource, tokens)) || tokens;
    return tokensToHast(tokens, {
        ...options,
        fg,
        bg,
        themeName,
        rootStyle
    }, contextSource, grammarState);
}
function tokensToHast(tokens, options, transformerContext) {
    let grammarState = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : getLastGrammarStateFromMap(tokens);
    var _transformer_root;
    const transformers = getTransformers(options);
    const lines = [];
    const root = {
        type: "root",
        children: []
    };
    const { structure = "classic", tabindex = "0" } = options;
    let preNode = {
        type: "element",
        tagName: "pre",
        properties: {
            class: "shiki ".concat(options.themeName || ""),
            style: options.rootStyle || "background-color:".concat(options.bg, ";color:").concat(options.fg),
            ...tabindex !== false && tabindex != null ? {
                tabindex: tabindex.toString()
            } : {},
            ...Object.fromEntries(Array.from(Object.entries(options.meta || {})).filter((param)=>{
                let [key] = param;
                return !key.startsWith("_");
            }))
        },
        children: []
    };
    let codeNode = {
        type: "element",
        tagName: "code",
        properties: {},
        children: lines
    };
    const lineNodes = [];
    const context = {
        ...transformerContext,
        structure,
        addClassToHast,
        get source () {
            return transformerContext.source;
        },
        get tokens () {
            return tokens;
        },
        get options () {
            return options;
        },
        get root () {
            return root;
        },
        get pre () {
            return preNode;
        },
        get code () {
            return codeNode;
        },
        get lines () {
            return lineNodes;
        }
    };
    tokens.forEach((line, idx)=>{
        if (idx) {
            if (structure === "inline") root.children.push({
                type: "element",
                tagName: "br",
                properties: {},
                children: []
            });
            else if (structure === "classic") lines.push({
                type: "text",
                value: "\n"
            });
        }
        let lineNode = {
            type: "element",
            tagName: "span",
            properties: {
                class: "line"
            },
            children: []
        };
        let col = 0;
        for (const token of line){
            var _transformer_span;
            let tokenNode = {
                type: "element",
                tagName: "span",
                properties: {
                    ...token.htmlAttrs
                },
                children: [
                    {
                        type: "text",
                        value: token.content
                    }
                ]
            };
            const style = stringifyTokenStyle(token.htmlStyle || getTokenStyleObject(token));
            if (style) tokenNode.properties.style = style;
            for (const transformer of transformers)tokenNode = (transformer === null || transformer === void 0 ? void 0 : (_transformer_span = transformer.span) === null || _transformer_span === void 0 ? void 0 : _transformer_span.call(context, tokenNode, idx + 1, col, lineNode, token)) || tokenNode;
            if (structure === "inline") root.children.push(tokenNode);
            else if (structure === "classic") lineNode.children.push(tokenNode);
            col += token.content.length;
        }
        if (structure === "classic") {
            var _transformer_line;
            for (const transformer of transformers)lineNode = (transformer === null || transformer === void 0 ? void 0 : (_transformer_line = transformer.line) === null || _transformer_line === void 0 ? void 0 : _transformer_line.call(context, lineNode, idx + 1)) || lineNode;
            lineNodes.push(lineNode);
            lines.push(lineNode);
        }
    });
    if (structure === "classic") {
        var _transformer_code, _transformer_pre;
        for (const transformer of transformers)codeNode = (transformer === null || transformer === void 0 ? void 0 : (_transformer_code = transformer.code) === null || _transformer_code === void 0 ? void 0 : _transformer_code.call(context, codeNode)) || codeNode;
        preNode.children.push(codeNode);
        for (const transformer of transformers)preNode = (transformer === null || transformer === void 0 ? void 0 : (_transformer_pre = transformer.pre) === null || _transformer_pre === void 0 ? void 0 : _transformer_pre.call(context, preNode)) || preNode;
        root.children.push(preNode);
    }
    let result = root;
    for (const transformer of transformers)result = (transformer === null || transformer === void 0 ? void 0 : (_transformer_root = transformer.root) === null || _transformer_root === void 0 ? void 0 : _transformer_root.call(context, result)) || result;
    if (grammarState) setLastGrammarStateToMap(result, grammarState);
    return result;
}
function mergeWhitespaceTokens(tokens) {
    return tokens.map((line)=>{
        const newLine = [];
        let carryOnContent = "";
        let firstOffset = 0;
        line.forEach((token, idx)=>{
            const isDecorated = token.fontStyle && (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Underline || token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Strikethrough);
            const couldMerge = !isDecorated;
            if (couldMerge && token.content.match(/^\s+$/) && line[idx + 1]) {
                if (!firstOffset) firstOffset = token.offset;
                carryOnContent += token.content;
            } else {
                if (carryOnContent) {
                    if (couldMerge) {
                        newLine.push({
                            ...token,
                            offset: firstOffset,
                            content: carryOnContent + token.content
                        });
                    } else {
                        newLine.push({
                            content: carryOnContent,
                            offset: firstOffset
                        }, token);
                    }
                    firstOffset = 0;
                    carryOnContent = "";
                } else {
                    newLine.push(token);
                }
            }
        });
        return newLine;
    });
}
function splitWhitespaceTokens(tokens) {
    return tokens.map((line)=>{
        return line.flatMap((token)=>{
            if (token.content.match(/^\s+$/)) return token;
            const match = token.content.match(/^(\s*)(.*?)(\s*)$/);
            if (!match) return token;
            const [, leading, content, trailing] = match;
            if (!leading && !trailing) return token;
            const expanded = [
                {
                    ...token,
                    offset: token.offset + leading.length,
                    content
                }
            ];
            if (leading) {
                expanded.unshift({
                    content: leading,
                    offset: token.offset
                });
            }
            if (trailing) {
                expanded.push({
                    content: trailing,
                    offset: token.offset + leading.length + content.length
                });
            }
            return expanded;
        });
    });
}
function mergeAdjacentStyledTokens(tokens) {
    return tokens.map((line)=>{
        const newLine = [];
        for (const token of line){
            if (newLine.length === 0) {
                newLine.push({
                    ...token
                });
                continue;
            }
            const prevToken = newLine[newLine.length - 1];
            const prevStyle = stringifyTokenStyle(prevToken.htmlStyle || getTokenStyleObject(prevToken));
            const currentStyle = stringifyTokenStyle(token.htmlStyle || getTokenStyleObject(token));
            const isPrevDecorated = prevToken.fontStyle && (prevToken.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Underline || prevToken.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Strikethrough);
            const isDecorated = token.fontStyle && (token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Underline || token.fontStyle & __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontStyle"].Strikethrough);
            if (!isPrevDecorated && !isDecorated && prevStyle === currentStyle) {
                prevToken.content += token.content;
            } else {
                newLine.push({
                    ...token
                });
            }
        }
        return newLine;
    });
}
const hastToHtml = __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$hast$2d$util$2d$to$2d$html$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toHtml"];
function codeToHtml(internal, code, options) {
    var _transformer_postprocess;
    const context = {
        meta: {},
        options,
        codeToHast: (_code, _options)=>codeToHast(internal, _code, _options),
        codeToTokens: (_code, _options)=>codeToTokens(internal, _code, _options)
    };
    let result = hastToHtml(codeToHast(internal, code, options, context));
    for (const transformer of getTransformers(options))result = ((_transformer_postprocess = transformer.postprocess) === null || _transformer_postprocess === void 0 ? void 0 : _transformer_postprocess.call(context, result, options)) || result;
    return result;
}
const VSCODE_FALLBACK_EDITOR_FG = {
    light: "#333333",
    dark: "#bbbbbb"
};
const VSCODE_FALLBACK_EDITOR_BG = {
    light: "#fffffe",
    dark: "#1e1e1e"
};
const RESOLVED_KEY = "__shiki_resolved";
function normalizeTheme(rawTheme) {
    var _theme, _theme1;
    if (rawTheme === null || rawTheme === void 0 ? void 0 : rawTheme[RESOLVED_KEY]) return rawTheme;
    const theme = {
        ...rawTheme
    };
    if (theme.tokenColors && !theme.settings) {
        theme.settings = theme.tokenColors;
        delete theme.tokenColors;
    }
    (_theme = theme).type || (_theme.type = "dark");
    theme.colorReplacements = {
        ...theme.colorReplacements
    };
    (_theme1 = theme).settings || (_theme1.settings = []);
    let { bg, fg } = theme;
    if (!bg || !fg) {
        var _globalSetting_settings, _globalSetting_settings1, _theme_colors, _theme_colors1;
        const globalSetting = theme.settings ? theme.settings.find((s)=>!s.name && !s.scope) : void 0;
        if (globalSetting === null || globalSetting === void 0 ? void 0 : (_globalSetting_settings = globalSetting.settings) === null || _globalSetting_settings === void 0 ? void 0 : _globalSetting_settings.foreground) fg = globalSetting.settings.foreground;
        if (globalSetting === null || globalSetting === void 0 ? void 0 : (_globalSetting_settings1 = globalSetting.settings) === null || _globalSetting_settings1 === void 0 ? void 0 : _globalSetting_settings1.background) bg = globalSetting.settings.background;
        if (!fg && (theme === null || theme === void 0 ? void 0 : (_theme_colors = theme.colors) === null || _theme_colors === void 0 ? void 0 : _theme_colors["editor.foreground"])) fg = theme.colors["editor.foreground"];
        if (!bg && (theme === null || theme === void 0 ? void 0 : (_theme_colors1 = theme.colors) === null || _theme_colors1 === void 0 ? void 0 : _theme_colors1["editor.background"])) bg = theme.colors["editor.background"];
        if (!fg) fg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_FG.light : VSCODE_FALLBACK_EDITOR_FG.dark;
        if (!bg) bg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_BG.light : VSCODE_FALLBACK_EDITOR_BG.dark;
        theme.fg = fg;
        theme.bg = bg;
    }
    if (!(theme.settings[0] && theme.settings[0].settings && !theme.settings[0].scope)) {
        theme.settings.unshift({
            settings: {
                foreground: theme.fg,
                background: theme.bg
            }
        });
    }
    let replacementCount = 0;
    const replacementMap = /* @__PURE__ */ new Map();
    function getReplacementColor(value) {
        var _theme_colorReplacements;
        if (replacementMap.has(value)) return replacementMap.get(value);
        replacementCount += 1;
        const hex = "#".concat(replacementCount.toString(16).padStart(8, "0").toLowerCase());
        if ((_theme_colorReplacements = theme.colorReplacements) === null || _theme_colorReplacements === void 0 ? void 0 : _theme_colorReplacements["#".concat(hex)]) return getReplacementColor(value);
        replacementMap.set(value, hex);
        return hex;
    }
    theme.settings = theme.settings.map((setting)=>{
        var _setting_settings, _setting_settings1;
        const replaceFg = ((_setting_settings = setting.settings) === null || _setting_settings === void 0 ? void 0 : _setting_settings.foreground) && !setting.settings.foreground.startsWith("#");
        const replaceBg = ((_setting_settings1 = setting.settings) === null || _setting_settings1 === void 0 ? void 0 : _setting_settings1.background) && !setting.settings.background.startsWith("#");
        if (!replaceFg && !replaceBg) return setting;
        const clone = {
            ...setting,
            settings: {
                ...setting.settings
            }
        };
        if (replaceFg) {
            const replacement = getReplacementColor(setting.settings.foreground);
            theme.colorReplacements[replacement] = setting.settings.foreground;
            clone.settings.foreground = replacement;
        }
        if (replaceBg) {
            const replacement = getReplacementColor(setting.settings.background);
            theme.colorReplacements[replacement] = setting.settings.background;
            clone.settings.background = replacement;
        }
        return clone;
    });
    for (const key of Object.keys(theme.colors || {})){
        if (key === "editor.foreground" || key === "editor.background" || key.startsWith("terminal.ansi")) {
            var _theme_colors_key;
            if (!((_theme_colors_key = theme.colors[key]) === null || _theme_colors_key === void 0 ? void 0 : _theme_colors_key.startsWith("#"))) {
                const replacement = getReplacementColor(theme.colors[key]);
                theme.colorReplacements[replacement] = theme.colors[key];
                theme.colors[key] = replacement;
            }
        }
    }
    Object.defineProperty(theme, RESOLVED_KEY, {
        enumerable: false,
        writable: false,
        value: true
    });
    return theme;
}
async function resolveLangs(langs) {
    return Array.from(new Set((await Promise.all(langs.filter((l)=>!isSpecialLang(l)).map(async (lang)=>await normalizeGetter(lang).then((r)=>Array.isArray(r) ? r : [
                r
            ])))).flat()));
}
async function resolveThemes(themes) {
    const resolved = await Promise.all(themes.map(async (theme)=>isSpecialTheme(theme) ? null : normalizeTheme(await normalizeGetter(theme))));
    return resolved.filter((i)=>!!i);
}
let _emitDeprecation = 3;
let _emitError = false;
function enableDeprecationWarnings() {
    let emitDeprecation = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, emitError = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    _emitDeprecation = emitDeprecation;
    _emitError = emitError;
}
function warnDeprecated(message) {
    let version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
    if (!_emitDeprecation) return;
    if (typeof _emitDeprecation === "number" && version > _emitDeprecation) return;
    if (_emitError) {
        throw new Error("[SHIKI DEPRECATE]: ".concat(message));
    } else {
        console.trace("[SHIKI DEPRECATE]: ".concat(message));
    }
}
class ShikiError extends Error {
    constructor(message){
        super(message);
        this.name = "ShikiError";
    }
}
class Registry extends __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Registry"] {
    getTheme(theme) {
        if (typeof theme === "string") return this._resolvedThemes.get(theme);
        else return this.loadTheme(theme);
    }
    loadTheme(theme) {
        const _theme = normalizeTheme(theme);
        if (_theme.name) {
            this._resolvedThemes.set(_theme.name, _theme);
            this._loadedThemesCache = null;
        }
        return _theme;
    }
    getLoadedThemes() {
        if (!this._loadedThemesCache) this._loadedThemesCache = [
            ...this._resolvedThemes.keys()
        ];
        return this._loadedThemesCache;
    }
    // Override and re-implement this method to cache the textmate themes as `TextMateTheme.createFromRawTheme`
    // is expensive. Themes can switch often especially for dual-theme support.
    //
    // The parent class also accepts `colorMap` as the second parameter, but since we don't use that,
    // we omit here so it's easier to cache the themes.
    setTheme(theme) {
        let textmateTheme = this._textmateThemeCache.get(theme);
        if (!textmateTheme) {
            textmateTheme = __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$vscode$2d$textmate$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Theme"].createFromRawTheme(theme);
            this._textmateThemeCache.set(theme, textmateTheme);
        }
        this._syncRegistry.setTheme(textmateTheme);
    }
    getGrammar(name) {
        if (this._alias[name]) {
            const resolved = /* @__PURE__ */ new Set([
                name
            ]);
            while(this._alias[name]){
                name = this._alias[name];
                if (resolved.has(name)) throw new ShikiError("Circular alias `".concat(Array.from(resolved).join(" -> "), " -> ").concat(name, "`"));
                resolved.add(name);
            }
        }
        return this._resolvedGrammars.get(name);
    }
    loadLanguage(lang) {
        if (this.getGrammar(lang.name)) return;
        const embeddedLazilyBy = new Set([
            ...this._langMap.values()
        ].filter((i)=>{
            var _i_embeddedLangsLazy;
            return (_i_embeddedLangsLazy = i.embeddedLangsLazy) === null || _i_embeddedLangsLazy === void 0 ? void 0 : _i_embeddedLangsLazy.includes(lang.name);
        }));
        this._resolver.addLanguage(lang);
        const grammarConfig = {
            balancedBracketSelectors: lang.balancedBracketSelectors || [
                "*"
            ],
            unbalancedBracketSelectors: lang.unbalancedBracketSelectors || []
        };
        this._syncRegistry._rawGrammars.set(lang.scopeName, lang);
        const g = this.loadGrammarWithConfiguration(lang.scopeName, 1, grammarConfig);
        g.name = lang.name;
        this._resolvedGrammars.set(lang.name, g);
        if (lang.aliases) {
            lang.aliases.forEach((alias)=>{
                this._alias[alias] = lang.name;
            });
        }
        this._loadedLanguagesCache = null;
        if (embeddedLazilyBy.size) {
            for (const e of embeddedLazilyBy){
                var _this__syncRegistry__injectionGrammars, _this__syncRegistry, _this__syncRegistry__grammars, _this__syncRegistry1;
                this._resolvedGrammars.delete(e.name);
                this._loadedLanguagesCache = null;
                (_this__syncRegistry = this._syncRegistry) === null || _this__syncRegistry === void 0 ? void 0 : (_this__syncRegistry__injectionGrammars = _this__syncRegistry._injectionGrammars) === null || _this__syncRegistry__injectionGrammars === void 0 ? void 0 : _this__syncRegistry__injectionGrammars.delete(e.scopeName);
                (_this__syncRegistry1 = this._syncRegistry) === null || _this__syncRegistry1 === void 0 ? void 0 : (_this__syncRegistry__grammars = _this__syncRegistry1._grammars) === null || _this__syncRegistry__grammars === void 0 ? void 0 : _this__syncRegistry__grammars.delete(e.scopeName);
                this.loadLanguage(this._langMap.get(e.name));
            }
        }
    }
    dispose() {
        super.dispose();
        this._resolvedThemes.clear();
        this._resolvedGrammars.clear();
        this._langMap.clear();
        this._langGraph.clear();
        this._loadedThemesCache = null;
    }
    loadLanguages(langs) {
        for (const lang of langs)this.resolveEmbeddedLanguages(lang);
        const langsGraphArray = Array.from(this._langGraph.entries());
        const missingLangs = langsGraphArray.filter((param)=>{
            let [_, lang] = param;
            return !lang;
        });
        if (missingLangs.length) {
            const dependents = langsGraphArray.filter((param)=>{
                let [_, lang] = param;
                var _lang_embeddedLangs;
                return lang && ((_lang_embeddedLangs = lang.embeddedLangs) === null || _lang_embeddedLangs === void 0 ? void 0 : _lang_embeddedLangs.some((l)=>missingLangs.map((param)=>{
                        let [name] = param;
                        return name;
                    }).includes(l)));
            }).filter((lang)=>!missingLangs.includes(lang));
            throw new ShikiError("Missing languages ".concat(missingLangs.map((param)=>{
                let [name] = param;
                return "`".concat(name, "`");
            }).join(", "), ", required by ").concat(dependents.map((param)=>{
                let [name] = param;
                return "`".concat(name, "`");
            }).join(", ")));
        }
        for (const [_, lang] of langsGraphArray)this._resolver.addLanguage(lang);
        for (const [_, lang] of langsGraphArray)this.loadLanguage(lang);
    }
    getLoadedLanguages() {
        if (!this._loadedLanguagesCache) {
            this._loadedLanguagesCache = [
                .../* @__PURE__ */ new Set([
                    ...this._resolvedGrammars.keys(),
                    ...Object.keys(this._alias)
                ])
            ];
        }
        return this._loadedLanguagesCache;
    }
    resolveEmbeddedLanguages(lang) {
        this._langMap.set(lang.name, lang);
        this._langGraph.set(lang.name, lang);
        if (lang.embeddedLangs) {
            for (const embeddedLang of lang.embeddedLangs)this._langGraph.set(embeddedLang, this._langMap.get(embeddedLang));
        }
    }
    constructor(_resolver, _themes, _langs, _alias = {}){
        super(_resolver), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_resolvedThemes", /* @__PURE__ */ new Map()), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_resolvedGrammars", /* @__PURE__ */ new Map()), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_langMap", /* @__PURE__ */ new Map()), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_langGraph", /* @__PURE__ */ new Map()), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_textmateThemeCache", /* @__PURE__ */ new WeakMap()), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_loadedThemesCache", null), (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_loadedLanguagesCache", null);
        this._resolver = _resolver;
        this._themes = _themes;
        this._langs = _langs;
        this._alias = _alias;
        this._themes.map((t)=>this.loadTheme(t));
        this.loadLanguages(this._langs);
    }
}
class Resolver {
    get onigLib() {
        return this._onigLib;
    }
    getLangRegistration(langIdOrAlias) {
        return this._langs.get(langIdOrAlias);
    }
    loadGrammar(scopeName) {
        return this._scopeToLang.get(scopeName);
    }
    addLanguage(l) {
        this._langs.set(l.name, l);
        if (l.aliases) {
            l.aliases.forEach((a)=>{
                this._langs.set(a, l);
            });
        }
        this._scopeToLang.set(l.scopeName, l);
        if (l.injectTo) {
            l.injectTo.forEach((i)=>{
                if (!this._injections.get(i)) this._injections.set(i, []);
                this._injections.get(i).push(l.scopeName);
            });
        }
    }
    getInjections(scopeName) {
        const scopeParts = scopeName.split(".");
        let injections = [];
        for(let i = 1; i <= scopeParts.length; i++){
            const subScopeName = scopeParts.slice(0, i).join(".");
            injections = [
                ...injections,
                ...this._injections.get(subScopeName) || []
            ];
        }
        return injections;
    }
    constructor(engine, langs){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_langs", /* @__PURE__ */ new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_scopeToLang", /* @__PURE__ */ new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_injections", /* @__PURE__ */ new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_onigLib", void 0);
        this._onigLib = {
            createOnigScanner: (patterns)=>engine.createScanner(patterns),
            createOnigString: (s)=>engine.createString(s)
        };
        langs.forEach((i)=>this.addLanguage(i));
    }
}
let instancesCount = 0;
function createShikiInternalSync(options) {
    instancesCount += 1;
    if (options.warnings !== false && instancesCount >= 10 && instancesCount % 10 === 0) console.warn("[Shiki] ".concat(instancesCount, " instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call `highlighter.dispose()` to release unused instances."));
    let isDisposed = false;
    if (!options.engine) throw new ShikiError("`engine` option is required for synchronous mode");
    const langs = (options.langs || []).flat(1);
    const themes = (options.themes || []).flat(1).map(normalizeTheme);
    const resolver = new Resolver(options.engine, langs);
    const _registry = new Registry(resolver, themes, langs, options.langAlias);
    let _lastTheme;
    function getLanguage(name) {
        ensureNotDisposed();
        const _lang = _registry.getGrammar(typeof name === "string" ? name : name.name);
        if (!_lang) throw new ShikiError("Language `".concat(name, "` not found, you may need to load it first"));
        return _lang;
    }
    function getTheme(name) {
        if (name === "none") return {
            bg: "",
            fg: "",
            name: "none",
            settings: [],
            type: "dark"
        };
        ensureNotDisposed();
        const _theme = _registry.getTheme(name);
        if (!_theme) throw new ShikiError("Theme `".concat(name, "` not found, you may need to load it first"));
        return _theme;
    }
    function setTheme(name) {
        ensureNotDisposed();
        const theme = getTheme(name);
        if (_lastTheme !== name) {
            _registry.setTheme(theme);
            _lastTheme = name;
        }
        const colorMap = _registry.getColorMap();
        return {
            theme,
            colorMap
        };
    }
    function getLoadedThemes() {
        ensureNotDisposed();
        return _registry.getLoadedThemes();
    }
    function getLoadedLanguages() {
        ensureNotDisposed();
        return _registry.getLoadedLanguages();
    }
    function loadLanguageSync() {
        for(var _len = arguments.length, langs2 = new Array(_len), _key = 0; _key < _len; _key++){
            langs2[_key] = arguments[_key];
        }
        ensureNotDisposed();
        _registry.loadLanguages(langs2.flat(1));
    }
    async function loadLanguage() {
        for(var _len = arguments.length, langs2 = new Array(_len), _key = 0; _key < _len; _key++){
            langs2[_key] = arguments[_key];
        }
        return loadLanguageSync(await resolveLangs(langs2));
    }
    function loadThemeSync() {
        for(var _len = arguments.length, themes2 = new Array(_len), _key = 0; _key < _len; _key++){
            themes2[_key] = arguments[_key];
        }
        ensureNotDisposed();
        for (const theme of themes2.flat(1)){
            _registry.loadTheme(theme);
        }
    }
    async function loadTheme() {
        for(var _len = arguments.length, themes2 = new Array(_len), _key = 0; _key < _len; _key++){
            themes2[_key] = arguments[_key];
        }
        ensureNotDisposed();
        return loadThemeSync(await resolveThemes(themes2));
    }
    function ensureNotDisposed() {
        if (isDisposed) throw new ShikiError("Shiki instance has been disposed");
    }
    function dispose() {
        if (isDisposed) return;
        isDisposed = true;
        _registry.dispose();
        instancesCount -= 1;
    }
    return {
        setTheme,
        getTheme,
        getLanguage,
        getLoadedThemes,
        getLoadedLanguages,
        loadLanguage,
        loadLanguageSync,
        loadTheme,
        loadThemeSync,
        dispose,
        [Symbol.dispose]: dispose
    };
}
async function createShikiInternal(options) {
    if (!options.engine) {
        warnDeprecated("`engine` option is required. Use `createOnigurumaEngine` or `createJavaScriptRegexEngine` to create an engine.");
    }
    const [themes, langs, engine] = await Promise.all([
        resolveThemes(options.themes || []),
        resolveLangs(options.langs || []),
        options.engine
    ]);
    return createShikiInternalSync({
        ...options,
        themes,
        langs,
        engine
    });
}
async function createHighlighterCore(options) {
    const internal = await createShikiInternal(options);
    return {
        getLastGrammarState: function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return getLastGrammarState(internal, ...args);
        },
        codeToTokensBase: (code, options2)=>codeToTokensBase(internal, code, options2),
        codeToTokensWithThemes: (code, options2)=>codeToTokensWithThemes(internal, code, options2),
        codeToTokens: (code, options2)=>codeToTokens(internal, code, options2),
        codeToHast: (code, options2)=>codeToHast(internal, code, options2),
        codeToHtml: (code, options2)=>codeToHtml(internal, code, options2),
        getBundledLanguages: ()=>({}),
        getBundledThemes: ()=>({}),
        ...internal,
        getInternalContext: ()=>internal
    };
}
function createHighlighterCoreSync(options) {
    const internal = createShikiInternalSync(options);
    return {
        getLastGrammarState: function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return getLastGrammarState(internal, ...args);
        },
        codeToTokensBase: (code, options2)=>codeToTokensBase(internal, code, options2),
        codeToTokensWithThemes: (code, options2)=>codeToTokensWithThemes(internal, code, options2),
        codeToTokens: (code, options2)=>codeToTokens(internal, code, options2),
        codeToHast: (code, options2)=>codeToHast(internal, code, options2),
        codeToHtml: (code, options2)=>codeToHtml(internal, code, options2),
        getBundledLanguages: ()=>({}),
        getBundledThemes: ()=>({}),
        ...internal,
        getInternalContext: ()=>internal
    };
}
function makeSingletonHighlighterCore(createHighlighter) {
    let _shiki;
    async function getSingletonHighlighterCore2(options) {
        if (!_shiki) {
            _shiki = createHighlighter({
                ...options,
                themes: options.themes || [],
                langs: options.langs || []
            });
            return _shiki;
        } else {
            const s = await _shiki;
            await Promise.all([
                s.loadTheme(...options.themes || []),
                s.loadLanguage(...options.langs || [])
            ]);
            return s;
        }
    }
    return getSingletonHighlighterCore2;
}
const getSingletonHighlighterCore = /* @__PURE__ */ makeSingletonHighlighterCore(createHighlighterCore);
function createdBundledHighlighter(options) {
    const bundledLanguages = options.langs;
    const bundledThemes = options.themes;
    const engine = options.engine;
    async function createHighlighter(options2) {
        function resolveLang(lang) {
            if (typeof lang === "string") {
                var _options2_langAlias;
                if (isSpecialLang(lang)) return [];
                lang = ((_options2_langAlias = options2.langAlias) === null || _options2_langAlias === void 0 ? void 0 : _options2_langAlias[lang]) || lang;
                const bundle = bundledLanguages[lang];
                if (!bundle) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Language `".concat(lang, "` is not included in this bundle. You may want to load it from external source."));
                return bundle;
            }
            return lang;
        }
        function resolveTheme(theme) {
            if (isSpecialTheme(theme)) return "none";
            if (typeof theme === "string") {
                const bundle = bundledThemes[theme];
                if (!bundle) throw new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$types$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShikiError"]("Theme `".concat(theme, "` is not included in this bundle. You may want to load it from external source."));
                return bundle;
            }
            return theme;
        }
        var _options2_themes;
        const _themes = ((_options2_themes = options2.themes) !== null && _options2_themes !== void 0 ? _options2_themes : []).map((i)=>resolveTheme(i));
        var _options2_langs;
        const langs = ((_options2_langs = options2.langs) !== null && _options2_langs !== void 0 ? _options2_langs : []).map((i)=>resolveLang(i));
        var _options2_engine;
        const core = await createHighlighterCore({
            engine: (_options2_engine = options2.engine) !== null && _options2_engine !== void 0 ? _options2_engine : engine(),
            ...options2,
            themes: _themes,
            langs
        });
        return {
            ...core,
            loadLanguage () {
                for(var _len = arguments.length, langs2 = new Array(_len), _key = 0; _key < _len; _key++){
                    langs2[_key] = arguments[_key];
                }
                return core.loadLanguage(...langs2.map(resolveLang));
            },
            loadTheme () {
                for(var _len = arguments.length, themes = new Array(_len), _key = 0; _key < _len; _key++){
                    themes[_key] = arguments[_key];
                }
                return core.loadTheme(...themes.map(resolveTheme));
            },
            getBundledLanguages () {
                return bundledLanguages;
            },
            getBundledThemes () {
                return bundledThemes;
            }
        };
    }
    return createHighlighter;
}
function makeSingletonHighlighter(createHighlighter) {
    let _shiki;
    async function getSingletonHighlighter() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        if (!_shiki) {
            _shiki = createHighlighter({
                ...options,
                themes: [],
                langs: []
            });
            const s = await _shiki;
            await Promise.all([
                s.loadTheme(...options.themes || []),
                s.loadLanguage(...options.langs || [])
            ]);
            return s;
        } else {
            const s = await _shiki;
            await Promise.all([
                s.loadTheme(...options.themes || []),
                s.loadLanguage(...options.langs || [])
            ]);
            return s;
        }
    }
    return getSingletonHighlighter;
}
function createSingletonShorthands(createHighlighter, config) {
    const getSingletonHighlighter = makeSingletonHighlighter(createHighlighter);
    async function get(code, options) {
        var _config_guessEmbeddedLanguages;
        const shiki = await getSingletonHighlighter({
            langs: [
                options.lang
            ],
            themes: "theme" in options ? [
                options.theme
            ] : Object.values(options.themes)
        });
        const langs = await (config === null || config === void 0 ? void 0 : (_config_guessEmbeddedLanguages = config.guessEmbeddedLanguages) === null || _config_guessEmbeddedLanguages === void 0 ? void 0 : _config_guessEmbeddedLanguages.call(config, code, options.lang, shiki));
        if (langs) {
            await shiki.loadLanguage(...langs);
        }
        return shiki;
    }
    return {
        getSingletonHighlighter (options) {
            return getSingletonHighlighter(options);
        },
        async codeToHtml (code, options) {
            const shiki = await get(code, options);
            return shiki.codeToHtml(code, options);
        },
        async codeToHast (code, options) {
            const shiki = await get(code, options);
            return shiki.codeToHast(code, options);
        },
        async codeToTokens (code, options) {
            const shiki = await get(code, options);
            return shiki.codeToTokens(code, options);
        },
        async codeToTokensBase (code, options) {
            const shiki = await get(code, options);
            return shiki.codeToTokensBase(code, options);
        },
        async codeToTokensWithThemes (code, options) {
            const shiki = await get(code, options);
            return shiki.codeToTokensWithThemes(code, options);
        },
        async getLastGrammarState (code, options) {
            const shiki = await getSingletonHighlighter({
                langs: [
                    options.lang
                ],
                themes: [
                    options.theme
                ]
            });
            return shiki.getLastGrammarState(code, options);
        }
    };
}
function createCssVariablesTheme() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const { name = "css-variables", variablePrefix = "--shiki-", fontStyle = true } = options;
    const variable = (name2)=>{
        var _options_variableDefaults;
        if ((_options_variableDefaults = options.variableDefaults) === null || _options_variableDefaults === void 0 ? void 0 : _options_variableDefaults[name2]) return "var(".concat(variablePrefix).concat(name2, ", ").concat(options.variableDefaults[name2], ")");
        return "var(".concat(variablePrefix).concat(name2, ")");
    };
    const theme = {
        name,
        type: "dark",
        colors: {
            "editor.foreground": variable("foreground"),
            "editor.background": variable("background"),
            "terminal.ansiBlack": variable("ansi-black"),
            "terminal.ansiRed": variable("ansi-red"),
            "terminal.ansiGreen": variable("ansi-green"),
            "terminal.ansiYellow": variable("ansi-yellow"),
            "terminal.ansiBlue": variable("ansi-blue"),
            "terminal.ansiMagenta": variable("ansi-magenta"),
            "terminal.ansiCyan": variable("ansi-cyan"),
            "terminal.ansiWhite": variable("ansi-white"),
            "terminal.ansiBrightBlack": variable("ansi-bright-black"),
            "terminal.ansiBrightRed": variable("ansi-bright-red"),
            "terminal.ansiBrightGreen": variable("ansi-bright-green"),
            "terminal.ansiBrightYellow": variable("ansi-bright-yellow"),
            "terminal.ansiBrightBlue": variable("ansi-bright-blue"),
            "terminal.ansiBrightMagenta": variable("ansi-bright-magenta"),
            "terminal.ansiBrightCyan": variable("ansi-bright-cyan"),
            "terminal.ansiBrightWhite": variable("ansi-bright-white")
        },
        tokenColors: [
            {
                scope: [
                    "keyword.operator.accessor",
                    "meta.group.braces.round.function.arguments",
                    "meta.template.expression",
                    "markup.fenced_code meta.embedded.block"
                ],
                settings: {
                    foreground: variable("foreground")
                }
            },
            {
                scope: "emphasis",
                settings: {
                    fontStyle: "italic"
                }
            },
            {
                scope: [
                    "strong",
                    "markup.heading.markdown",
                    "markup.bold.markdown"
                ],
                settings: {
                    fontStyle: "bold"
                }
            },
            {
                scope: [
                    "markup.italic.markdown"
                ],
                settings: {
                    fontStyle: "italic"
                }
            },
            {
                scope: "meta.link.inline.markdown",
                settings: {
                    fontStyle: "underline",
                    foreground: variable("token-link")
                }
            },
            {
                scope: [
                    "string",
                    "markup.fenced_code",
                    "markup.inline"
                ],
                settings: {
                    foreground: variable("token-string")
                }
            },
            {
                scope: [
                    "comment",
                    "string.quoted.docstring.multi"
                ],
                settings: {
                    foreground: variable("token-comment")
                }
            },
            {
                scope: [
                    "constant.numeric",
                    "constant.language",
                    "constant.other.placeholder",
                    "constant.character.format.placeholder",
                    "variable.language.this",
                    "variable.other.object",
                    "variable.other.class",
                    "variable.other.constant",
                    "meta.property-name",
                    "meta.property-value",
                    "support"
                ],
                settings: {
                    foreground: variable("token-constant")
                }
            },
            {
                scope: [
                    "keyword",
                    "storage.modifier",
                    "storage.type",
                    "storage.control.clojure",
                    "entity.name.function.clojure",
                    "entity.name.tag.yaml",
                    "support.function.node",
                    "support.type.property-name.json",
                    "punctuation.separator.key-value",
                    "punctuation.definition.template-expression"
                ],
                settings: {
                    foreground: variable("token-keyword")
                }
            },
            {
                scope: "variable.parameter.function",
                settings: {
                    foreground: variable("token-parameter")
                }
            },
            {
                scope: [
                    "support.function",
                    "entity.name.type",
                    "entity.other.inherited-class",
                    "meta.function-call",
                    "meta.instance.constructor",
                    "entity.other.attribute-name",
                    "entity.name.function",
                    "constant.keyword.clojure"
                ],
                settings: {
                    foreground: variable("token-function")
                }
            },
            {
                scope: [
                    "entity.name.tag",
                    "string.quoted",
                    "string.regexp",
                    "string.interpolated",
                    "string.template",
                    "string.unquoted.plain.out.yaml",
                    "keyword.other.template"
                ],
                settings: {
                    foreground: variable("token-string-expression")
                }
            },
            {
                scope: [
                    "punctuation.definition.arguments",
                    "punctuation.definition.dict",
                    "punctuation.separator",
                    "meta.function-call.arguments"
                ],
                settings: {
                    foreground: variable("token-punctuation")
                }
            },
            {
                // [Custom] Markdown links
                scope: [
                    "markup.underline.link",
                    "punctuation.definition.metadata.markdown"
                ],
                settings: {
                    foreground: variable("token-link")
                }
            },
            {
                // [Custom] Markdown list
                scope: [
                    "beginning.punctuation.definition.list.markdown"
                ],
                settings: {
                    foreground: variable("token-string")
                }
            },
            {
                // [Custom] Markdown punctuation definition brackets
                scope: [
                    "punctuation.definition.string.begin.markdown",
                    "punctuation.definition.string.end.markdown",
                    "string.other.link.title.markdown",
                    "string.other.link.description.markdown"
                ],
                settings: {
                    foreground: variable("token-keyword")
                }
            },
            {
                // [Custom] Diff
                scope: [
                    "markup.inserted",
                    "meta.diff.header.to-file",
                    "punctuation.definition.inserted"
                ],
                settings: {
                    foreground: variable("token-inserted")
                }
            },
            {
                scope: [
                    "markup.deleted",
                    "meta.diff.header.from-file",
                    "punctuation.definition.deleted"
                ],
                settings: {
                    foreground: variable("token-deleted")
                }
            },
            {
                scope: [
                    "markup.changed",
                    "punctuation.definition.changed"
                ],
                settings: {
                    foreground: variable("token-changed")
                }
            }
        ]
    };
    if (!fontStyle) {
        var _theme_tokenColors;
        theme.tokenColors = (_theme_tokenColors = theme.tokenColors) === null || _theme_tokenColors === void 0 ? void 0 : _theme_tokenColors.map((tokenColor)=>{
            var _tokenColor_settings;
            if ((_tokenColor_settings = tokenColor.settings) === null || _tokenColor_settings === void 0 ? void 0 : _tokenColor_settings.fontStyle) delete tokenColor.settings.fontStyle;
            return tokenColor;
        });
    }
    return theme;
}
;
}),
"[project]/docgen/doc-gen-ui/node_modules/@shikijs/engine-oniguruma/dist/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createOnigurumaEngine",
    ()=>createOnigurumaEngine,
    "getDefaultWasmLoader",
    ()=>getDefaultWasmLoader,
    "loadWasm",
    ()=>loadWasm,
    "setDefaultWasmLoader",
    ()=>setDefaultWasmLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)");
class ShikiError extends Error {
    constructor(message){
        super(message);
        this.name = "ShikiError";
    }
}
function getHeapMax() {
    return 2147483648;
}
function _emscripten_get_now() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}
const alignUp = (x, multiple)=>x + (multiple - x % multiple) % multiple;
async function main(init) {
    let wasmMemory;
    let buffer;
    const binding = {};
    function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        binding.HEAPU8 = new Uint8Array(buf);
        binding.HEAPU32 = new Uint32Array(buf);
    }
    function _emscripten_memcpy_big(dest, src, num) {
        binding.HEAPU8.copyWithin(dest, src, src + num);
    }
    function emscripten_realloc_buffer(size) {
        try {
            wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
            updateGlobalBufferAndViews(wasmMemory.buffer);
            return 1;
        } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
        const oldSize = binding.HEAPU8.length;
        requestedSize = requestedSize >>> 0;
        const maxHeapSize = getHeapMax();
        if (requestedSize > maxHeapSize) return false;
        for(let cutDown = 1; cutDown <= 4; cutDown *= 2){
            let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            const newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            const replacement = emscripten_realloc_buffer(newSize);
            if (replacement) return true;
        }
        return false;
    }
    const UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
    function UTF8ArrayToString(heapOrArray, idx) {
        let maxBytesToRead = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1024;
        const endIdx = idx + maxBytesToRead;
        let endPtr = idx;
        while(heapOrArray[endPtr] && !(endPtr >= endIdx))++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
            return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
        let str = "";
        while(idx < endPtr){
            let u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue;
            }
            const u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) === 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue;
            }
            const u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) === 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0);
            } else {
                const ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
        }
        return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(binding.HEAPU8, ptr, maxBytesToRead) : "";
    }
    const asmLibraryArg = {
        emscripten_get_now: _emscripten_get_now,
        emscripten_memcpy_big: _emscripten_memcpy_big,
        emscripten_resize_heap: _emscripten_resize_heap,
        fd_write: ()=>0
    };
    async function createWasm() {
        const info = {
            env: asmLibraryArg,
            wasi_snapshot_preview1: asmLibraryArg
        };
        const exports = await init(info);
        wasmMemory = exports.memory;
        updateGlobalBufferAndViews(wasmMemory.buffer);
        Object.assign(binding, exports);
        binding.UTF8ToString = UTF8ToString;
    }
    await createWasm();
    return binding;
}
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value)=>key in obj ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    }) : obj[key] = value;
var __publicField = (obj, key, value)=>__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
let onigBinding = null;
function throwLastOnigError(onigBinding2) {
    throw new ShikiError(onigBinding2.UTF8ToString(onigBinding2.getLastOnigError()));
}
class UtfString {
    static _utf8ByteLength(str) {
        let result = 0;
        for(let i = 0, len = str.length; i < len; i++){
            const charCode = str.charCodeAt(i);
            let codepoint = charCode;
            let wasSurrogatePair = false;
            if (charCode >= 55296 && charCode <= 56319) {
                if (i + 1 < len) {
                    const nextCharCode = str.charCodeAt(i + 1);
                    if (nextCharCode >= 56320 && nextCharCode <= 57343) {
                        codepoint = (charCode - 55296 << 10) + 65536 | nextCharCode - 56320;
                        wasSurrogatePair = true;
                    }
                }
            }
            if (codepoint <= 127) result += 1;
            else if (codepoint <= 2047) result += 2;
            else if (codepoint <= 65535) result += 3;
            else result += 4;
            if (wasSurrogatePair) i++;
        }
        return result;
    }
    createString(onigBinding2) {
        const result = onigBinding2.omalloc(this.utf8Length);
        onigBinding2.HEAPU8.set(this.utf8Value, result);
        return result;
    }
    constructor(str){
        __publicField(this, "utf16Length");
        __publicField(this, "utf8Length");
        __publicField(this, "utf16Value");
        __publicField(this, "utf8Value");
        __publicField(this, "utf16OffsetToUtf8");
        __publicField(this, "utf8OffsetToUtf16");
        const utf16Length = str.length;
        const utf8Length = UtfString._utf8ByteLength(str);
        const computeIndicesMapping = utf8Length !== utf16Length;
        const utf16OffsetToUtf8 = computeIndicesMapping ? new Uint32Array(utf16Length + 1) : null;
        if (computeIndicesMapping) utf16OffsetToUtf8[utf16Length] = utf8Length;
        const utf8OffsetToUtf16 = computeIndicesMapping ? new Uint32Array(utf8Length + 1) : null;
        if (computeIndicesMapping) utf8OffsetToUtf16[utf8Length] = utf16Length;
        const utf8Value = new Uint8Array(utf8Length);
        let i8 = 0;
        for(let i16 = 0; i16 < utf16Length; i16++){
            const charCode = str.charCodeAt(i16);
            let codePoint = charCode;
            let wasSurrogatePair = false;
            if (charCode >= 55296 && charCode <= 56319) {
                if (i16 + 1 < utf16Length) {
                    const nextCharCode = str.charCodeAt(i16 + 1);
                    if (nextCharCode >= 56320 && nextCharCode <= 57343) {
                        codePoint = (charCode - 55296 << 10) + 65536 | nextCharCode - 56320;
                        wasSurrogatePair = true;
                    }
                }
            }
            if (computeIndicesMapping) {
                utf16OffsetToUtf8[i16] = i8;
                if (wasSurrogatePair) utf16OffsetToUtf8[i16 + 1] = i8;
                if (codePoint <= 127) {
                    utf8OffsetToUtf16[i8 + 0] = i16;
                } else if (codePoint <= 2047) {
                    utf8OffsetToUtf16[i8 + 0] = i16;
                    utf8OffsetToUtf16[i8 + 1] = i16;
                } else if (codePoint <= 65535) {
                    utf8OffsetToUtf16[i8 + 0] = i16;
                    utf8OffsetToUtf16[i8 + 1] = i16;
                    utf8OffsetToUtf16[i8 + 2] = i16;
                } else {
                    utf8OffsetToUtf16[i8 + 0] = i16;
                    utf8OffsetToUtf16[i8 + 1] = i16;
                    utf8OffsetToUtf16[i8 + 2] = i16;
                    utf8OffsetToUtf16[i8 + 3] = i16;
                }
            }
            if (codePoint <= 127) {
                utf8Value[i8++] = codePoint;
            } else if (codePoint <= 2047) {
                utf8Value[i8++] = 192 | (codePoint & 1984) >>> 6;
                utf8Value[i8++] = 128 | (codePoint & 63) >>> 0;
            } else if (codePoint <= 65535) {
                utf8Value[i8++] = 224 | (codePoint & 61440) >>> 12;
                utf8Value[i8++] = 128 | (codePoint & 4032) >>> 6;
                utf8Value[i8++] = 128 | (codePoint & 63) >>> 0;
            } else {
                utf8Value[i8++] = 240 | (codePoint & 1835008) >>> 18;
                utf8Value[i8++] = 128 | (codePoint & 258048) >>> 12;
                utf8Value[i8++] = 128 | (codePoint & 4032) >>> 6;
                utf8Value[i8++] = 128 | (codePoint & 63) >>> 0;
            }
            if (wasSurrogatePair) i16++;
        }
        this.utf16Length = utf16Length;
        this.utf8Length = utf8Length;
        this.utf16Value = str;
        this.utf8Value = utf8Value;
        this.utf16OffsetToUtf8 = utf16OffsetToUtf8;
        this.utf8OffsetToUtf16 = utf8OffsetToUtf16;
    }
}
const _OnigString = class _OnigString {
    convertUtf8OffsetToUtf16(utf8Offset) {
        if (this.utf8OffsetToUtf16) {
            if (utf8Offset < 0) return 0;
            if (utf8Offset > this.utf8Length) return this.utf16Length;
            return this.utf8OffsetToUtf16[utf8Offset];
        }
        return utf8Offset;
    }
    convertUtf16OffsetToUtf8(utf16Offset) {
        if (this.utf16OffsetToUtf8) {
            if (utf16Offset < 0) return 0;
            if (utf16Offset > this.utf16Length) return this.utf8Length;
            return this.utf16OffsetToUtf8[utf16Offset];
        }
        return utf16Offset;
    }
    dispose() {
        if (this.ptr === _OnigString._sharedPtr) _OnigString._sharedPtrInUse = false;
        else this._onigBinding.ofree(this.ptr);
    }
    constructor(str){
        __publicField(this, "id", ++_OnigString.LAST_ID);
        __publicField(this, "_onigBinding");
        __publicField(this, "content");
        __publicField(this, "utf16Length");
        __publicField(this, "utf8Length");
        __publicField(this, "utf16OffsetToUtf8");
        __publicField(this, "utf8OffsetToUtf16");
        __publicField(this, "ptr");
        if (!onigBinding) throw new ShikiError("Must invoke loadWasm first.");
        this._onigBinding = onigBinding;
        this.content = str;
        const utfString = new UtfString(str);
        this.utf16Length = utfString.utf16Length;
        this.utf8Length = utfString.utf8Length;
        this.utf16OffsetToUtf8 = utfString.utf16OffsetToUtf8;
        this.utf8OffsetToUtf16 = utfString.utf8OffsetToUtf16;
        if (this.utf8Length < 1e4 && !_OnigString._sharedPtrInUse) {
            if (!_OnigString._sharedPtr) _OnigString._sharedPtr = onigBinding.omalloc(1e4);
            _OnigString._sharedPtrInUse = true;
            onigBinding.HEAPU8.set(utfString.utf8Value, _OnigString._sharedPtr);
            this.ptr = _OnigString._sharedPtr;
        } else {
            this.ptr = utfString.createString(onigBinding);
        }
    }
};
__publicField(_OnigString, "LAST_ID", 0);
__publicField(_OnigString, "_sharedPtr", 0);
// a pointer to a string of 10000 bytes
__publicField(_OnigString, "_sharedPtrInUse", false);
let OnigString = _OnigString;
class OnigScanner {
    dispose() {
        this._onigBinding.freeOnigScanner(this._ptr);
    }
    findNextMatchSync(string, startPosition, arg) {
        let options = 0 /* None */ ;
        if (typeof arg === "number") {
            options = arg;
        }
        if (typeof string === "string") {
            string = new OnigString(string);
            const result = this._findNextMatchSync(string, startPosition, false, options);
            string.dispose();
            return result;
        }
        return this._findNextMatchSync(string, startPosition, false, options);
    }
    _findNextMatchSync(string, startPosition, debugCall, options) {
        const onigBinding2 = this._onigBinding;
        const resultPtr = onigBinding2.findNextOnigScannerMatch(this._ptr, string.id, string.ptr, string.utf8Length, string.convertUtf16OffsetToUtf8(startPosition), options);
        if (resultPtr === 0) {
            return null;
        }
        const HEAPU32 = onigBinding2.HEAPU32;
        let offset = resultPtr / 4;
        const index = HEAPU32[offset++];
        const count = HEAPU32[offset++];
        const captureIndices = [];
        for(let i = 0; i < count; i++){
            const beg = string.convertUtf8OffsetToUtf16(HEAPU32[offset++]);
            const end = string.convertUtf8OffsetToUtf16(HEAPU32[offset++]);
            captureIndices[i] = {
                start: beg,
                end,
                length: end - beg
            };
        }
        return {
            index,
            captureIndices
        };
    }
    constructor(patterns){
        __publicField(this, "_onigBinding");
        __publicField(this, "_ptr");
        if (!onigBinding) throw new ShikiError("Must invoke loadWasm first.");
        const strPtrsArr = [];
        const strLenArr = [];
        for(let i = 0, len = patterns.length; i < len; i++){
            const utfString = new UtfString(patterns[i]);
            strPtrsArr[i] = utfString.createString(onigBinding);
            strLenArr[i] = utfString.utf8Length;
        }
        const strPtrsPtr = onigBinding.omalloc(4 * patterns.length);
        onigBinding.HEAPU32.set(strPtrsArr, strPtrsPtr / 4);
        const strLenPtr = onigBinding.omalloc(4 * patterns.length);
        onigBinding.HEAPU32.set(strLenArr, strLenPtr / 4);
        const scannerPtr = onigBinding.createOnigScanner(strPtrsPtr, strLenPtr, patterns.length);
        for(let i = 0, len = patterns.length; i < len; i++)onigBinding.ofree(strPtrsArr[i]);
        onigBinding.ofree(strLenPtr);
        onigBinding.ofree(strPtrsPtr);
        if (scannerPtr === 0) throwLastOnigError(onigBinding);
        this._onigBinding = onigBinding;
        this._ptr = scannerPtr;
    }
}
function isInstantiatorOptionsObject(dataOrOptions) {
    return typeof dataOrOptions.instantiator === "function";
}
function isInstantiatorModule(dataOrOptions) {
    return typeof dataOrOptions.default === "function";
}
function isDataOptionsObject(dataOrOptions) {
    return typeof dataOrOptions.data !== "undefined";
}
function isResponse(dataOrOptions) {
    return typeof Response !== "undefined" && dataOrOptions instanceof Response;
}
function isArrayBuffer(data) {
    var _Buffer_isBuffer, _Buffer;
    return typeof ArrayBuffer !== "undefined" && (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) || typeof __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"] !== "undefined" && ((_Buffer_isBuffer = (_Buffer = __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"]).isBuffer) === null || _Buffer_isBuffer === void 0 ? void 0 : _Buffer_isBuffer.call(_Buffer, data)) || typeof SharedArrayBuffer !== "undefined" && data instanceof SharedArrayBuffer || typeof Uint32Array !== "undefined" && data instanceof Uint32Array;
}
let initPromise;
function loadWasm(options) {
    if (initPromise) return initPromise;
    async function _load() {
        onigBinding = await main(async (info)=>{
            let instance = options;
            instance = await instance;
            if (typeof instance === "function") instance = await instance(info);
            if (typeof instance === "function") instance = await instance(info);
            if (isInstantiatorOptionsObject(instance)) {
                instance = await instance.instantiator(info);
            } else if (isInstantiatorModule(instance)) {
                instance = await instance.default(info);
            } else {
                if (isDataOptionsObject(instance)) instance = instance.data;
                if (isResponse(instance)) {
                    if (typeof WebAssembly.instantiateStreaming === "function") instance = await _makeResponseStreamingLoader(instance)(info);
                    else instance = await _makeResponseNonStreamingLoader(instance)(info);
                } else if (isArrayBuffer(instance)) {
                    instance = await _makeArrayBufferLoader(instance)(info);
                } else if (instance instanceof WebAssembly.Module) {
                    instance = await _makeArrayBufferLoader(instance)(info);
                } else if ("default" in instance && instance.default instanceof WebAssembly.Module) {
                    instance = await _makeArrayBufferLoader(instance.default)(info);
                }
            }
            if ("instance" in instance) instance = instance.instance;
            if ("exports" in instance) instance = instance.exports;
            return instance;
        });
    }
    initPromise = _load();
    return initPromise;
}
function _makeArrayBufferLoader(data) {
    return (importObject)=>WebAssembly.instantiate(data, importObject);
}
function _makeResponseStreamingLoader(data) {
    return (importObject)=>WebAssembly.instantiateStreaming(data, importObject);
}
function _makeResponseNonStreamingLoader(data) {
    return async (importObject)=>{
        const arrayBuffer = await data.arrayBuffer();
        return WebAssembly.instantiate(arrayBuffer, importObject);
    };
}
let _defaultWasmLoader;
function setDefaultWasmLoader(_loader) {
    _defaultWasmLoader = _loader;
}
function getDefaultWasmLoader() {
    return _defaultWasmLoader;
}
async function createOnigurumaEngine(options) {
    if (options) await loadWasm(options);
    return {
        createScanner (patterns) {
            return new OnigScanner(patterns.map((p)=>typeof p === "string" ? p : p.source));
        },
        createString (s) {
            return new OnigString(s);
        }
    };
}
;
}),
"[project]/docgen/doc-gen-ui/node_modules/@shikijs/engine-javascript/dist/shared/engine-javascript.hzpS1_41.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "J",
    ()=>JavaScriptScanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
const MAX = 4294967295;
class JavaScriptScanner {
    findNextMatchSync(string, startPosition, _options) {
        const str = typeof string === "string" ? string : string.content;
        const pending = [];
        function toResult(index, match) {
            let offset = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
            return {
                index,
                captureIndices: match.indices.map((indice)=>{
                    if (indice == null) {
                        return {
                            start: MAX,
                            end: MAX,
                            length: 0
                        };
                    }
                    return {
                        start: indice[0] + offset,
                        end: indice[1] + offset,
                        length: indice[1] - indice[0]
                    };
                })
            };
        }
        for(let i = 0; i < this.regexps.length; i++){
            const regexp = this.regexps[i];
            if (!regexp) continue;
            try {
                regexp.lastIndex = startPosition;
                const match = regexp.exec(str);
                if (!match) continue;
                if (match.index === startPosition) {
                    return toResult(i, match, 0);
                }
                pending.push([
                    i,
                    match,
                    0
                ]);
            } catch (e) {
                if (this.options.forgiving) continue;
                throw e;
            }
        }
        if (pending.length) {
            const minIndex = Math.min(...pending.map((m)=>m[1].index));
            for (const [i, match, offset] of pending){
                if (match.index === minIndex) {
                    return toResult(i, match, offset);
                }
            }
        }
        return null;
    }
    constructor(patterns, options = {}){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "regexps", void 0);
        this.patterns = patterns;
        this.options = options;
        const { forgiving = false, cache, regexConstructor } = options;
        if (!regexConstructor) {
            throw new Error("Option `regexConstructor` is not provided");
        }
        this.regexps = patterns.map((p)=>{
            if (typeof p !== "string") {
                return p;
            }
            const cached = cache === null || cache === void 0 ? void 0 : cache.get(p);
            if (cached) {
                if (cached instanceof RegExp) {
                    return cached;
                }
                if (forgiving) return null;
                throw cached;
            }
            try {
                const regex = regexConstructor(p);
                cache === null || cache === void 0 ? void 0 : cache.set(p, regex);
                return regex;
            } catch (e) {
                cache === null || cache === void 0 ? void 0 : cache.set(p, e);
                if (forgiving) return null;
                throw e;
            }
        });
    }
}
;
}),
"[project]/docgen/doc-gen-ui/node_modules/@shikijs/engine-javascript/dist/engine-compile.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createJavaScriptRegexEngine",
    ()=>createJavaScriptRegexEngine,
    "defaultJavaScriptRegexConstructor",
    ()=>defaultJavaScriptRegexConstructor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$oniguruma$2d$to$2d$es$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/oniguruma-to-es/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$engine$2d$javascript$2f$dist$2f$shared$2f$engine$2d$javascript$2e$hzpS1_41$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/docgen/doc-gen-ui/node_modules/@shikijs/engine-javascript/dist/shared/engine-javascript.hzpS1_41.mjs [app-client] (ecmascript)");
;
;
function defaultJavaScriptRegexConstructor(pattern, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f$oniguruma$2d$to$2d$es$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toRegExp"])(pattern, {
        global: true,
        hasIndices: true,
        // This has no benefit for the standard JS engine, but it avoids a perf penalty for
        // precompiled grammars when constructing extremely long patterns that aren't always used
        lazyCompileLength: 3e3,
        rules: {
            // Needed since TextMate grammars merge backrefs across patterns
            allowOrphanBackrefs: true,
            // Improves search performance for generated regexes
            asciiWordBoundaries: true,
            // Follow `vscode-oniguruma` which enables this Oniguruma option by default
            captureGroup: true,
            // Oniguruma uses depth limit `20`; lowered here to keep regexes shorter and maybe
            // sometimes faster, but can be increased if issues reported due to low limit
            recursionLimit: 5,
            // Oniguruma option for `^`->`\A`, `$`->`\Z`; improves search performance without any
            // change in meaning since TM grammars search line by line
            singleline: true
        },
        ...options
    });
}
function createJavaScriptRegexEngine() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var _options;
    const _options1 = Object.assign({
        target: "auto",
        cache: /* @__PURE__ */ new Map()
    }, options);
    (_options = _options1).regexConstructor || (_options.regexConstructor = (pattern)=>defaultJavaScriptRegexConstructor(pattern, {
            target: _options1.target
        }));
    return {
        createScanner (patterns) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$docgen$2f$doc$2d$gen$2d$ui$2f$node_modules$2f40$shikijs$2f$engine$2d$javascript$2f$dist$2f$shared$2f$engine$2d$javascript$2e$hzpS1_41$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["J"](patterns, _options1);
        },
        createString (s) {
            return {
                content: s
            };
        }
    };
}
;
}),
]);

//# sourceMappingURL=703f0_%40shikijs_54156ac4._.js.map