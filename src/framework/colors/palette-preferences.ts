import {
  frameworkColorSlug,
  frameworkHexToOklch,
  frameworkOklchToHex,
  frameworkScaleFor,
  parseFrameworkHex,
  resolveFrameworkColorConvention,
} from "./palette-generation.ts";

export const FRAMEWORK_UI_DIFF_STORAGE_KEY = "techies-tools:framework:ui-diffs:v1";
export const FRAMEWORK_LEGACY_STORAGE_KEY = "techies-tools:framework:v1";

export type FrameworkPaletteColor = Readonly<{
  name: string;
  variable: string;
  value: string;
}>;

type PaletteStorage = Pick<Storage, "getItem">;

type StoredPalette = {
  version?: unknown;
  controls?: unknown;
  colors?: unknown;
};

type StoredColor = Readonly<{ name: string; value: string }>;

const defaultColors: readonly StoredColor[] = [{ name: "Primary", value: "#2563EB" }];
const shadeDefinitions = [
  { label: "Lightest", suffix: "-lightest", scaleIndex: 0 },
  { label: "Lighter", suffix: "-lighter", scaleIndex: 1 },
  { label: "Light", suffix: "-light", scaleIndex: 2 },
  { label: "Base", suffix: "", scaleIndex: 3 },
  { label: "Dark", suffix: "-dark", scaleIndex: 4 },
  { label: "Darker", suffix: "-darker", scaleIndex: 5 },
  { label: "Darkest", suffix: "-darkest", scaleIndex: 6 },
] as const;

const controlsFrom = (value: unknown): Readonly<Record<string, unknown>> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

const controlValue = (controls: Readonly<Record<string, unknown>>, name: string, fallback: string) => {
  const value = controls[name];
  return typeof value === "string" && value ? value : fallback;
};

const parseStoredColors = (value: unknown): readonly StoredColor[] => {
  if (!Array.isArray(value)) return defaultColors;
  const colors = value.flatMap((candidate): StoredColor[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const { name, hex } = candidate as { name?: unknown; hex?: unknown };
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedValue = parseFrameworkHex(hex);
    return normalizedName && normalizedValue ? [{ name: normalizedName, value: normalizedValue }] : [];
  });
  return colors.length ? colors : defaultColors;
};

const generatedPalette = (stored: StoredPalette): readonly FrameworkPaletteColor[] => {
  const colors = parseStoredColors(stored.colors);
  const controls = controlsFrom(stored.controls);
  const { convention } = resolveFrameworkColorConvention({
    requested: controlValue(controls, "data-color-convention", "color"),
    colorNames: colors.map((color) => color.name),
    typeName: controlValue(controls, "data-type-name", "text"),
    radiusName: controlValue(controls, "data-radius-name", "radius"),
    spacingName: controlValue(controls, "data-spacing-name", "space"),
  });
  return colors.flatMap((color) => {
    const variable = `--${convention}-${frameworkColorSlug(color.name)}`;
    const baseValue = frameworkHexToOklch(color.value);
    const scale = frameworkScaleFor(baseValue);
    return shadeDefinitions.map(({ label, suffix, scaleIndex }) => ({
      name: `${color.name} / ${label}`,
      variable: `${variable}${suffix}`,
      value: frameworkOklchToHex(label === "Base" ? baseValue : scale[scaleIndex]),
    }));
  });
};

const defaultPalette = generatedPalette({ version: 1, colors: defaultColors.map(({ name, value }) => ({ name, hex: value })) });

export const parseFrameworkPaletteColors = (source: string | null): readonly FrameworkPaletteColor[] => {
  if (!source) return defaultPalette;
  try {
    const parsed = JSON.parse(source) as StoredPalette | null;
    if (!parsed || parsed.version !== 1) return defaultPalette;
    return generatedPalette(parsed);
  } catch {
    return defaultPalette;
  }
};

export const loadFrameworkPaletteColors = (storage: PaletteStorage): readonly FrameworkPaletteColor[] => {
  try {
    const source = storage.getItem(FRAMEWORK_UI_DIFF_STORAGE_KEY)
      ?? storage.getItem(FRAMEWORK_LEGACY_STORAGE_KEY);
    return parseFrameworkPaletteColors(source);
  } catch {
    return defaultPalette;
  }
};
