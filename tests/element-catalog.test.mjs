import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog, defineTreatment } from "../src/framework/catalog/index.ts";
import { actionsTreatments } from "../src/framework/treatments/actions/index.ts";

const tokens = new Map([
  ["semantic.action", "color"],
  ["semantic.primary", "color"],
  ["semantic.surface", "color"],
  ["semantic.text", "color"],
  ["semantic.border", "color"],
  ["semantic.focus", "color"],
  ["typography.m", "dimension"],
  ["spacing.3xs", "dimension"],
  ["spacing.s", "dimension"],
  ["radius.m", "dimension"],
]);

const evidence = {
  definition: { status: "pass", reference: "tests/catalog", checkedAt: "2026-07-23" },
  baseline: { status: "pass", reference: "mdn", checkedAt: "2026-07-23" },
  nativeBehavior: { status: "pass", reference: "tests/native", checkedAt: "2026-07-23" },
  keyboard: { status: "pass", reference: "tests/keyboard", checkedAt: "2026-07-23" },
  focus: { status: "pass", reference: "tests/focus", checkedAt: "2026-07-23" },
  parity: { status: "pass", reference: "tests/parity", checkedAt: "2026-07-23" },
};

const guidance = (id, version, overrides = {}) => ({
  id,
  title: id === "a" ? "Link" : id === "button" ? "Button" : "Navigation",
  group: "Actions",
  tags: [id],
  kind: "actions",
  capability: "interactive",
  order: id === "a" ? 10 : 20,
  version,
  baseline: { status: "widely-available", source: "mdn", sourceUrl: `https://developer.mozilla.org/${id}`, checkedAt: "2026-07-23" },
  activationEvidence: version.startsWith("1.") ? evidence : undefined,
  deprecated: false,
  sourceUrl: `https://developer.mozilla.org/${id}`,
  purpose: "Use native semantics.",
  treatment: "Use Framework tokens.",
  use: ["Use correctly."],
  avoid: "Do not replace native behavior.",
  constraints: ["Preserve semantics."],
  accessibility: ["Preserve focus."],
  semanticHtml: id === "a" ? '<a href="/">Link</a>' : '<button type="button">Button</button>',
  variants: id === "a" ? [{ name: "quiet", when: "Supporting action." }] : id === "button" ? [{ name: "secondary", when: "Secondary action." }] : [],
  defaultVariant: id === "a" || id === "button" ? "default" : undefined,
  ...overrides,
});

test("Element Catalog derives lifecycle from version coherence and joins each ID once", () => {
  const catalog = buildElementCatalog({
    guidance: [guidance("a", "1.0.0"), guidance("button", "0.0.0", { activationEvidence: undefined })],
    treatments: actionsTreatments,
    tokens,
  });
  assert.equal(catalog.success, false);
  assert.ok(catalog.diagnostics.some((item) => item.code === "catalog.native-definition" && item.elementId === "button"));

  const active = buildElementCatalog({ guidance: [guidance("a", "1.0.0"), guidance("nav", "0.0.0", { activationEvidence: undefined })], treatments: { a: actionsTreatments.a }, tokens });
  assert.equal(active.success, true, JSON.stringify(active.diagnostics));
  assert.equal(active.data.elements[0].lifecycle, "Active");
  assert.equal(active.data.rule("a/base").path, "a/base");
  assert.equal(Object.isFrozen(active.data), true);

  const orphan = buildElementCatalog({ guidance: [guidance("button", "0.0.0", { activationEvidence: undefined })], treatments: { a: actionsTreatments.a }, tokens });
  assert.equal(orphan.success, false);
  assert.ok(orphan.diagnostics.some((item) => item.code === "catalog.orphan-treatment"));
});

test("Definition is the authored allowlist and generic validators report stable Rule Paths", () => {
  const unsafe = defineTreatment({
    ...structuredClone(actionsTreatments.a),
    rules: [{ ...structuredClone(actionsTreatments.a.rules[0]), selector: "#app a" }],
  });
  const result = buildElementCatalog({ guidance: [guidance("a", "1.0.0"), guidance("nav", "0.0.0", { activationEvidence: undefined })], treatments: { a: unsafe }, tokens });
  assert.equal(result.success, false);
  assert.ok(result.diagnostics.some((item) => item.code === "catalog.selector" && item.ruleId === "a/base"));
});

test("all 92 Markdown inventory entries use catalog lifecycle fields only", () => {
  const directory = join(process.cwd(), "src", "content", "elements");
  const files = readdirSync(directory).filter((file) => file.endsWith(".md"));
  assert.equal(files.length, 92);
  for (const file of files) {
    const source = readFileSync(join(directory, file), "utf8");
    assert.match(source, /^capability: "(?:text|interactive|structure|list|form-control|form-option|media|data|disclosure|dialog|non-rendered)"$/m, file);
    assert.doesNotMatch(source, /^(?:promoted|accessibilityPassed|treatmentDefinition):/m, file);
    assert.match(source, /^version: "(?:0\.0\.0|(?:[1-9]\d*)\.\d+\.\d+)"$/m, file);
  }
});
