import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsChoiceTreatments } from "../src/framework/treatments/forms-choice/index.ts";

const activeIds = ["select"];
const nativeIds = ["input-checkbox", "input-radio", "optgroup", "option", "datalist"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const sourceById = {
  "input-checkbox": "input/checkbox",
  "input-radio": "input/radio",
  select: "select",
  optgroup: "optgroup",
  option: "option",
  datalist: "datalist",
};
const baselineById = {
  "input-checkbox": "unknown/not-applicable",
  "input-radio": "widely-available",
  select: "widely-available",
  optgroup: "widely-available",
  option: "widely-available",
  datalist: "limited-availability",
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Forms",
  tags: [id],
  capability: id === "option" || id === "optgroup" ? "form-option" : "form-control",
  kind: "native",
  purpose: "Preserve native choice semantics.",
  treatment: activeIds.includes(id) ? "Apply the safe collapsed-select Treatment." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Preserve the native widget, selection model, labels, grouping, and platform behavior." : undefined,
  use: ["Use semantic HTML and accessible names."],
  avoid: "Do not replace the native widget.",
  constraints: ["Preserve checked, selected, disabled, validation, and picker behavior."],
  accessibility: ["Preserve native keyboard, focus, touch, and assistive-technology behavior."],
  variants: [],
  semanticHtml: formsChoiceTreatments[id]?.specimens[0].semanticHtml ?? `<${id}></${id}>`,
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : "0.0.0",
  baseline: {
    status: baselineById[id],
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`,
    checkedAt: "2026-07-23",
    ...(baselineById[id] === "unknown/not-applicable" ? { note: "Exact MDN page has no Baseline badge." } : {}),
  },
  deprecated: false,
  order: 610 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...activeIds, ...nativeIds].map(guidance),
  treatments: formsChoiceTreatments,
  tokens: starterTokenRegistry,
});

test("Forms choice records one Active Treatment and five deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsChoiceTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("Active select uses the shared locked-selector CSS box without replacing the widget", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const element = catalogResult.data.get("select");
  assert.ok(element.definition);
  assert.deepEqual(element.rules.map((item) => item.path), ["select/base", "select/focus-visible"]);
  assert.equal(element.rules[0].rule.selector, ":where(select:not([multiple]):not([size]):not(:disabled):not(:invalid))");
  assert.equal(element.rules[1].rule.selector, ":where(select:not([multiple]):not([size]):not(:disabled):not(:invalid):focus-visible)");
  const properties = element.rules.flatMap((item) => Object.keys(item.rule.declarations));
  for (const forbidden of ["appearance", "display", "position", "opacity", "pointer-events", "overflow", "inline-size"]) {
    assert.equal(properties.includes(forbidden), false);
  }
  assert.equal(element.rules[1].rule.declarations["outline-offset"].starter.value, "-2px");
});

test("Native choice widgets emit zero CSS and retain decision-helpful Context guidance", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /select\/base/);
  for (const id of nativeIds) {
    assert.equal(catalogResult.data.get(id).definition, undefined);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 0\\.0\\.0"));
  }
  const boundary = compilation.accessibilityAdvisories.find((item) => item.id === "select-boundary");
  assert.ok(boundary);
  assert.equal(boundary.message, "Contrast can be improved.");
  assert.equal(boundary.repairs.length, 2);
});
