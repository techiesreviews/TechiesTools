import assert from "node:assert/strict";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { actionsTreatments } from "../src/framework/treatments/actions/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { createFrameworkController } from "../src/framework/controller/index.ts";
import { parseRuleDeclarations, serializeRuleDeclarations } from "../src/framework/element-authoring/index.ts";
import { effectiveDeclarationIndex } from "../src/framework/css-declarations/index.ts";
import { loadFrameworkPreferences, loadRuleDrafts, nextElementSelection, saveRuleDraft } from "../src/framework/preferences/index.ts";
import { migrateStoredOverrides } from "../src/framework/model/index.ts";

const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const guidance = (id, version = "1.0.0") => ({
  id,
  title: id === "a" ? "Link" : id === "button" ? "Button" : "Navigation",
  group: id === "nav" ? "Structure" : "Actions",
  tags: [id],
  capability: id === "nav" ? "structure" : "interactive",
  kind: id === "a" ? "actions" : "native",
  purpose: "Preserve native semantics.",
  treatment: "Use Framework tokens.",
  use: ["Use native HTML."],
  avoid: "Do not replace native behavior.",
  constraints: ["Preserve semantics."],
  accessibility: ["Preserve keyboard and focus behavior."],
  variants: id === "a" ? [{ name: "quiet", when: "Supporting action." }] : id === "button" ? [{ name: "secondary", when: "Secondary action." }] : [],
  defaultVariant: id === "a" || id === "button" ? "default" : undefined,
  semanticHtml: id === "a" ? '<a href="/">Home</a>' : id === "button" ? '<button type="button">Save</button>' : "<nav></nav>",
  version,
  baseline: { status: "widely-available", source: "mdn", sourceUrl: `https://developer.mozilla.org/${id}`, checkedAt: "2026-07-23" },
  activationEvidence: version.startsWith("1.") ? evidence : undefined,
  deprecated: false,
  order: id === "a" ? 10 : id === "button" ? 20 : 30,
  sourceUrl: `https://developer.mozilla.org/${id}`,
});
const primitiveDefaults = {
  "semantic.primary": "#1d4ed8",
  "semantic.action": "#2563eb",
  "semantic.surface": "#ffffff",
  "semantic.text": "#111827",
  "semantic.border": "#c7d2fe",
  "semantic.focus": "#2563eb",
  "typography.m": "1rem",
  "radius.m": "0.5rem",
  "spacing.3xs": "0.5rem",
  "spacing.s": "0.75rem",
};
const tokenRegistry = new Map(Object.keys(primitiveDefaults).map((id) => [id, id.startsWith("semantic.") ? "color" : "dimension"]));
const catalogResult = buildElementCatalog({
  guidance: [guidance("a"), guidance("button"), guidance("nav", "0.0.0")],
  treatments: actionsTreatments,
  tokens: tokenRegistry,
});
assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
const catalog = catalogResult.data;
const tokens = Object.entries(primitiveDefaults).map(([id, value]) => ({
  id,
  cssName: `--${id.replaceAll(".", "-")}`,
  value,
  type: id.startsWith("semantic.") ? "color" : "dimension",
}));
const input = () => ({
  catalog,
  primitiveDefaults,
  identity: { id: "techies", name: "Techies Framework" },
  sourceRevision: "test",
});
const memoryStorage = () => {
  const values = new Map();
  return { values, storage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) } };
};

test("catalog-driven compiler emits Active Treatments and excludes Native entries", () => {
  const compilation = compileFramework(input());
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /a\/base/);
  assert.match(compilation.artifacts.elements.value.value, /button\/base/);
  assert.doesNotMatch(compilation.artifacts.elements.value.value, /nav\/base/);
  assert.match(compilation.artifacts.context.value.value, /Element Treatments/);
  assert.match(compilation.artifacts.context.value.value, /https:\/\/techies\.tools/);
});

test("generic declaration authoring resolves immutable Treatment Rule Paths", () => {
  const serialized = serializeRuleDeclarations({ catalog, rulePath: "button/base", tokens });
  assert.equal(serialized.success, true, JSON.stringify(serialized.diagnostics));
  assert.match(serialized.data, /background-color: var\(--semantic-action\);/);
  const parsed = parseRuleDeclarations({ catalog, rulePath: "button/base", source: serialized.data, tokens });
  assert.equal(parsed.success, true, JSON.stringify(parsed.diagnostics));
  assert.equal(parsed.data.rulePath, "button/base");
  assert.deepEqual(parsed.data.values["background-color"], { kind: "token", family: "semantic", name: "action" });
  assert.equal(parseRuleDeclarations({ catalog, rulePath: "button/missing", source: "color: red;", tokens }).success, false);
});

test("declaration authoring accepts arbitrary CSS without Catalog property or value validation", () => {
  for (const source of [
    "display: none;",
    "display: definitely-not-a-catalog-or-browser-value;",
    "background-color: var(--semantic-action) !important;",
    "background-color: red;",
    "background-color: var(--semantic-action); background-color: var(--semantic-primary);",
    "inline-size: min(100%, 42rem); transform: translateY(-1px);",
  ]) {
    const parsed = parseRuleDeclarations({ catalog, rulePath: "button/base", source, tokens });
    assert.equal(parsed.success, true, source);
  }
});

test("effective declaration order respects importance, CSS property casing, and custom-property casing", () => {
  const declarations = [
    { property: "COLOR", value: "red", important: true },
    { property: "color", value: "blue", important: false },
    { property: "--Tone", value: "red", important: false },
    { property: "--tone", value: "blue", important: true },
  ];
  assert.equal(effectiveDeclarationIndex(declarations, "color"), 0);
  assert.equal(effectiveDeclarationIndex(declarations, "--Tone"), 2);
  assert.equal(effectiveDeclarationIndex(declarations, "--tone"), 3);
});

test("v2 preferences store absolute Rule Paths and prune Starter values", () => {
  const definition = { ...catalog.get("a"), definition: catalog.get("a").definition };
  const changed = nextElementSelection(
    { schemaVersion: 2, entries: {} },
    definition,
    "a/base",
    "text-decoration-line",
    { kind: "choice", value: "none" },
    tokenRegistry,
  );
  assert.equal(changed.success, true);
  assert.deepEqual(changed.store.entries.a.rules["a/base"]["text-decoration-line"], { kind: "choice", value: "none" });
  const pruned = nextElementSelection(changed.store, definition, "a/base", "text-decoration-line", { kind: "choice", value: "underline" }, tokenRegistry);
  assert.equal(pruned.success, true);
  assert.deepEqual(pruned.store, { schemaVersion: 2, entries: {} });
});

test("v1 preferences migrate to v2 Rule Paths and rewrite on the next valid edit", () => {
  const { values, storage } = memoryStorage();
  values.set("techies-tools:framework:element-diffs:v1", JSON.stringify({
    schemaVersion: 1,
    entries: { a: { version: "1.0.0", rules: { base: { "text-decoration-line": { kind: "choice", value: "none" } } } } },
  }));
  const loaded = loadFrameworkPreferences({ storage, catalog, tokenRegistry });
  assert.equal(loaded.elementDiffs.schemaVersion, 2);
  assert.deepEqual(loaded.elementDiffs.entries.a.rules["a/base"]["text-decoration-line"], { kind: "choice", value: "none" });
  const controller = createFrameworkController(input(), { storage, catalog });
  controller.select("a", "base", "text-decoration-line", { kind: "choice", value: "underline" });
  assert.equal(values.has("techies-tools:framework:element-diffs:v1"), false);
});

test("v1 declaration drafts migrate to absolute Rule Paths and rewrite on the next valid edit", () => {
  const { values, storage } = memoryStorage();
  values.set("techies-tools:framework:rule-drafts:v1", JSON.stringify({
    schemaVersion: 1,
    entries: { button: { hover: "background-color: var(--semantic-primary);" } },
  }));
  const loaded = loadRuleDrafts({ storage, catalog });
  assert.equal(loaded.schemaVersion, 2);
  assert.equal(loaded.entries.button["button/hover"], "background-color: var(--semantic-primary);");
  saveRuleDraft("button", "button/hover", "background-color: var(--semantic-action);", { storage, catalog });
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(JSON.parse(values.get("techies-tools:framework:rule-drafts:v2")).entries.button["button/hover"], "background-color: var(--semantic-action);");
});

test("stored differences revalidate across backward-compatible Treatment versions and quarantine major changes", () => {
  const base = { ...catalog.get("a"), definition: catalog.get("a").definition };
  const stored = {
    schemaVersion: 2,
    entries: { a: { version: "1.0.0", rules: { "a/base": { "text-decoration-line": { kind: "choice", value: "none" } } } } },
  };
  const minor = migrateStoredOverrides(stored, [{ ...base, version: "1.1.0" }], tokenRegistry);
  assert.equal(minor.diagnostics.length, 0);
  assert.equal(minor.store.entries.a.version, "1.1.0");
  const major = migrateStoredOverrides(stored, [{ ...base, version: "2.0.0" }], tokenRegistry);
  assert.ok(major.diagnostics.some((item) => item.code === "element-store.version"));
  assert.equal(major.store.entries.a, undefined);
});

test("controller edits a generic Rule Path, persists once, and reloads exact source", () => {
  const { storage } = memoryStorage();
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: tokens }, { storage, catalog });
  const source = "background-color: var(--semantic-primary);";
  const changed = controller.editRuleDeclarations("button", "hover", source);
  assert.equal(changed.artifacts.elements.available, true, JSON.stringify(changed.diagnostics));
  assert.match(changed.artifacts.elements.value.value, /background-color: var\(--semantic-primary\)/);
  const reloaded = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: tokens }, { storage, catalog });
  assert.equal(reloaded.ruleDeclarationSource("button", "hover").data, source);
});

test("source that escapes the locked declaration boundary retains the last valid Preview and CSS", () => {
  const { storage } = memoryStorage();
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: tokens }, { storage, catalog });
  const before = controller.current().preview.value.css;
  const beforeElements = controller.current().artifacts.elements.value.value;
  const invalid = controller.editRuleDeclarations("button", "hover", "background-color: red; } body { color: blue;");
  assert.equal(invalid.preview.available, true);
  assert.equal(invalid.preview.value.css, before);
  assert.equal(invalid.artifacts.elements.available, true);
  assert.equal(invalid.artifacts.elements.value.value, beforeElements);
  assert.ok(invalid.diagnostics.some((item) => item.code.startsWith("authoring.")));
});

test("validated CSS-source rules retain arbitrary declarations when a contrast repair is accepted", () => {
  const { values, storage } = memoryStorage();
  const controller = createFrameworkController({
    ...input(),
    primitiveDefaults: { ...primitiveDefaults, "semantic.action": "#ffffff", "semantic.surface": "#ffffff" },
  }, { storage, catalog });
  const original = controller.ruleDeclarationSource("button", "base");
  assert.equal(original.success, true);
  const editedSource = original.data
    .replace("color: var(--semantic-surface);", "COLOR: var(--semantic-surface) !important;\ncolor: var(--semantic-text);")
    .replace("border-style: solid;", "border-style: dashed;");
  const edited = controller.editRuleDeclarations("button", "base", `${editedSource}\ntransform: translateY(-1px);`);
  const advisory = edited.accessibilityAdvisories.find((item) => item.id === "button-base-text");
  assert.ok(advisory);
  assert.ok(advisory.repairs.length > 0);
  const before = edited.artifacts.elements.value.value;
  const repair = advisory.repairs.find((item) => item.property === "color");
  assert.ok(repair);
  const repaired = controller.acceptAccessibilityRepair(repair);
  assert.equal(repaired.artifacts.elements.available, true);
  assert.notEqual(repaired.artifacts.elements.value.value, before);
  assert.match(repaired.artifacts.elements.value.value, /transform: translateY\(-1px\)/);
  assert.match(repaired.artifacts.elements.value.value, /color: var\(--semantic-text\);/);
  assert.match(repaired.artifacts.elements.value.value, new RegExp(`COLOR: var\\(--${repair.tokenId.replace(".", "-")}\\) !important;`));
  assert.equal(repaired.accessibilityAdvisories.some((item) => item.id === "button-base-text"), false);
  const persisted = JSON.parse(values.get("techies-tools:framework:element-diffs:v2"));
  assert.match(persisted.entries.button.css["button/base"], /transform: translateY\(-1px\)/);
  assert.match(persisted.entries.button.css["button/base"], /!important/);
});
