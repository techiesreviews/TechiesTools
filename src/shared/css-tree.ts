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

export const createCssTreeLoader = (importer: () => Promise<CssTreeApi>) => {
  let api: CssTreeApi | undefined;
  let loading: Promise<CssTreeApi> | undefined;
  return {
    /** A failed download is tried again on the next call, which recovers from a dropped connection; after a deploy removed the file, only a reload helps. */
    load: (): Promise<CssTreeApi> => loading ??= importer().then(
      (module) => (api = module),
      (error: unknown) => {
        loading = undefined;
        throw error;
      },
    ),
    loaded: () => api !== undefined,
    get: (): CssTreeApi => {
      if (!api) throw new Error("The CSS parser is not loaded yet; await loadCssTree() before parsing CSS in the browser.");
      return api;
    },
    provide: (module: CssTreeApi) => {
      api ??= module;
      loading ??= Promise.resolve(api);
    },
  };
};

const loader = createCssTreeLoader(() => import("css-tree/dist/csstree.esm"));

export const loadCssTree = loader.load;
export const isCssTreeLoaded = loader.loaded;
export const cssTree = loader.get;
/** For pages that parse while their modules evaluate: import `css-tree-eager.ts` first instead of waiting. */
export const provideCssTree = loader.provide;

if (typeof document === "undefined") await loadCssTree();
