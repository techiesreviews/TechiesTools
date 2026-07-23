import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsNumericTemporalTreatments } from "../src/framework/treatments/forms-numeric-temporal/index.ts";

const activeIds = ["input-number"];
const nativeIds = ["input-range", "input-date", "input-time", "input-datetime-local", "input-month", "input-week", "input-color"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const baselineById = {
  "input-number": "widely-available",
  "input-range": "widely-available",
  "input-date": "widely-available",
  "input-time": "widely-available",
  "input-datetime-local": "widely-available",
  "input-month": "limited-availability",
  "input-week": "limited-availability",
  "input-color": "unknown/not-applicable",
};
const sourceById = Object.fromEntries([...activeIds, ...nativeIds].map((id) => [id, `input/${id.slice(6)}`]));
const inputOwner = {
  id: "input",
  title: "Input",
  group: "Forms",
  tags: ["input"],
  capability: "form-control",
  kind: "native",
  purpose: "Own typed input selector subjects.",
  treatment: "Keep Native Fallback.",
  use: ["Use semantic HTML."],
  avoid: "Do not remove native behavior.",
  version: "0.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input",
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 700,
  sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input",
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Forms",
  tags: [id],
  capability: "form-control",
  kind: "native",
  purpose: "Preserve native input semantics.",
  treatment: activeIds.includes(id) ? "Apply the safe numeric text-box Treatment." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id)
    ? "Preserve the platform widget, picker, constraints, validation, keyboard, touch, and fallback behavior."
    : undefined,
  use: ["Use semantic HTML and an accessible name."],
  avoid: "Do not replace the native widget.",
  constraints: ["Preserve min, max, step, disabled, readonly, validation, and picker behavior."],
  accessibility: ["Preserve native keyboard, focus, touch, and assistive-technology behavior."],
  variants: [],
  semanticHtml: formsNumericTemporalTreatments[id]?.specimens[0].semanticHtml ?? `<input type="${id.slice(6)}">`,
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
  order: 770 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`,
});
const catalogResult = buildElementCatalog({
  guidance: [inputOwner, ...[...activeIds, ...nativeIds].map(guidance)],
  treatments: formsNumericTemporalTreatments,
  tokens: starterTokenRegistry,
});

test("Forms numeric and temporal records one Active Treatment and seven Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsNumericTemporalTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => nativeIds.includes(item.id)).map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("Active number uses the shared locked-selector CSS box while preserving spinbutton behavior", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const element = catalogResult.data.get("input-number");
  assert.ok(element.definition);
  assert.deepEqual(element.rules.map((item) => item.path), ["input-number/base", "input-number/focus-visible"]);
  assert.equal(element.rules[0].rule.selector, ':where(input[type="number"]:not(:disabled):not(:read-only):not(:invalid))');
  assert.equal(element.rules[1].rule.selector, ':where(input[type="number"]:not(:disabled):not(:read-only):not(:invalid):focus-visible)');
  const properties = element.rules.flatMap((item) => Object.keys(item.rule.declarations));
  for (const forbidden of ["appearance", "display", "position", "opacity", "pointer-events", "overflow", "inline-size"]) {
    assert.equal(properties.includes(forbidden), false);
  }
  assert.match(element.definition.specimens[0].semanticHtml, /min="0"/);
  assert.match(element.definition.specimens[0].semanticHtml, /max="20"/);
  assert.match(element.definition.specimens[0].semanticHtml, /step="1"/);
  const renderedSource = readFileSync(join(process.cwd(), "src", "content", "elements", "input-number.md"), "utf8");
  const renderedBody = renderedSource.slice(renderedSource.lastIndexOf("---") + 3);
  assert.match(renderedBody, /name="ticket-count"/);
  assert.match(renderedBody, /min="0"/);
  assert.match(renderedBody, /max="20"/);
  assert.match(renderedBody, /step="1"/);
  assert.equal(element.rules[1].rule.declarations["outline-offset"].starter.value, "-2px");
});

test("Native range, temporal, and color widgets emit zero CSS and retain decision guidance", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /input-number\/base/);
  for (const id of nativeIds) {
    assert.equal(catalogResult.data.get(id).definition, undefined);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 0\\.0\\.0"));
  }
  for (const id of ["input-range", "input-color"]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.doesNotMatch(source, /<output\b/);
    assert.match(source, /every input event/);
  }
  const boundary = compilation.accessibilityAdvisories.find((item) => item.id === "input-number-boundary");
  assert.ok(boundary);
  assert.equal(boundary.message, "Contrast can be improved.");
  assert.equal(boundary.repairs.length, 2);
});
