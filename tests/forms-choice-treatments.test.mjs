import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsChoiceTreatments } from "../src/framework/treatments/forms-choice/index.ts";
import { assertNativeAccentDraft } from "./helpers/native-accent-draft.mjs";

const activeIds = ["select"];
const draftIds = ["input-checkbox", "input-radio"];
const nativeIds = ["optgroup", "option", "datalist"];
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
  capability: id === "option" || id === "optgroup" ? "form-option" : "form-control",
  kind: "native",
  purpose: "Preserve native choice semantics.",
  treatment: activeIds.includes(id) ? "Apply the safe collapsed-select Treatment." : draftIds.includes(id) ? "Draft native accent color." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Preserve the native widget, selection model, labels, grouping, and platform behavior." : undefined,
  use: ["Use semantic HTML and accessible names."],
  avoid: "Do not replace the native widget.",
  constraints: ["Preserve checked, selected, disabled, validation, and picker behavior."],
  accessibility: ["Preserve native keyboard, focus, touch, and assistive-technology behavior."],
  variants: [],
  semanticHtml: formsChoiceTreatments[id]?.specimens[0].semanticHtml ?? `<${id}></${id}>`,
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
  order: 610 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`,
});
const catalogResult = buildElementCatalog({
  guidance: [inputOwner, ...[...activeIds, ...draftIds, ...nativeIds].map(guidance)],
  treatments: formsChoiceTreatments,
  tokens: starterTokenRegistry,
});

test("Forms choice records one Active Treatment, two Draft accents, and three deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsChoiceTreatments), [...activeIds, ...draftIds]);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Draft").map((item) => item.id), draftIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => nativeIds.includes(item.id)).map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...draftIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : draftIds.includes(id) ? "0\\.1\\.0" : "0\\.0\\.0"}"$`, "m"));
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

test("Draft choice accents use one native-safe token declaration and remain out of portable export", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  for (const id of draftIds) {
    const element = catalogResult.data.get(id);
    assertNativeAccentDraft(element, `${id}/base`, `:where(input[type="${id.slice(6)}"])`);
  }
});

test("Draft and Native choice widgets emit zero CSS and Native entries retain Context guidance", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /select\/base/);
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
  const boundary = compilation.accessibilityAdvisories.find((item) => item.id === "select-boundary");
  assert.ok(boundary);
  assert.equal(boundary.message, "Contrast can be improved.");
  assert.equal(boundary.repairs.length, 2);
});
