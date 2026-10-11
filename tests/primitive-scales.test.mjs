import assert from "node:assert/strict";
import test from "node:test";
import { modularScale, radiusScale, spacingScale, typeScale } from "../src/framework/primitives/scales.ts";
import {
  diffSettingsState,
  mergeSettingsState,
  parseElementUiState,
  restoreSettingsState,
  serializeSettingsDiff,
} from "../src/framework/primitives/settings-state.ts";

test("modular scales anchor at the base index and never invert min and max", () => {
  const tokens = modularScale({ names: ["s", "m", "l"], baseIndex: "m", min: 1, max: 0.5, minRatio: 2, maxRatio: 2 });
  assert.deepEqual(tokens, [
    { token: "s", min: 0.5, max: 0.5 },
    { token: "m", min: 1, max: 1 },
    { token: "l", min: 2, max: 2 },
  ]);
  assert.equal(modularScale({ names: ["s", "m"], baseIndex: "unknown", min: 1, max: 1, minRatio: 2, maxRatio: 2 })[0].min, 1);
});

test("the type scale respects every base step and manual tokens win", () => {
  const atM = typeScale({ min: "1rem", max: "1.125rem", minRatio: "1.25", maxRatio: "1.25", baseIndex: "m" });
  const atL = typeScale({ min: "1rem", max: "1.125rem", minRatio: "1.25", maxRatio: "1.25", baseIndex: "l" });
  assert.equal(atM.find(({ token }) => token === "m").min, 1);
  assert.equal(atL.find(({ token }) => token === "l").min, 1);
  assert.equal(atL.find(({ token }) => token === "m").min, 0.8);
  const manual = [{ token: "m", min: 2, max: 3 }];
  assert.equal(typeScale({ min: "1rem", max: "1rem", minRatio: "1", maxRatio: "1", baseIndex: "m", tokens: manual }), manual);
});

test("radius and spacing scales keep their rounding, floor, and pill token", () => {
  const radius = radiusScale({ min: 0.25, max: 0.5, minRatio: 1.25, maxRatio: 1.5, baseIndex: "m", includeFull: true });
  assert.deepEqual(radius.map(({ token }) => token), ["xs", "s", "m", "l", "xl", "full"]);
  assert.deepEqual(radius.find(({ token }) => token === "m"), { token: "m", min: 0.25, max: 0.5 });
  assert.equal(radius.at(-1).min, 999);
  assert.equal(radiusScale({ min: 0.25, max: 0.5, minRatio: 1.25, maxRatio: 1.5, baseIndex: "m", includeFull: false }).length, 5);
  const spacing = spacingScale({ min: 0.1, max: 0.2, minRatio: 2, maxRatio: 2, baseIndex: "m" });
  assert.equal(spacing.length, 11);
  assert.equal(spacing[0].min, Number((0.0625).toFixed(3)), "spacing never falls below 1px before rounding");
  assert.equal(spacing.find(({ token }) => token === "m").max, 0.2);
});

const defaults = {
  version: 1,
  controls: { "data-type-min": "16", "data-google-fonts": true },
  manual: {},
  modes: { type: "automatic" },
  semantics: { primary: "--color-primary" },
  openAccordion: null,
  elements: { selectedElement: null, treatmentRule: null },
  colors: [{ name: "Primary", hex: "#2563EB" }],
};

test("settings storage keeps only differences and restores them over defaults", () => {
  const current = { ...defaults, controls: { ...defaults.controls, "data-type-min": "18" }, openAccordion: "type" };
  assert.deepEqual(diffSettingsState(current, defaults), { version: 1, controls: { "data-type-min": "18" }, openAccordion: "type" });
  assert.equal(serializeSettingsDiff(defaults, defaults), null);
  const restored = restoreSettingsState(defaults, serializeSettingsDiff(current, defaults), null);
  assert.equal(restored.kind, "diff");
  assert.deepEqual(restored.state, current);
  assert.deepEqual(mergeSettingsState(current, { version: 1, openAccordion: null }).openAccordion, null);
});

test("legacy snapshots migrate once and invalid storage falls back to defaults", () => {
  const legacy = { ...defaults, colors: [{ name: "Brand", hex: "#7C3AED" }] };
  assert.deepEqual(restoreSettingsState(defaults, null, JSON.stringify(legacy)), { kind: "legacy", state: legacy });
  assert.equal(restoreSettingsState(defaults, "{", JSON.stringify(legacy)).kind, "defaults");
  assert.equal(restoreSettingsState(defaults, null, null).kind, "defaults");
});

test("element selection accepts only string or null fields", () => {
  assert.deepEqual(parseElementUiState({ selectedElement: "h1", treatmentRule: null }), { selectedElement: "h1", treatmentRule: null });
  assert.equal(parseElementUiState({ selectedElement: 1, treatmentRule: null }), null);
  assert.equal(parseElementUiState({ selectedElement: "h1" }), null);
  assert.equal(parseElementUiState(undefined), null);
});
