import type { FrameworkSettingsState } from "./settings-state.ts";

/** Manual-mode starting values in px, in scale order. */
export const starterManualTokens = Object.freeze({
  type: [["xs", 13], ["s", 14], ["m", 16], ["l", 20], ["xl", 25], ["2xl", 32], ["3xl", 40], ["4xl", 50]],
  radius: [["xs", 2], ["s", 4], ["m", 8], ["l", 12], ["xl", 20]],
  spacing: [["4xs", 2], ["3xs", 4], ["2xs", 6], ["xs", 8], ["s", 12], ["m", 16], ["l", 24], ["xl", 32], ["2xl", 48], ["3xl", 64], ["4xl", 96]],
} as const satisfies Record<"type" | "radius" | "spacing", readonly (readonly [string, number])[]>);

export const starterSemanticRoles = Object.freeze({
  primary: "--color-primary",
  action: "--color-primary",
  surface: "--color-primary-lightest",
  text: "oklch(0% 0 0)",
  border: "--color-primary-light",
  focus: "--color-primary",
} as const);

const manual = Object.fromEntries(Object.entries(starterManualTokens).flatMap(([system, tokens]) =>
  tokens.map(([token, value]) => [`data-manual-${system}:${token}`, String(value)])));

/**
 * Starter Defaults for every Framework settings bar control. The settings bar markup renders these values,
 * stored settings are diffs against them, and the Primitive baseline is derived from them.
 */
export const starterSettings: FrameworkSettingsState = Object.freeze({
  version: 1,
  controls: {
    "data-fluid-min-width": "320",
    "data-fluid-max-width": "1440",
    "data-color-convention": "color",
    "data-semantic-convention": "semantic",
    "data-google-fonts": true,
    "data-type-family": "Inter",
    "data-type-heading-family": "Inter",
    "data-type-code-family": "Roboto Mono",
    "data-type-name": "text",
    "data-type-min": "16",
    "data-type-max": "18",
    "data-type-min-ratio": "1.125",
    "data-type-max-ratio": "1.333",
    "data-type-index": "m",
    "data-radius-name": "radius",
    "data-radius-min": "4",
    "data-radius-max": "8",
    "data-radius-min-ratio": "1.250",
    "data-radius-max-ratio": "1.500",
    "data-radius-index": "m",
    "data-radius-full": true,
    "data-spacing-name": "space",
    "data-spacing-min": "16",
    "data-spacing-max": "20",
    "data-spacing-min-ratio": "1.200",
    "data-spacing-max-ratio": "1.333",
    "data-spacing-index": "m",
  },
  manual,
  modes: { type: "automatic", radius: "automatic", spacing: "automatic" },
  semantics: { ...starterSemanticRoles },
  openAccordion: "colors",
  elements: { selectedElement: null, treatmentRule: null },
  colors: [{ name: "Primary", hex: "#2563EB" }],
});

/** A text control's starter value, for markup. */
export const starterControl = (attribute: string) => String(starterSettings.controls[attribute] ?? "");
