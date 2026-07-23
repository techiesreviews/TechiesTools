import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { formsTextEntryTreatments } from "../src/framework/treatments/forms-text-entry/index.ts";

const activeIds = ["input", "textarea", "input-text", "input-email", "input-tel", "input-url", "input-search", "input-password"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const sourceById = {
  input: "input",
  textarea: "textarea",
  "input-text": "input/text",
  "input-email": "input/email",
  "input-tel": "input/tel",
  "input-url": "input/url",
  "input-search": "input/search",
  "input-password": "input/password",
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Forms",
  tags: [id],
  capability: "form-control",
  kind: "form",
  purpose: "Preserve native text-entry semantics.",
  treatment: "Apply the reviewed text-entry treatment.",
  use: ["Use the correct type and accessible name."],
  avoid: "Do not remove native editing or validation.",
  constraints: ["Preserve native value, validation, autocomplete, and input-mode behavior."],
  accessibility: ["Preserve keyboard editing, zoom, reflow, and visible focus."],
  variants: [],
  semanticHtml: formsTextEntryTreatments[id]?.specimens[0].semanticHtml ?? "<input>",
  activationEvidence: evidence,
  version: "1.0.0",
  baseline: { status: "widely-available", source: "mdn", sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`, checkedAt: "2026-07-23" },
  deprecated: false,
  order: 590 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${sourceById[id]}`,
});
const catalogResult = buildElementCatalog({
  guidance: activeIds.map(guidance),
  treatments: formsTextEntryTreatments,
  tokens: starterTokenRegistry,
});

test("Forms text-entry records eight independent Active treatments", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsTextEntryTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").map((item) => item.lifecycle), Array(activeIds.length).fill("Active"));
  for (const id of activeIds) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, /^version: "1\.0\.0"$/m);
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("every text-entry treatment uses locked exact selectors and the shared CSS box", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const expected = {
    input: ":where(input:not([type]):not(:disabled):not(:read-only):not(:invalid))",
    textarea: ":where(textarea:not(:disabled):not(:read-only):not(:invalid))",
    "input-text": ':where(input[type="text"]:not(:disabled):not(:read-only):not(:invalid))',
    "input-email": ':where(input[type="email"]:not(:disabled):not(:read-only):not(:invalid))',
    "input-tel": ':where(input[type="tel"]:not(:disabled):not(:read-only):not(:invalid))',
    "input-url": ':where(input[type="url"]:not(:disabled):not(:read-only):not(:invalid))',
    "input-search": ':where(input[type="search"]:not(:disabled):not(:read-only):not(:invalid))',
    "input-password": ':where(input[type="password"]:not(:disabled):not(:read-only):not(:invalid))',
  };
  for (const id of activeIds) {
    const element = catalogResult.data.get(id);
    assert.ok(element.definition);
    assert.deepEqual(element.rules.map((item) => item.path), [`${id}/base`, `${id}/focus-visible`]);
    assert.equal(element.rules[0].rule.selector, expected[id]);
    assert.match(element.rules[1].rule.selector, /:focus-visible\)$/);
    assert.match(element.rules[1].rule.selector, /:not\(:disabled\):not\(:read-only\):not\(:invalid\):focus-visible\)$/);
    assert.doesNotMatch(element.rules[0].rule.selector, /^:where\(input\)$/);
  }
  for (const id of activeIds.filter((item) => item.startsWith("input-"))) {
    assert.equal(formsTextEntryTreatments[id].selectorSubject, "input");
  }
});

test("typed factory emits normalized independent definitions without runtime inheritance", () => {
  const definitions = Object.values(formsTextEntryTreatments);
  for (let index = 1; index < definitions.length; index += 1) {
    assert.notEqual(definitions[index], definitions[0]);
    assert.notEqual(definitions[index].rules, definitions[0].rules);
    assert.notEqual(definitions[index].rules[0].declarations, definitions[0].rules[0].declarations);
  }
  for (const definition of definitions) {
    assert.ok(definition.rules[0].declarations["min-block-size"]);
    assert.ok(definition.rules[0].declarations["max-inline-size"]);
    for (const forbidden of ["appearance", "display", "position", "opacity", "pointer-events", "user-select", "caret-color", "resize", "overflow"]) {
      assert.equal(definition.rules[0].declarations[forbidden], undefined);
    }
  }
  assert.equal(formsTextEntryTreatments.textarea.rules[0].declarations["min-block-size"].starter.value, "8rem");
  assert.equal(formsTextEntryTreatments.input.rules[0].declarations["min-block-size"].starter.value, "2.75rem");
  assert.equal(formsTextEntryTreatments.input.rules[1].declarations["outline-offset"].starter.value, "-2px");
});

test("virtual selector subjects are generic, explicit, and prefix-bound", () => {
  const invalid = buildElementCatalog({
    guidance: [guidance("input-email", 0)],
    treatments: {
      "input-email": { ...formsTextEntryTreatments["input-email"], selectorSubject: "button" },
    },
    tokens: starterTokenRegistry,
  });
  assert.equal(invalid.success, false);
  assert.ok(invalid.diagnostics.some((item) => item.code === "catalog.selector-subject"));
  const missingOwner = buildElementCatalog({
    guidance: [guidance("input-email", 0)],
    treatments: { "input-email": formsTextEntryTreatments["input-email"] },
    tokens: starterTokenRegistry,
  });
  assert.equal(missingOwner.success, false);
  assert.ok(missingOwner.diagnostics.some((item) => item.code === "catalog.selector-subject"));
});

test("each text-entry boundary participates in non-blocking existing-token contrast repair", () => {
  for (const [id, definition] of Object.entries(formsTextEntryTreatments)) {
    assert.deepEqual(definition.contrastChecks.map((check) => check.id), [
      `${id}-text`,
      `${id}-boundary`,
      `${id}-focus-inner`,
      `${id}-focus-outer`,
    ]);
    assert.equal(definition.contrastChecks[1].kind, "non-text-ui");
    assert.equal(definition.contrastChecks[1].subject.property, "border-color");
    assert.equal(definition.contrastChecks[2].comparison.property, "background-color");
    assert.equal(definition.contrastChecks[3].comparison.property, "border-color");
  }
});

test("current Framework docs record the complete promoted inventory truth", () => {
  const guidanceDoc = readFileSync(join(process.cwd(), "docs", "framework", "element-guidance.md"), "utf8");
  const auditDoc = readFileSync(join(process.cwd(), "docs", "framework", "element-standards-audit.md"), "utf8");
  const adr = readFileSync(join(process.cwd(), "docs", "adr", "0011-element-reference-uses-guided-gallery.md"), "utf8");
  const versions = readdirSync(join(process.cwd(), "src", "content", "elements"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => /^version: "([^"]+)"$/m.exec(readFileSync(join(process.cwd(), "src", "content", "elements", file), "utf8"))?.[1]);
  const activeCount = versions.filter((version) => /^[1-9]\d*\./.test(version ?? "")).length;
  const nativeCount = versions.filter((version) => version === "0.0.0").length;
  assert.match(auditDoc, new RegExp(`${activeCount} Active`));
  assert.match(auditDoc, new RegExp(`${nativeCount} Native`));
  for (const source of [guidanceDoc, auditDoc, adr]) assert.doesNotMatch(source, /other 90|remaining entries are Native/i);
});

test("text-entry CSS and Context compile from the same Catalog with non-blocking repairs", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.equal(compilation.artifacts.context.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of activeIds) {
    assert.match(compilation.artifacts.elements.value.value, new RegExp(`${id}/base`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 1\\.0\\.0"));
    const boundary = compilation.accessibilityAdvisories.find((item) => item.id === `${id}-boundary`);
    assert.ok(boundary);
    assert.equal(boundary.message, "Contrast can be improved.");
    assert.equal(boundary.repairs.length, 2);
    assert.ok(boundary.repairs.every((repair) => repair.rating.includes("AA")));
  }
});
