import assert from "node:assert/strict";
import test from "node:test";
import { cssColorCandidates, resolveCssColorValue } from "../src/code-editor/color-preview.ts";

test("CSS color preview reads declaration ranges and resolves nested local variables without guessing", () => {
  const source = `.panel {\n  --panel-color: color-mix(in oklch, var(--semantic-text) 12%, transparent);\n  color: var(--panel-color);\n  border-color: var(--missing, #f00);\n  inline-size: 20rem;\n}`;
  const candidates = cssColorCandidates(source);
  assert.deepEqual(candidates.map(({ value }) => value), [
    "color-mix(in oklch, var(--semantic-text) 12%, transparent)",
    "var(--panel-color)",
    "var(--missing, #f00)",
    "20rem",
  ]);
  assert.equal(candidates[2]?.start, source.indexOf("var(--missing"));

  const values = new Map([
    ["--semantic-text", "oklch(30% .02 250)"],
    ["--panel-color", "color-mix(in oklch, var(--semantic-text) 12%, transparent)"],
  ]);
  const supports = (value) => value.startsWith("color-mix(") || value.startsWith("#");
  assert.equal(resolveCssColorValue("var(--panel-color)", (name) => values.get(name), supports), "color-mix(in oklch, oklch(30% .02 250) 12%, transparent)");
  assert.equal(resolveCssColorValue("VAR(--panel-color)", (name) => values.get(name), supports), "color-mix(in oklch, oklch(30% .02 250) 12%, transparent)");
  assert.equal(resolveCssColorValue("var(--missing, #f00)", (name) => values.get(name), supports), "#f00");
  assert.equal(resolveCssColorValue("Var(--missing, #f00)", (name) => values.get(name), supports), "#f00");
  assert.equal(resolveCssColorValue("20rem", (name) => values.get(name), supports), null);
  assert.equal(resolveCssColorValue("inherit", (name) => values.get(name), () => true), null);
  assert.equal(resolveCssColorValue("color-mix(in srgb, currentColor 50%, transparent)", (name) => values.get(name), supports), null);
  assert.equal(resolveCssColorValue("color-mix(in srgb, currentColor 50%, transparent)", (name) => values.get(name), supports, "#123456"), "color-mix(in srgb, #123456 50%, transparent)");
  values.set("--cycle", "var(--cycle)");
  assert.equal(resolveCssColorValue("var(--cycle)", (name) => values.get(name), supports), null);
});
