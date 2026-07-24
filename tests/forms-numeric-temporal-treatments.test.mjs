import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsNumericTemporalTreatments } from "../src/framework/treatments/forms-numeric-temporal/index.ts";

const activeIds = ["input-number", "input-date", "input-time", "input-datetime-local"];
const draftIds = ["input-month", "input-week"];
const nativeIds = ["input-range", "input-color"];
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
const sourceById = Object.fromEntries([...activeIds, ...draftIds, ...nativeIds].map((id) => [id, `input/${id.slice(6)}`]));
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
  treatment: activeIds.includes(id) || draftIds.includes(id) ? "Apply the shared form-control shell while preserving the native picker." : "Keep Native Fallback.",
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
  version: activeIds.includes(id) ? "1.0.0" : draftIds.includes(id) ? "0.1.0" : "0.0.0",
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
  guidance: [inputOwner, ...[...activeIds, ...draftIds, ...nativeIds].map(guidance)],
  treatments: formsNumericTemporalTreatments,
  tokens: starterTokenRegistry,
});

test("Forms numeric and temporal records four Active Treatments, two Draft pickers, and two Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsNumericTemporalTreatments), [...activeIds, ...draftIds]);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Draft").map((item) => item.id), draftIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => nativeIds.includes(item.id)).map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...draftIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : draftIds.includes(id) ? "0\\.1\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("numeric and temporal Treatments use the shared CSS box without replacing platform widgets", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  for (const id of [...activeIds, ...draftIds]) {
    const element = catalogResult.data.get(id);
    assert.ok(element.definition);
    assert.deepEqual(element.rules.map((item) => item.path), [`${id}/base`, `${id}/focus-visible`]);
    const type = id.slice(6);
    assert.equal(element.rules[0].rule.selector, `:where(input[type="${type}"]:not(:disabled):not(:read-only):not(:invalid))`);
    assert.equal(element.rules[1].rule.selector, `:where(input[type="${type}"]:not(:disabled):not(:read-only):not(:invalid):focus-visible)`);
    const properties = element.rules.flatMap((item) => Object.keys(item.rule.declarations));
    for (const forbidden of ["appearance", "display", "position", "opacity", "pointer-events", "overflow", "inline-size"]) {
      assert.equal(properties.includes(forbidden), false);
    }
  }
  const element = catalogResult.data.get("input-number");
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

test("Active temporal fields emit shared CSS while Draft and Native widgets remain out of portable export", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of activeIds) {
    assert.match(compilation.artifacts.elements.value.value, new RegExp(`${id}/base`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 1\\.0\\.0"));
  }
  for (const id of draftIds) {
    assert.ok(catalogResult.data.get(id).definition);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
    assert.doesNotMatch(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 0\\.1\\.0"));
  }
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
  for (const id of activeIds) {
    const boundary = compilation.accessibilityAdvisories.find((item) => item.id === `${id}-boundary`);
    assert.ok(boundary);
    assert.equal(boundary.message, "Contrast can be improved.");
    assert.equal(boundary.repairs.length, 2);
  }
});
