import type { ElementUiState } from "../events.ts";

/** Every Framework settings bar control value, read from and written back to the form. */
export type FrameworkSettingsState = {
  version: 1;
  controls: Record<string, string | boolean>;
  manual: Record<string, string>;
  modes: Record<string, string>;
  semantics: Record<string, string>;
  openAccordion: string | null;
  elements: ElementUiState;
  colors: { name: string; hex: string }[];
};

/** Only the values that differ from the Starter Defaults; this is what storage keeps. */
export type FrameworkSettingsDiff = {
  version: 1;
  controls?: Record<string, string | boolean>;
  manual?: Record<string, string>;
  modes?: Record<string, string>;
  semantics?: Record<string, string>;
  openAccordion?: string | null;
  elements?: ElementUiState;
  colors?: FrameworkSettingsState["colors"];
};

const recordDiff = <T,>(current: Record<string, T>, baseline: Record<string, T>) =>
  Object.fromEntries(Object.entries(current).filter(([key, value]) => baseline[key] !== value));

export const diffSettingsState = (current: FrameworkSettingsState, baseline: FrameworkSettingsState): FrameworkSettingsDiff => {
  const diff: FrameworkSettingsDiff = { version: 1 };
  const controls = recordDiff(current.controls, baseline.controls); if (Object.keys(controls).length) diff.controls = controls;
  const manual = recordDiff(current.manual, baseline.manual); if (Object.keys(manual).length) diff.manual = manual;
  const modes = recordDiff(current.modes, baseline.modes); if (Object.keys(modes).length) diff.modes = modes;
  const semantics = recordDiff(current.semantics, baseline.semantics); if (Object.keys(semantics).length) diff.semantics = semantics;
  if (current.openAccordion !== baseline.openAccordion) diff.openAccordion = current.openAccordion;
  if (JSON.stringify(current.elements) !== JSON.stringify(baseline.elements)) diff.elements = current.elements;
  if (JSON.stringify(current.colors) !== JSON.stringify(baseline.colors)) diff.colors = current.colors;
  return diff;
};

export const mergeSettingsState = (baseline: FrameworkSettingsState, diff: FrameworkSettingsDiff): FrameworkSettingsState => ({
  ...baseline,
  controls: { ...baseline.controls, ...(diff.controls ?? {}) },
  manual: { ...baseline.manual, ...(diff.manual ?? {}) },
  modes: { ...baseline.modes, ...(diff.modes ?? {}) },
  semantics: { ...baseline.semantics, ...(diff.semantics ?? {}) },
  openAccordion: Object.hasOwn(diff, "openAccordion") ? diff.openAccordion ?? null : baseline.openAccordion,
  elements: diff.elements ?? baseline.elements,
  colors: diff.colors ?? baseline.colors,
});

/** The serialized diff, or null when nothing differs from the defaults and storage should be cleared. */
export const serializeSettingsDiff = (current: FrameworkSettingsState, defaults: FrameworkSettingsState) => {
  const diff = diffSettingsState(current, defaults);
  return Object.keys(diff).length > 1 ? JSON.stringify(diff) : null;
};

export type RestoredSettingsState =
  | { kind: "defaults" }
  | { kind: "diff"; state: FrameworkSettingsState }
  /** A pre-diff full snapshot; the caller should persist it once as a diff. */
  | { kind: "legacy"; state: FrameworkSettingsState };

/** Restore stored settings: the diff wins over the legacy snapshot; invalid JSON falls back to defaults. */
export const restoreSettingsState = (defaults: FrameworkSettingsState, storedDiff: string | null, storedLegacy: string | null): RestoredSettingsState => {
  try {
    if (storedDiff) return { kind: "diff", state: mergeSettingsState(defaults, JSON.parse(storedDiff)) };
    if (storedLegacy) return { kind: "legacy", state: JSON.parse(storedLegacy) };
  } catch { /* Invalid storage falls back to defaults. */ }
  return { kind: "defaults" };
};

/** Accept an element selection only when both fields are strings or null. */
export const parseElementUiState = (detail: unknown): ElementUiState | null => {
  if (!detail || typeof detail !== "object") return null;
  const { selectedElement, treatmentRule } = detail as Partial<ElementUiState>;
  const valid = (value: unknown) => value === null || typeof value === "string";
  return valid(selectedElement) && valid(treatmentRule) ? { selectedElement: selectedElement ?? null, treatmentRule: treatmentRule ?? null } : null;
};
