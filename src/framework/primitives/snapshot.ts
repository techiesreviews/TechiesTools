import {
  frameworkColorSlug,
  frameworkHexToOklch,
  frameworkScaleFor,
  frameworkTokenSlug,
  parseFrameworkHex,
  resolveFrameworkColorConvention,
} from "../colors/palette-generation.ts";
import { buildSemanticColorOptions, reconcileSemanticColorSelection, type SemanticPaletteColor } from "../colors/semantic-options.ts";
import type { FrameworkSettingsState } from "./settings-state.ts";
import { radiusScale, spacingScale, type ScaleToken } from "./scales.ts";
import { starterSemanticRoles, starterSettings } from "./starter-settings.ts";

type ScaleSystem = "type" | "radius" | "spacing";

const text = (state: FrameworkSettingsState, attribute: string) => {
  const value = state.controls[attribute];
  return typeof value === "string" && value.trim() ? value : String(starterSettings.controls[attribute]);
};
const number = (state: FrameworkSettingsState, attribute: string) => {
  const value = Number(text(state, attribute));
  return Number.isFinite(value) ? value : Number(starterSettings.controls[attribute]);
};
const flag = (state: FrameworkSettingsState, attribute: string) => {
  const value = state.controls[attribute];
  return typeof value === "boolean" ? value : Boolean(starterSettings.controls[attribute]);
};

/** Shared fluid viewport in rem; max is always at least 1px above min. */
export const settingsViewport = (state: FrameworkSettingsState) => {
  const minPx = number(state, "data-fluid-min-width");
  const maxPx = Math.max(minPx + 1, number(state, "data-fluid-max-width"));
  return { minPx, maxPx, minWidth: minPx / 16, maxWidth: maxPx / 16 };
};

const mode = (state: FrameworkSettingsState, system: ScaleSystem) => state.modes[system] === "manual" ? "manual" : "automatic";

/** Manual tokens in rem, in stored order; missing or negative values become 0. */
const manualTokens = (state: FrameworkSettingsState, system: ScaleSystem): ScaleToken[] => {
  const prefix = `data-manual-${system}:`;
  const keys = Object.keys(starterSettings.manual).filter((key) => key.startsWith(prefix));
  return keys.map((key) => {
    const value = Number((Math.max(0, Number(state.manual[key] ?? starterSettings.manual[key]) || 0) / 16).toFixed(4));
    return { token: key.slice(prefix.length), min: value, max: value };
  });
};

/** The authored palette with generated scales, named by the resolved color convention. */
export const settingsPalette = (state: FrameworkSettingsState): { convention: string; hasCollision: boolean; colors: SemanticPaletteColor[] } => {
  // Stored colors are untrusted: drop malformed entries, and fall back to the starter palette when none remain.
  const valid = (Array.isArray(state.colors) ? state.colors : []).flatMap((color: unknown) => {
    if (!color || typeof color !== "object") return [];
    const { name, hex } = color as { name?: unknown; hex?: unknown };
    const parsed = parseFrameworkHex(hex);
    const trimmed = typeof name === "string" ? name.trim() : "";
    return parsed && trimmed ? [{ name: trimmed, hex: parsed }] : [];
  });
  const named = valid.length ? valid : starterSettings.colors;
  const { convention, hasCollision } = resolveFrameworkColorConvention({
    requested: text(state, "data-color-convention"),
    colorNames: named.map(({ name }) => name),
    typeName: text(state, "data-type-name"),
    radiusName: text(state, "data-radius-name"),
    spacingName: text(state, "data-spacing-name"),
  });
  const colors = named.map(({ name, hex }, index) => {
    const value = frameworkHexToOklch(hex);
    return { id: `palette-${index + 1}`, name, value, scale: frameworkScaleFor(value), variable: `--${convention}-${frameworkColorSlug(name)}` };
  });
  return { convention, hasCollision, colors };
};

/** Semantic convention; it must differ from the color convention. */
export const settingsSemanticConvention = (state: FrameworkSettingsState, colorConvention: string) => {
  const requested = frameworkTokenSlug(text(state, "data-semantic-convention"));
  const hasCollision = requested === colorConvention;
  return { convention: hasCollision ? `${requested}-semantic` : requested, hasCollision };
};

/**
 * The complete Primitive snapshot for one settings state. Pure: the settings bar publishes it,
 * and the Starter Defaults baseline is `primitiveSnapshotFromSettings(starterSettings)`.
 */
export const primitiveSnapshotFromSettings = (state: FrameworkSettingsState) => {
  const { minWidth, maxWidth } = settingsViewport(state);
  const viewportVariables = {
    "--fluid-min-viewport": `${minWidth}rem`,
    "--fluid-max-viewport": `${maxWidth}rem`,
    "--section-min-width": `${minWidth}rem`,
    "--section-max-width": `${maxWidth}rem`,
  };

  const palette = settingsPalette(state);
  const options = buildSemanticColorOptions(palette.colors);
  const semanticConvention = settingsSemanticConvention(state, palette.convention).convention;
  const semantics = Object.fromEntries(Object.keys(starterSemanticRoles).map((role) => {
    const selected = reconcileSemanticColorSelection({
      options,
      requestedReference: state.semantics[role],
      fallbackReference: starterSemanticRoles[role as keyof typeof starterSemanticRoles],
    });
    return [role, { role, reference: selected.reference, value: selected.value, label: selected.label, variable: `--${semanticConvention}-${role}` }];
  }));

  const typeName = text(state, "data-type-name");
  const typeMode = mode(state, "type");
  const typeManual = typeMode === "manual" ? manualTokens(state, "type") : undefined;
  const typeBase = typeManual?.find(({ token }) => token === "m");
  const type = {
    label: typeName,
    family: text(state, "data-type-family"),
    headingFamily: text(state, "data-type-heading-family"),
    codeFamily: text(state, "data-type-code-family"),
    bodyWeights: [400, 500, 600, 700, 800],
    headingWeights: [700, 800],
    codeWeights: [400, 500, 600, 700],
    googleFonts: flag(state, "data-google-fonts"),
    min: `${typeBase?.min ?? number(state, "data-type-min") / 16}rem`,
    max: `${typeBase?.max ?? number(state, "data-type-max") / 16}rem`,
    minRatio: text(state, "data-type-min-ratio"),
    maxRatio: text(state, "data-type-max-ratio"),
    baseIndex: text(state, "data-type-index"),
    minWidth,
    maxWidth,
    mode: typeMode,
    tokens: typeManual,
  };

  const dimension = (system: "radius" | "spacing") => ({
    min: number(state, `data-${system}-min`) / 16,
    max: number(state, `data-${system}-max`) / 16,
    minRatio: number(state, `data-${system}-min-ratio`),
    maxRatio: number(state, `data-${system}-max-ratio`),
    baseIndex: text(state, `data-${system}-index`),
  });
  const radiusMode = mode(state, "radius");
  const includeFull = flag(state, "data-radius-full");
  const radiusTokens = radiusMode === "manual"
    ? [...manualTokens(state, "radius"), ...(includeFull ? [{ token: "full", min: 999, max: 999 }] : [])]
    : radiusScale({ ...dimension("radius"), includeFull });
  const spacingMode = mode(state, "spacing");
  const spacingTokens = spacingMode === "manual" ? manualTokens(state, "spacing") : spacingScale(dimension("spacing"));

  return {
    variables: {
      ...viewportVariables,
      ...(typeManual ? Object.fromEntries(typeManual.map((token) => [`--${typeName}-${token.token}`, `${token.min}rem`])) : {}),
    },
    primary: palette.colors[0]?.value,
    colors: palette.colors.map(({ name, value, scale, variable }) => ({ name, value, scale, variable })),
    semantics,
    type,
    radius: `${radiusTokens.find(({ token }) => token === "m")?.max ?? dimension("radius").min}rem`,
    radii: { name: text(state, "data-radius-name"), tokens: radiusTokens, minWidth, maxWidth, mode: radiusMode },
    spacing: { name: text(state, "data-spacing-name"), tokens: spacingTokens, minWidth, maxWidth, mode: spacingMode },
  };
};
