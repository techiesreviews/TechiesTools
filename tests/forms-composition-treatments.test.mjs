import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsCompositionTreatments } from "../src/framework/treatments/forms-composition/index.ts";

const activeIds = ["label", "fieldset", "legend", "output"];
const nativeIds = ["form"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Forms",
  tags: [id],
  capability: "form-control",
  kind: "form",
  purpose: "Preserve native form composition semantics.",
  treatment: activeIds.includes(id) ? "Apply the reviewed Forms composition treatment." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Use as the native submission and validation boundary; layout belongs to components." : undefined,
  use: ["Use semantic HTML."],
  avoid: "Do not choose semantics for appearance.",
  constraints: ["Preserve naming, association, grouping, validation, and submission behavior."],
  accessibility: ["Preserve accessible names, keyboard behavior, zoom, and reflow."],
  variants: [],
  semanticHtml: formsCompositionTreatments[id]?.specimens[0].semanticHtml ?? '<form method="post"></form>',
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : "0.0.0",
  baseline: { status: "widely-available", source: "mdn", sourceUrl: `https://developer.mozilla.org/${id}`, checkedAt: "2026-07-23" },
  deprecated: false,
  order: 570 + index,
  sourceUrl: `https://developer.mozilla.org/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...nativeIds, ...activeIds].map(guidance),
  treatments: formsCompositionTreatments,
  tokens: starterTokenRegistry,
});
const snapshot = {
  colors: [{ name: "Primary", value: "#2563eb", scale: ["#eff6ff", "#dbeafe", "#bfdbfe", "#2563eb", "#1d4ed8", "#1e3a8a", "#172554"], variable: "--color-primary" }],
  semantics: {
    primary: { role: "primary", reference: "--color-primary", value: "#2563eb", variable: "--semantic-primary" },
    action: { role: "action", reference: "--color-primary", value: "#2563eb", variable: "--semantic-action" },
    surface: { role: "surface", reference: "#ffffff", value: "#ffffff", variable: "--semantic-surface" },
    text: { role: "text", reference: "#111827", value: "#111827", variable: "--semantic-text" },
    border: { role: "border", reference: "#bfdbfe", value: "#bfdbfe", variable: "--semantic-border" },
    focus: { role: "focus", reference: "--color-primary", value: "#2563eb", variable: "--semantic-focus" },
  },
  type: { label: "text", min: "1rem", max: "1.125rem", minRatio: "1.125", maxRatio: "1.333", baseIndex: "m", minWidth: 20, maxWidth: 90, family: "Inter", codeFamily: "Roboto Mono", bodyWeights: [400, 500, 600, 700, 800], codeWeights: [400, 500, 600, 700], googleFonts: true },
  radii: { name: "radius", minWidth: 20, maxWidth: 90, tokens: ["xs", "s", "m", "l", "xl", "full"].map((token, index) => ({ token, min: index === 5 ? 999 : 0.125 * (index + 1), max: index === 5 ? 999 : 0.25 * (index + 1) })) },
  spacing: { name: "space", minWidth: 20, maxWidth: 90, tokens: ["4xs", "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"].map((token, index) => ({ token, min: 0.25 * (index + 1), max: 0.25 * (index + 1) })) },
};

test("Forms composition records four Active treatments and one intentional Native fallback", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const catalog = catalogResult.data;
  assert.deepEqual(Object.keys(formsCompositionTreatments), activeIds);
  assert.deepEqual(catalog.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalog.group("Forms").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...nativeIds, ...activeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("every Active Forms composition element uses the shared locked-selector CSS box contract", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const catalog = catalogResult.data;
  for (const id of activeIds) {
    const element = catalog.get(id);
    assert.ok(element.definition);
    assert.equal(element.rules.length, 1);
    assert.equal(element.rules[0].path, `${id}/base`);
    assert.match(element.rules[0].rule.selector, new RegExp(`^:where\\(${id}\\)$`));
  }
  assert.equal(catalog.get("form").definition, undefined);
});

test("Forms composition CSS owns presentation without owning layout or behavior", () => {
  const allProperties = Object.values(formsCompositionTreatments)
    .flatMap((definition) => definition.rules)
    .flatMap((rule) => Object.keys(rule.declarations));
  for (const forbidden of ["display", "position", "grid-template-columns", "flex-direction", "appearance"]) {
    assert.equal(allProperties.includes(forbidden), false);
  }
  assert.deepEqual(formsCompositionTreatments.fieldset.rules[0].declarations["border-color"].starter, {
    kind: "token",
    family: "semantic",
    name: "border",
  });
  assert.deepEqual(formsCompositionTreatments.fieldset.contrastChecks, [{
    id: "fieldset-boundary",
    kind: "non-text-ui",
    subject: { ruleId: "base", property: "border-color", editable: true },
    comparison: { ruleId: "base", property: "background-color", editable: false },
  }]);
  assert.equal(formsCompositionTreatments.output.rules[0].declarations["font-weight"].starter.value, "700");
});

test("Forms composition export warns without blocking and offers two existing-token boundary remedies", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveSnapshot: snapshot,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /:where\(label\)/);
  assert.match(compilation.artifacts.elements.value.value, /:where\(fieldset\)/);
  assert.doesNotMatch(compilation.artifacts.elements.value.value, /:where\(form\)/);
  assert.match(compilation.artifacts.context.value.value, /Native Element Decisions[\s\S]*`form` 0\.0\.0/);
  const advisory = compilation.accessibilityAdvisories.find((item) => item.elementId === "fieldset");
  assert.ok(advisory);
  assert.equal(advisory.message, "Contrast can be improved.");
  assert.equal(advisory.repairs.length, 2);
  assert.ok(advisory.repairs.every((repair) => repair.rating.includes("AA")));
});
