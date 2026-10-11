import { frameworkOklchToHex } from "./palette-generation.ts";
import { mergeSettingsState } from "../primitives/settings-state.ts";
import { settingsPalette } from "../primitives/snapshot.ts";
import { starterSettings } from "../primitives/starter-settings.ts";

export const FRAMEWORK_UI_DIFF_STORAGE_KEY = "techies-tools:framework:ui-diffs:v1";
export const FRAMEWORK_LEGACY_STORAGE_KEY = "techies-tools:framework:v1";

export type FrameworkPaletteColor = Readonly<{
  name: string;
  variable: string;
  value: string;
}>;

type PaletteStorage = Pick<Storage, "getItem">;

const shadeDefinitions = [
  { label: "Lightest", suffix: "-lightest", scaleIndex: 0 },
  { label: "Lighter", suffix: "-lighter", scaleIndex: 1 },
  { label: "Light", suffix: "-light", scaleIndex: 2 },
  { label: "Base", suffix: "", scaleIndex: 3 },
  { label: "Dark", suffix: "-dark", scaleIndex: 4 },
  { label: "Darker", suffix: "-darker", scaleIndex: 5 },
  { label: "Darkest", suffix: "-darkest", scaleIndex: 6 },
] as const;

const objectOrEmpty = (value: unknown): Record<string, string | boolean> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string | boolean> : {};

/** The same palette the Framework settings bar publishes, read from stored settings. */
const generatedPalette = (stored: { controls?: unknown; colors?: unknown }): readonly FrameworkPaletteColor[] => {
  const state = mergeSettingsState(starterSettings, {
    version: 1,
    controls: objectOrEmpty(stored.controls),
    ...(Array.isArray(stored.colors) ? { colors: stored.colors } : {}),
  });
  return settingsPalette(state).colors.flatMap((color) => shadeDefinitions.map(({ label, suffix, scaleIndex }) => ({
    name: `${color.name} / ${label}`,
    variable: `${color.variable}${suffix}`,
    value: frameworkOklchToHex(label === "Base" ? color.value : color.scale[scaleIndex]),
  })));
};

const defaultPalette = generatedPalette({});

export const parseFrameworkPaletteColors = (source: string | null): readonly FrameworkPaletteColor[] => {
  if (!source) return defaultPalette;
  try {
    const parsed = JSON.parse(source) as { version?: unknown; controls?: unknown; colors?: unknown } | null;
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
