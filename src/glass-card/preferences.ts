import {
  defaultGlassCardSettings,
  sanitizeGlassCardSettings,
  type GlassCardSettings,
} from "./model.ts";

export const GLASS_CARD_STORAGE_KEY = "techies-tools:glass-card:v1";

interface StoredGlassCardSettings {
  version: 1;
  settings: GlassCardSettings;
}

export const serializeGlassCardSettings = (input: Partial<GlassCardSettings>) =>
  JSON.stringify({ version: 1, settings: sanitizeGlassCardSettings(input) } satisfies StoredGlassCardSettings);

export const parseStoredGlassCardSettings = (source: string | null): GlassCardSettings => {
  if (!source) return { ...defaultGlassCardSettings };
  try {
    const parsed = JSON.parse(source) as Partial<StoredGlassCardSettings>;
    if (parsed.version !== 1 || !parsed.settings || typeof parsed.settings !== "object") {
      return { ...defaultGlassCardSettings };
    }
    return sanitizeGlassCardSettings(parsed.settings);
  } catch {
    return { ...defaultGlassCardSettings };
  }
};
