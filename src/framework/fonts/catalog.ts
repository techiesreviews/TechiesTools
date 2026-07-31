import { isSafeFontFamilyName } from "./family.ts";
import { FONT_PREVIEW_TEXT } from "./preview.ts";

export type GoogleFontCategory = "serif" | "sans-serif" | "monospace" | "display" | "handwriting";
export type GoogleFontRole = "body" | "heading" | "code";
export type GoogleFontCatalogItem = {
  family: string;
  category: GoogleFontCategory;
  variants: readonly string[];
  axes?: readonly { tag: string; start: number; end: number }[];
  lastModified?: string;
  featured: "popular" | "recent" | "fallback";
};
export type GoogleFontPickerOption = {
  value: string;
  label: string;
  meta: string;
  preview: string;
  previewType: "type";
  previewWeights: readonly number[];
  category: GoogleFontCategory;
};
export type GoogleFontCatalogResult = {
  source: "google" | "fallback";
  items: readonly GoogleFontCatalogItem[];
};

const fullWeights = ["100", "200", "300", "regular", "500", "600", "700", "800", "900"] as const;
const codeWeights = ["regular", "500", "600", "700"] as const;
const font = (
  family: string,
  category: GoogleFontCategory,
  variants: readonly string[] = fullWeights,
): GoogleFontCatalogItem => ({ family, category, variants, featured: "fallback" });

export const fallbackGoogleFontCatalog = Object.freeze([
  font("Inter", "sans-serif"),
  font("Geist", "sans-serif"),
  font("Roboto", "sans-serif"),
  font("Open Sans", "sans-serif", ["300", "regular", "500", "600", "700", "800"]),
  font("Source Sans 3", "sans-serif"),
  font("Montserrat", "sans-serif"),
  font("Poppins", "sans-serif"),
  font("Nunito Sans", "sans-serif"),
  font("Work Sans", "sans-serif"),
  font("Manrope", "sans-serif", ["200", "300", "regular", "500", "600", "700", "800"]),
  font("DM Sans", "sans-serif"),
  font("Figtree", "sans-serif", ["300", "regular", "500", "600", "700", "800", "900"]),
  font("Outfit", "sans-serif"),
  font("Urbanist", "sans-serif"),
  font("Plus Jakarta Sans", "sans-serif", ["200", "300", "regular", "500", "600", "700", "800"]),
  font("Red Hat Display", "sans-serif", ["300", "regular", "500", "600", "700", "800", "900"]),
  font("Noto Sans", "sans-serif"),
  font("Albert Sans", "sans-serif"),
  font("Bricolage Grotesque", "sans-serif", ["200", "300", "regular", "500", "600", "700", "800"]),
  font("Lexend", "sans-serif"),
  font("Mulish", "sans-serif"),
  font("Raleway", "sans-serif"),
  font("Ubuntu Sans", "sans-serif", ["100", "200", "300", "regular", "500", "600", "700", "800"]),
  font("Rubik", "sans-serif", ["300", "regular", "500", "600", "700", "800", "900"]),
  font("Archivo", "sans-serif"),
  font("Roboto Slab", "serif"),
  font("Roboto Serif", "serif"),
  font("Noto Serif", "serif"),
  font("Playfair Display", "serif", ["regular", "500", "600", "700", "800", "900"]),
  font("Crimson Pro", "serif", ["200", "300", "regular", "500", "600", "700", "800", "900"]),
  font("Fraunces", "serif"),
  font("Roboto Mono", "monospace", ["100", "200", "300", ...codeWeights]),
  font("Source Code Pro", "monospace", ["200", "300", ...codeWeights, "800", "900"]),
  font("IBM Plex Mono", "monospace", ["100", "200", "300", ...codeWeights]),
  font("Inconsolata", "monospace", ["200", "300", ...codeWeights, "800", "900"]),
  font("Fira Code", "monospace", ["300", ...codeWeights]),
  font("JetBrains Mono", "monospace", ["100", "200", "300", ...codeWeights, "800"]),
  font("Noto Sans Mono", "monospace"),
  font("Azeret Mono", "monospace"),
  font("Martian Mono", "monospace", ["100", "200", "300", ...codeWeights, "800"]),
  font("Geist Mono", "monospace"),
] satisfies readonly GoogleFontCatalogItem[]);

const requiredWeights: Record<GoogleFontRole, readonly number[]> = {
  body: [400, 500, 600, 700, 800],
  heading: [700, 800],
  code: [400, 500, 600, 700],
};
const previewWeights: Record<GoogleFontRole, readonly number[]> = {
  body: [400, 700],
  heading: [700],
  code: [400, 700],
};
const categories = new Set<GoogleFontCategory>(["serif", "sans-serif", "monospace", "display", "handwriting"]);
const variantWeights = (fontItem: GoogleFontCatalogItem) => new Set(fontItem.variants.flatMap((variant) => {
  if (variant === "regular") return [400];
  const match = variant.match(/^(\d{3})(?:italic)?$/);
  return match ? [Number(match[1])] : [];
}));
const supportsWeights = (fontItem: GoogleFontCatalogItem, weights: readonly number[]) => {
  const weightAxis = fontItem.axes?.find((axis) => axis.tag === "wght");
  if (weightAxis && weights.every((weight) => weight >= weightAxis.start && weight <= weightAxis.end)) return true;
  const available = variantWeights(fontItem);
  return weights.every((weight) => available.has(weight));
};
export const fontOptionsForRole = (
  catalog: readonly GoogleFontCatalogItem[],
  role: GoogleFontRole,
): readonly GoogleFontPickerOption[] => catalog
  .filter((fontItem) => role === "code" ? fontItem.category === "monospace" : fontItem.category !== "monospace")
  .filter((fontItem) => supportsWeights(fontItem, requiredWeights[role]))
  .map((fontItem) => ({
    value: fontItem.family,
    label: fontItem.family,
    meta: FONT_PREVIEW_TEXT,
    preview: fontItem.family,
    previewType: "type",
    previewWeights: previewWeights[role],
    category: fontItem.category,
  }));

type GoogleApiFont = {
  family?: unknown;
  category?: unknown;
  variants?: unknown;
  axes?: unknown;
  lastModified?: unknown;
};
const normalizeGoogleFont = (
  item: GoogleApiFont,
  featured: "popular" | "recent",
): GoogleFontCatalogItem | undefined => {
  if (!isSafeFontFamilyName(item.family)) return undefined;
  const category = categories.has(item.category as GoogleFontCategory)
    ? item.category as GoogleFontCategory
    : "sans-serif";
  const variants = Array.isArray(item.variants) ? item.variants.filter((variant): variant is string => typeof variant === "string") : [];
  const axes = Array.isArray(item.axes)
    ? item.axes.flatMap((axis) => {
      if (!axis || typeof axis !== "object") return [];
      const candidate = axis as { tag?: unknown; start?: unknown; end?: unknown };
      return typeof candidate.tag === "string" && typeof candidate.start === "number" && typeof candidate.end === "number"
        ? [{ tag: candidate.tag, start: candidate.start, end: candidate.end }]
        : [];
    })
    : undefined;
  return {
    family: item.family,
    category,
    variants,
    ...(axes?.length ? { axes } : {}),
    ...(typeof item.lastModified === "string" ? { lastModified: item.lastModified } : {}),
    featured,
  };
};
const mergeCatalogs = (
  popular: readonly GoogleApiFont[],
  recent: readonly GoogleApiFont[],
): readonly GoogleFontCatalogItem[] => {
  const merged = new Map<string, GoogleFontCatalogItem>();
  for (const item of popular.slice(0, 200)) {
    const normalized = normalizeGoogleFont(item, "popular");
    if (normalized) merged.set(normalized.family, normalized);
  }
  for (const item of recent.slice(0, 100)) {
    const normalized = normalizeGoogleFont(item, "recent");
    if (normalized && !merged.has(normalized.family)) merged.set(normalized.family, normalized);
  }
  for (const item of fallbackGoogleFontCatalog) if (!merged.has(item.family)) merged.set(item.family, item);
  return [...merged.values()];
};

export const loadGoogleFontCatalog = async (
  apiKey: string,
  request: typeof fetch = fetch,
): Promise<GoogleFontCatalogResult> => {
  if (!apiKey) return { source: "fallback", items: fallbackGoogleFontCatalog };
  try {
    const endpoint = "https://www.googleapis.com/webfonts/v1/webfonts";
    const urls = ["popularity", "date"].map((sort) => `${endpoint}?sort=${sort}&capability=VF&key=${encodeURIComponent(apiKey)}`);
    const responses = await Promise.all(urls.map((url) => request(url)));
    if (responses.some((response) => !response.ok)) return { source: "fallback", items: fallbackGoogleFontCatalog };
    const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{ items?: GoogleApiFont[] }>));
    const items = mergeCatalogs(payloads[0].items ?? [], payloads[1].items ?? []);
    return items.length ? { source: "google", items } : { source: "fallback", items: fallbackGoogleFontCatalog };
  } catch {
    return { source: "fallback", items: fallbackGoogleFontCatalog };
  }
};
