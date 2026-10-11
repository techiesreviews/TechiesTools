import assert from "node:assert/strict";
import test from "node:test";
import { primitiveSnapshotFromSettings, settingsPalette, settingsViewport } from "../src/framework/primitives/snapshot.ts";
import { mergeSettingsState } from "../src/framework/primitives/settings-state.ts";
import { starterSettings } from "../src/framework/primitives/starter-settings.ts";
import { primitiveTokensFromSnapshot } from "../src/framework/compiler/index.ts";
import { createFrameworkController } from "../src/framework/controller/index.ts";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { parseFrameworkPaletteColors } from "../src/framework/colors/palette-preferences.ts";

const withSettings = (diff) => mergeSettingsState(starterSettings, { version: 1, ...diff });

test("the Starter Defaults snapshot is complete and uses every starter value", () => {
  const snapshot = primitiveSnapshotFromSettings(starterSettings);
  assert.deepEqual(Object.keys(snapshot.semantics), ["primary", "action", "surface", "text", "border", "focus"]);
  assert.equal(snapshot.semantics.primary.reference, "--color-primary");
  assert.equal(snapshot.semantics.text.value, "oklch(0% 0 0)");
  assert.equal(snapshot.semantics.surface.variable, "--semantic-surface");
  assert.equal(snapshot.colors[0].variable, "--color-primary");
  assert.equal(snapshot.type.family, "Inter");
  assert.equal(snapshot.type.headingFamily, "Inter");
  assert.equal(snapshot.type.codeFamily, "Roboto Mono");
  assert.deepEqual(snapshot.type.headingWeights, [700, 800]);
  assert.equal(snapshot.type.min, "1rem");
  assert.equal(snapshot.radius, "0.5rem");
  assert.equal(snapshot.radii.tokens.at(-1).token, "full");
  assert.equal(snapshot.variables["--fluid-max-viewport"], "90rem");
  assert.ok(primitiveTokensFromSnapshot(snapshot).length > 0);
});

test("manual modes publish the authored px values in rem", () => {
  const snapshot = primitiveSnapshotFromSettings(withSettings({
    modes: { type: "manual", radius: "manual", spacing: "manual" },
    manual: { "data-manual-type:m": "24", "data-manual-radius:m": "-3" },
  }));
  assert.equal(snapshot.type.min, "1.5rem");
  assert.equal(snapshot.variables["--text-m"], "1.5rem");
  assert.deepEqual(snapshot.radii.tokens.find(({ token }) => token === "m"), { token: "m", min: 0, max: 0 });
  assert.equal(snapshot.spacing.tokens.length, 11);
});

test("conventions avoid collisions and semantic roles follow palette renames", () => {
  const palette = settingsPalette(withSettings({ controls: { "data-color-convention": "space", "data-spacing-name": "space" }, colors: [{ name: "M", hex: "#000000" }] }));
  assert.equal(palette.hasCollision, true);
  assert.notEqual(palette.convention, "space");
  const renamed = primitiveSnapshotFromSettings(withSettings({ colors: [{ name: "Brand", hex: "#7C3AED" }], semantics: { primary: "--color-brand-dark" } }));
  assert.equal(renamed.semantics.primary.reference, "--color-brand-dark");
  assert.equal(renamed.semantics.primary.label, "Brand / Dark");
  const clash = primitiveSnapshotFromSettings(withSettings({ controls: { "data-semantic-convention": "color" } }));
  assert.equal(clash.semantics.primary.variable, "--color-semantic-primary");
});

test("invalid stored values fall back to Starter Defaults", () => {
  const state = withSettings({ controls: { "data-type-min": "abc", "data-fluid-min-width": "900", "data-fluid-max-width": "100" }, colors: [null, { name: "", hex: "#fff" }, { name: "X", hex: "nope" }] });
  const snapshot = primitiveSnapshotFromSettings(state);
  assert.equal(snapshot.type.min, "1rem");
  assert.equal(settingsViewport(state).maxPx, 901);
  assert.equal(snapshot.colors[0].name, "Primary");
});

test("the settings palette and the palette shortcuts read the same colors", () => {
  const diff = { version: 1, controls: { "data-color-convention": "brand" }, colors: [{ name: "Ocean", hex: "#00AAFF" }] };
  const snapshot = primitiveSnapshotFromSettings(withSettings(diff));
  const shortcuts = parseFrameworkPaletteColors(JSON.stringify(diff));
  assert.equal(shortcuts.find(({ name }) => name === "Ocean / Base").variable, snapshot.colors[0].variable);
});

const catalog = (() => {
  const result = buildElementCatalog({ guidance: [], treatments: {}, tokens: starterTokenRegistry });
  return result.success ? result.data : undefined;
})();

test("Primitive edits apply even when storage blocks the first-paint cache", { skip: !catalog }, () => {
  const blocked = { getItem: () => null, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } };
  const controller = createFrameworkController({ catalog, primitiveDefaults: starterPrimitiveDefaults, identity: { id: "t", name: "T" }, sourceRevision: "test" }, { storage: blocked, catalog });
  const baseline = primitiveSnapshotFromSettings(starterSettings);
  const edited = primitiveSnapshotFromSettings(withSettings({ colors: [{ name: "Primary", hex: "#DC2626" }] }));
  const compilation = controller.updatePrimitives(edited, baseline);
  const primary = compilation.resolved.primitives.find(({ id }) => id === "color.primary");
  assert.equal(primary.value, edited.colors[0].value);
});

test("stored Primitive diffs never override a published snapshot", { skip: !catalog }, () => {
  const values = new Map([["techies-tools:framework:primitive-diffs:v1", JSON.stringify({ schemaVersion: 1, values: { "color.primary": "oklch(10% 0.1 30)" } })]]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const controller = createFrameworkController({ catalog, primitiveDefaults: starterPrimitiveDefaults, identity: { id: "t", name: "T" }, sourceRevision: "test" }, { storage, catalog });
  const edited = primitiveSnapshotFromSettings(withSettings({ colors: [{ name: "Primary", hex: "#16A34A" }] }));
  const compilation = controller.updatePrimitives(edited);
  assert.equal(compilation.resolved.primitives.find(({ id }) => id === "color.primary").value, edited.colors[0].value);
});

test("published shades are the tokens.css scale, including the near-black floor", async () => {
  const { frameworkScaleFor } = await import("../src/framework/colors/palette-generation.ts");
  const snapshot = primitiveSnapshotFromSettings(withSettings({ colors: [{ name: "Ink", hex: "#1F2937" }] }));
  assert.deepEqual(snapshot.colors[0].scale, frameworkScaleFor(snapshot.colors[0].value));
});

test("semantic contrast in Preview uses the accessibility module's ratio", async () => {
  const { colorContrastRatio } = await import("../src/framework/accessibility/index.ts");
  assert.equal(Number(colorContrastRatio("#000000", "#ffffff").toFixed(2)), 21);
  assert.equal(colorContrastRatio("var(--x)", "#ffffff"), undefined);
});
