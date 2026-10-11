/** Cascade layer order shared by Framework artifacts, previews, and Pattern exports. */
export const frameworkLayers = Object.freeze(["tokens", "elements", "utilities", "components"] as const);
export const patternLayers = Object.freeze([...frameworkLayers, "patterns"] as const);

export type CssLayerName = (typeof patternLayers)[number];

/** The `@layer` order statement that must precede layered rules. */
export const layerOrder = (layers: readonly CssLayerName[] = frameworkLayers) => `@layer ${layers.join(", ")};`;

/** Wrap CSS in one named cascade layer. */
export const cssLayer = (name: CssLayerName, css: string) => `@layer ${name} {\n${css}\n}`;

/** Accept only Google Fonts css2 stylesheets; every other origin is dropped. */
export const safeFontStylesheet = (href: unknown) => {
  if (typeof href !== "string") return undefined;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "fonts.googleapis.com" && url.pathname === "/css2"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};

/** Font imports precede style rules; importing inside a layer block is invalid CSS. */
export const fontImportRule = (href: string, layer?: CssLayerName) =>
  `@import url(${JSON.stringify(href)})${layer ? ` layer(${layer})` : ""};`;
