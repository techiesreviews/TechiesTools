import type { generate, parse, walk } from "css-tree";

/**
 * The CSS parser (css-tree, about 200 KB) loads on demand in the browser, so pages
 * that never parse CSS do not download it. Server renders and Node tests parse
 * while modules evaluate, so outside a browser it loads before any caller runs.
 *
 * Browser code awaits `loadCssTree()` before the first call that parses; `cssTree()`
 * throws until then instead of letting a caller's try/catch treat it as invalid CSS.
 */
export interface CssTreeApi {
  generate: typeof generate;
  parse: typeof parse;
  walk: typeof walk;
}

let api: CssTreeApi | undefined;
let loading: Promise<CssTreeApi> | undefined;

export const loadCssTree = (): Promise<CssTreeApi> =>
  loading ??= import("css-tree/dist/csstree.esm").then((module) => (api = module));

export const isCssTreeLoaded = () => api !== undefined;

/** For pages that parse while their modules evaluate: import `css-tree-eager.ts` first instead of waiting. */
export const provideCssTree = (module: CssTreeApi) => {
  api ??= module;
  loading ??= Promise.resolve(api);
};

export const cssTree = (): CssTreeApi => {
  if (!api) throw new Error("The CSS parser is not loaded yet; await loadCssTree() before parsing CSS in the browser.");
  return api;
};

if (typeof document === "undefined") await loadCssTree();
