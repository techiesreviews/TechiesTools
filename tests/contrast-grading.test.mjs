import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { gradeContrast, measureContrast } from "../src/framework/colors/contrast.ts";
import { evaluateContrastChecks } from "../src/framework/accessibility/index.ts";

const frameworkWith = (foreground) => ({
  identity: { id: "test", name: "Test" },
  primitives: [
    { id: "semantic.text", cssName: "--text", value: foreground, type: "color" },
    { id: "semantic.surface", cssName: "--surface", value: "#ffffff", type: "color" },
  ],
  elements: [{
    id: "body",
    rules: [{ id: "base", declarations: [
      { property: "color", value: "var(--text)", cssValue: "var(--text)", tokenId: "semantic.text" },
      { property: "background-color", value: "var(--surface)", cssValue: "var(--surface)", tokenId: "semantic.surface" },
    ] }],
  }],
});
const textCheck = {
  id: "body-text",
  elementId: "body",
  kind: "normal-text",
  subject: { rulePath: "body/base", property: "color", editable: false, compatibleTokenIds: [] },
  comparison: { rulePath: "body/base", property: "background-color", editable: false, compatibleTokenIds: [] },
};

test("contrast grading passes normal text at 4.5:1, AAA at 7:1, and UI at 3:1", () => {
  assert.deepEqual(gradeContrast("normal-text", 7.2), { passes: true, level: "AAA" });
  assert.deepEqual(gradeContrast("normal-text", 5.0), { passes: true, level: "AA" });
  assert.deepEqual(gradeContrast("normal-text", 4.5), { passes: true, level: "AA" });
  assert.deepEqual(gradeContrast("normal-text", 4.49), { passes: false, level: "Fail" });
  assert.deepEqual(gradeContrast("non-text-ui", 3.1), { passes: true, level: "AA" });
  assert.deepEqual(gradeContrast("non-text-ui", 2.9), { passes: false, level: "Fail" });
  assert.equal(gradeContrast("normal-text", Number.NaN).passes, false);
});

test("preview grades and the export check agree for the same text pair", () => {
  // Ratios on white: #595959 ≈ 7.0, #767676 ≈ 4.54, #777777 ≈ 4.48, #6b7280 ≈ 4.83.
  for (const foreground of ["#000000", "#595959", "#6b7280", "#767676", "#777777", "#999999"]) {
    const ratio = measureContrast(foreground, "#ffffff");
    assert.ok(ratio !== undefined, foreground);
    const exportFlags = evaluateContrastChecks({ framework: frameworkWith(foreground), checks: [textCheck] }).length > 0;
    assert.equal(gradeContrast("normal-text", ratio).passes, !exportFlags, `${foreground} at ${ratio.toFixed(2)}:1`);
  }
});

test("contrast measurement reads hex, rgb, and oklch the same way as the export check", () => {
  assert.equal(measureContrast("#000", "#fff").toFixed(2), "21.00");
  assert.equal(measureContrast("rgb(0 0 0)", "#ffffff").toFixed(2), "21.00");
  assert.equal(measureContrast("oklch(0% 0 0)", "oklch(100% 0 0)").toFixed(2), "21.00");
  assert.equal(measureContrast("not a colour", "#ffffff"), undefined);
  assert.equal(measureContrast("rgb(. . .)", "#ffffff"), undefined);
});

test("the preview contrast cards use the shared contrast module instead of their own pass marks", () => {
  const preview = readFileSync(join(import.meta.dirname, "..", "src", "components", "dashboard", "DesignSystemPreview.astro"), "utf8");
  assert.match(preview, /from "\.\.\/\.\.\/framework\/colors\/contrast\.ts"/);
  assert.doesNotMatch(preview, /ratio>=7/);
  assert.doesNotMatch(preview, /AAA large/);
});
