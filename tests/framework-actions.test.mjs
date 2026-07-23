import assert from "node:assert/strict";
import test from "node:test";
import { compileFramework, primitiveTokensFromSnapshot, resolvedColorSwatch } from "../src/framework/compiler/index.ts";
import { matchingSerializedSelectedValue, parseElementDefinition, migrateStoredOverrides, selectedValueIsAllowed } from "../src/framework/model/index.ts";
import { nextRuleSelections, resetElement, saveElementSelection } from "../src/framework/preferences/index.ts";
import { createFrameworkController, valueForControl } from "../src/framework/controller/index.ts";
import { completionTokensFor } from "../src/framework/controller/completion-tokens.ts";
import { completeRuleDeclaration, parseRuleDeclarations, serializeRuleDeclarations } from "../src/framework/actions-authoring/index.ts";

const token = (name, options = [name]) => ({ label: name, control: { kind: "token", families: ["semantic", "color"], options: options.map((item) => ({ family: "semantic", name: item })) }, starter: { kind: "token", family: "semantic", name } });
const familyToken = (family, name) => ({ label: name, control: { kind: "token", families: [family], options: [{ family, name }] }, starter: { kind: "token", family, name } });
const choice = (value, label = value) => ({ label, control: { kind: "choice", options: [{ value, label }] }, starter: { kind: "choice", value } });
const choices = (value, options) => ({ label: value, control: { kind: "choice", options: options.map((item) => ({ value: item, label: item })) }, starter: { kind: "choice", value } });
const length = (value, allowNegative = false) => ({ label: value, control: { kind: "length", ...(allowNegative ? { allowNegative: true } : { keywords: ["thin", "medium", "thick"] }) }, starter: { kind: "length", value } });
const omittedToken = (family, name) => ({ ...familyToken(family, name), starter: { kind: "omit" }, allowOmit: true });
const focusStyles = ["auto", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];
const borderStyles = ["solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"];
const link = {
  id: "a", title: "Link", group: "Actions", tags: ["a"], kind: "actions", order: 360,
  version: "1.0.0", baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/a", checkedAt: "2026-07-16" },
  deprecated: false, promoted: true, accessibilityPassed: true, sourceUrl: "https://developer.mozilla.org/a",
  purpose: "Navigate to a destination.", treatment: "Use reviewed token-backed link differences.", use: ["Use a real href."], avoid: "Do not use links for actions.",
  constraints: ["No nested interactive content."], accessibility: ["Preserve Enter activation and visible focus."], semanticHtml: '<a href="/">Home</a>',
  variants: [{ name: "quiet", when: "Use for supporting links." }], defaultVariant: "default",
  definition: { schemaVersion: 1, rules: [
    { id: "base", kind: "base", selector: ":where(a[href])", declarations: { color: token("text"), "text-decoration-line": { label: "Underline", control: { kind: "choice", options: [{ value: "underline", label: "Show" }, { value: "none", label: "Hide" }] }, starter: { kind: "choice", value: "underline" } } } },
    { id: "hover", kind: "state", state: "hover", selector: ":where(a[href]:hover)", declarations: { color: token("text") } },
    { id: "focus-visible", kind: "state", state: "focus-visible", selector: ":where(a[href]:focus-visible)", declarations: { "outline-color": token("focus"), "outline-style": choices("solid", focusStyles), "outline-width": length("2px"), "outline-offset": length("2px", true) } },
    { id: "active", kind: "state", state: "active", selector: ":where(a[href]:active)", declarations: { color: token("text") } },
    { id: "quiet", kind: "variant", variant: "quiet", when: "Use for supporting links.", selector: ':where(a[href][data-variant="quiet"])', declarations: { "text-decoration-line": choice("none") } },
  ], relationships: [{ id: "link-in-navigation", elements: ["a", "nav"], when: "Mark current navigation destination.", semanticHtml: '<nav><a href="/" aria-current="page">Home</a></nav>', rules: [
    { id: "current", kind: "base", targetElement: "a", selector: ':where(nav a[aria-current="page"])', declarations: { "text-decoration-line": choice("underline") } },
  ] }], specimens: [
    { id: "default", label: "Link", semanticHtml: '<a href="/">Home</a>', demonstrates: ["base", "hover", "focus-visible", "active"] },
    { id: "navigation", label: "Current", semanticHtml: '<nav><a href="/" aria-current="page">Home</a></nav>', demonstrates: ["link-in-navigation/current"], relationship: "link-in-navigation" },
  ] },
};
const button = {
  id: "button", title: "Button", group: "Actions", tags: ["button"], kind: "native", order: 370,
  version: "1.0.0", baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/button", checkedAt: "2026-07-16" },
  deprecated: false, promoted: true, accessibilityPassed: true, sourceUrl: "https://developer.mozilla.org/button",
  purpose: "Execute an action.", treatment: "Use reviewed token-backed button differences.", use: ["Set an explicit type."], avoid: "Do not use buttons for navigation.",
  constraints: ["Use an explicit type."], accessibility: ["Preserve native keyboard activation and visible focus."], semanticHtml: '<button type="button">Save</button>',
  variants: [{ name: "secondary", when: "Use for a lower-priority action." }], defaultVariant: "default",
  definition: { schemaVersion: 1, rules: [
    { id: "base", kind: "base", selector: ":where(button:not([disabled]))", declarations: { color: token("surface", ["surface", "text"]), "background-color": token("action", ["action", "primary"]), "font-size": familyToken("typography", "m"), "border-color": token("border"), "border-style": choices("solid", borderStyles), "border-width": length("1px"), "border-radius": familyToken("radius", "m"), "margin-block-start": omittedToken("spacing", "s"), "margin-block-end": omittedToken("spacing", "s"), "margin-inline-start": omittedToken("spacing", "s"), "margin-inline-end": omittedToken("spacing", "s"), "padding-block-start": familyToken("spacing", "3xs"), "padding-block-end": familyToken("spacing", "3xs"), "padding-inline-start": familyToken("spacing", "s"), "padding-inline-end": familyToken("spacing", "s") } },
    { id: "hover", kind: "state", state: "hover", selector: ":where(button:not([disabled]):hover)", declarations: { "background-color": token("primary", ["primary", "action"]) } },
    { id: "focus-visible", kind: "state", state: "focus-visible", selector: ":where(button:focus-visible)", declarations: { "outline-color": token("focus"), "outline-style": choices("solid", focusStyles), "outline-width": length("2px"), "outline-offset": length("2px", true) } },
    { id: "active", kind: "state", state: "active", selector: ":where(button:not([disabled]):active)", declarations: { "background-color": token("action") } },
    { id: "disabled", kind: "state", state: "disabled", selector: ":where(button:disabled)", declarations: { color: token("text") } },
    { id: "secondary", kind: "variant", variant: "secondary", when: "Use for a lower-priority action.", selector: ':where(button[data-variant="secondary"])', declarations: { color: token("text"), "background-color": token("surface") } },
  ], specimens: [
    { id: "default", label: "Button", semanticHtml: '<button type="button">Save</button>', demonstrates: ["base", "hover", "focus-visible", "active", "disabled"] },
    { id: "secondary", label: "Secondary", semanticHtml: '<button type="button" data-variant="secondary">Cancel</button>', demonstrates: ["secondary"] },
  ] },
};
const primitives = { "semantic.primary": "#1d4ed8", "semantic.action": "#2563eb", "semantic.surface": "#ffffff", "semantic.text": "#111827", "semantic.border": "#c7d2fe", "semantic.focus": "#2563eb", "typography.m": "1rem", "radius.m": "0.5rem", "spacing.3xs": "0.5rem", "spacing.s": "0.75rem" };
const input = () => ({ definitions: [structuredClone(link), structuredClone(button)], primitiveDefaults: primitives, identity: { id: "techies", name: "Techies Framework" }, sourceRevision: "test", contextSchemaVersion: "1" });
const memoryStorage = () => { const values = new Map(); return { values, storage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) } }; };
const snapshot = (action = "#2563eb") => ({
  semantics: Object.fromEntries(Object.entries({ primary: "#1d4ed8", action, surface: "#ffffff", text: "#111827", border: "#c7d2fe", focus: "#2563eb" }).map(([role, value]) => [role, { role, reference: value, value, variable: `--semantic-${role}` }])),
  spacing: { name: "spacing", tokens: [{ token: "3xs", min: 0.5, max: 0.5 }, { token: "s", min: 0.75, max: 0.75 }], minWidth: 20, maxWidth: 90 },
  type: { label: "typography", min: "1", max: "1", minRatio: "1.2", maxRatio: "1.2", baseIndex: "m", minWidth: 20, maxWidth: 90, tokens: [{ token: "m", min: 1, max: 1 }] },
  radii: { name: "radius", tokens: [{ token: "m", min: 0.5, max: 0.5 }], minWidth: 20, maxWidth: 90 },
});

const authoringTokens = [
  { id: "semantic.action", cssName: "--brand-action", value: "#2563eb", type: "color" },
  { id: "semantic.primary", cssName: "--brand-primary", value: "#1d4ed8", type: "color" },
  { id: "semantic.surface", cssName: "--surface", value: "#ffffff", type: "color" },
  { id: "semantic.text", cssName: "--text", value: "#111827", type: "color" },
  { id: "semantic.border", cssName: "--border", value: "#c7d2fe", type: "color" },
  { id: "semantic.focus", cssName: "--focus", value: "#2563eb", type: "color" },
  { id: "color.brand.dark", cssName: "--brand-dark", value: "#123456", type: "color" },
  { id: "typography.m", cssName: "--type-m", value: "1rem", type: "dimension" },
  { id: "radius.m", cssName: "--radius-m", value: "0.5rem", type: "dimension" },
  { id: "spacing.3xs", cssName: "--space-3xs", value: "0.5rem", type: "dimension" },
  { id: "spacing.s", cssName: "--space-s", value: "0.75rem", type: "dimension" },
];

test("Actions declarations parse and serialize canonically without exposing selectors", () => {
  const serialized = serializeRuleDeclarations({ definition: button, ruleId: "base", tokens: authoringTokens });
  assert.equal(serialized.success, true, JSON.stringify(serialized.diagnostics));
  assert.equal(serialized.data, [
    "color: var(--surface);",
    "background-color: var(--brand-action);",
    "font-size: var(--type-m);",
    "border-color: var(--border);",
    "border-style: solid;",
    "border-width: 1px;",
    "border-radius: var(--radius-m);",
    "padding-block-start: var(--space-3xs);",
    "padding-block-end: var(--space-3xs);",
    "padding-inline-start: var(--space-s);",
    "padding-inline-end: var(--space-s);",
  ].join("\n"));

  const parsed = parseRuleDeclarations({ definition: button, ruleId: "base", source: serialized.data, tokens: authoringTokens });
  assert.equal(parsed.success, true, JSON.stringify(parsed.diagnostics));
  assert.deepEqual(parsed.data.values["background-color"], { kind: "token", family: "semantic", name: "action" });
  for (const property of ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"]) {
    assert.deepEqual(parsed.data.values[property], { kind: "omit" });
  }
  assert.equal(parseRuleDeclarations({ definition: link, ruleId: "link-in-navigation/current", source: "text-decoration-line: underline;", tokens: authoringTokens }).success, true);

  for (const [definition, ruleIds] of [
    [link, ["base", "hover", "focus-visible", "active", "quiet", "link-in-navigation/current"]],
    [button, ["base", "hover", "focus-visible", "active", "disabled", "secondary"]],
  ]) {
    for (const ruleId of ruleIds) {
      const authored = serializeRuleDeclarations({ definition, ruleId, tokens: authoringTokens });
      assert.equal(authored.success, true, `${definition.id}/${ruleId}: ${JSON.stringify(authored.diagnostics)}`);
      const roundTrip = parseRuleDeclarations({ definition, ruleId, source: authored.data, tokens: authoringTokens });
      assert.equal(roundTrip.success, true, `${definition.id}/${ruleId}: ${JSON.stringify(roundTrip.diagnostics)}`);
    }
  }
});

test("Actions declaration parsing is atomic and returns actionable checklist diagnostics", () => {
  const invalidSources = [
    ":where(button) { color: var(--surface); }",
    "color: ;",
    "@media (width > 10px) { color: red; }",
    "background: url(https://example.com/a.png);",
  ];
  for (const source of invalidSources) {
    const parsed = parseRuleDeclarations({ definition: button, ruleId: "base", source, tokens: authoringTokens });
    assert.equal(parsed.success, false, source);
    assert.equal("data" in parsed, false, source);
    assert.ok(parsed.diagnostics.every((item) => item.message.length > 0 && item.repair.length > 0), source);
    assert.ok(parsed.diagnostics.some((item) => Array.isArray(item.checklist) && item.checklist.length > 0), source);
  }
});

test("valid CSS outside a state property recommendation is accepted", () => {
  const parsed = parseRuleDeclarations({ definition: button, ruleId: "hover", source: "border: 1px solid red;", tokens: authoringTokens });
  assert.equal(parsed.success, true, JSON.stringify(parsed.diagnostics));
  assert.equal(parsed.data.source, "border: 1px solid red;");
});

test("locked declaration authoring accepts standards-valid CSS beyond reviewed recommendations", () => {
  const source = [
    "border: 2px solid rebeccapurple;",
    "background: linear-gradient(red, blue);",
    "padding: 1rem 2rem;",
    "padding-top: 3px;",
    "padding-inline: 4px 5px;",
    "-webkit-user-select: none;",
    "--button-gap: 1rem;",
    "color: rebeccapurple !important;",
    'content: "@{";',
  ].join("\n");
  const parsed = parseRuleDeclarations({ definition: button, ruleId: "hover", source, tokens: authoringTokens });
  assert.equal(parsed.success, true, JSON.stringify(parsed.diagnostics));
  assert.equal(parsed.data.source, source.replace("linear-gradient(red, blue)", "linear-gradient(red,blue)"));
  assert.deepEqual(parsed.data.declarations.map(({ property, value, important }) => ({ property, value, important })), [
    { property: "border", value: "2px solid rebeccapurple", important: false },
    { property: "background", value: "linear-gradient(red,blue)", important: false },
    { property: "padding", value: "1rem 2rem", important: false },
    { property: "padding-top", value: "3px", important: false },
    { property: "padding-inline", value: "4px 5px", important: false },
    { property: "-webkit-user-select", value: "none", important: false },
    { property: "--button-gap", value: "1rem", important: false },
    { property: "color", value: "rebeccapurple", important: true },
    { property: "content", value: '"@{"', important: false },
  ]);
});

test("layout declarations warn without blocking while external-resource CSS is rejected", () => {
  for (const source of ["display: grid;", "display: flex;", "grid-template-columns: 1fr 1fr;"]) {
    const parsed = parseRuleDeclarations({ definition: button, ruleId: "base", source, tokens: authoringTokens });
    assert.equal(parsed.success, true, source);
    assert.ok(parsed.diagnostics.some((item) => item.code === "authoring.layout-risk" && item.severity === "warning"), source);
  }
  for (const source of [
    "background: url(https://example.com/a.png);",
    "background-image: image-set(url('/a.png') 1x);",
    "src: url(https://example.com/font.woff2);",
  ]) {
    const parsed = parseRuleDeclarations({ definition: button, ruleId: "base", source, tokens: authoringTokens });
    assert.equal(parsed.success, false, source);
    assert.ok(parsed.diagnostics.some((item) => item.code === "authoring.external-resource"), source);
  }
});

test("arbitrary declaration drafts persist atomically and Reset clears draft plus applied override", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const controller = make();
  const validSource = ["border: 2px solid red;", "padding: 1rem 2rem;", "display: grid;"].join("\n");
  const valid = controller.editRuleDeclarations("button", "hover", validSource);
  assert.equal(valid.artifacts.elements.available, true, JSON.stringify(valid.diagnostics));
  assert.match(valid.preview.value.css, /border: 2px solid red;/);
  assert.match(valid.artifacts.elements.value.value, /padding: 1rem 2rem;/);
  assert.match(valid.artifacts.context.value.value, /display: grid;/);
  assert.ok(valid.diagnostics.some((item) => item.severity === "warning"));
  const stored = JSON.parse(values.get("techies-tools:framework:element-diffs:v1"));
  assert.equal(stored.entries.button.css.hover, validSource);

  const beforeHash = valid.identity.contentHash;
  const beforePreview = valid.preview.value.css;
  const invalidSource = "border: 4px solid blue;\ncolor: ;";
  const invalid = controller.editRuleDeclarations("button", "hover", invalidSource);
  assert.equal(invalid.artifacts.elements.available, false);
  assert.equal(invalid.identity.contentHash, beforeHash);
  assert.equal(invalid.preview.value.css, beforePreview);
  assert.doesNotMatch(invalid.preview.value.css, /4px solid blue/);
  assert.equal(controller.ruleDeclarationSource("button", "hover").data, invalidSource);
  assert.equal(JSON.parse(values.get("techies-tools:framework:rule-drafts:v1")).entries.button.hover, invalidSource);

  const reloaded = make();
  assert.equal(reloaded.ruleDeclarationSource("button", "hover").data, invalidSource);
  assert.match(reloaded.current().preview.value.css, /border: 2px solid red;/);
  assert.ok(reloaded.current().diagnostics.some((item) => item.code === "authoring.value"));
  assert.equal(reloaded.current().artifacts.elements.available, false);
  assert.equal(reloaded.validateForExport().artifacts.elements.available, false);
  assert.equal(reloaded.ruleDeclarationSource("button", "hover").data, invalidSource);
  reloaded.resetElement("button");
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(values.has("techies-tools:framework:element-diffs:v1"), false);
  assert.match(reloaded.ruleDeclarationSource("button", "hover").data, /background-color: var\(--brand-primary\);/);
});

test("valid declaration source survives persistence and state roundtrips byte-for-byte", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const source = "padding: 1px;\ntext-decoration-line:  underline;";
  const controller = make();

  const edited = controller.editRuleDeclarations("a", "base", source);
  assert.equal(edited.artifacts.elements.available, true, JSON.stringify(edited.diagnostics));
  assert.equal(controller.ruleDeclarationSource("a", "base").data, source);
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.a.css.base, source);
  assert.equal(make().ruleDeclarationSource("a", "base").data, source);
});

test("a canonical-valid declaration source survives textarea blur and reload byte-for-byte", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const source = "padding: 1px;";

  const controller = make();
  const edited = controller.editRuleDeclarations("a", "base", source);
  assert.equal(edited.artifacts.elements.available, true, JSON.stringify(edited.diagnostics));
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.a.css.base, source);
  assert.equal(make().ruleDeclarationSource("a", "base").data, source);
});

test("a valid blur commit replaces an older invalid draft before reload", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const invalidSource = "padding: 1p;";
  const source = "padding: 1px;";
  const controller = make();

  assert.equal(controller.editRuleDeclarations("a", "base", invalidSource).artifacts.elements.available, false);
  assert.equal(controller.editRuleDeclarations("a", "base", source).artifacts.elements.available, true);
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.a.css.base, source);
  assert.equal(make().ruleDeclarationSource("a", "base").data, source);
});

test("formatting-only Starter source does not persist an applied CSS difference", () => {
  const { values, storage } = memoryStorage();
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const starter = controller.ruleDeclarationSource("a", "base");
  assert.equal(starter.success, true, JSON.stringify(starter.diagnostics));
  const formattedStarter = starter.data.replace("color: var(--text);", "color:  var(--text);");

  const edited = controller.editRuleDeclarations("a", "base", formattedStarter);
  assert.equal(edited.artifacts.elements.available, true, JSON.stringify(edited.diagnostics));
  assert.equal(values.has("techies-tools:framework:element-diffs:v1"), false);
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
});

test("valid source replaces an invalid draft even while unrelated compiler channels are incomplete", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens, primitiveValid: false }, { storage, definitions: [link, button] });
  const controller = make();

  assert.equal(controller.editRuleDeclarations("a", "base", "padding: 1p;").artifacts.elements.available, false);
  const valid = controller.editRuleDeclarations("a", "base", "padding: 1px;");
  assert.equal(valid.artifacts.elements.available, false);
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.a.css.base, "padding: 1px;");
  assert.equal(make().ruleDeclarationSource("a", "base").data, "padding: 1px;");
});

test("valid source persists and clears its invalid draft when unrelated saved CSS is quarantined", () => {
  const { values, storage } = memoryStorage();
  const make = () => createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  values.set("techies-tools:framework:element-diffs:v1", JSON.stringify({ schemaVersion: 1, entries: {
    a: { version: "1.0.0", rules: { base: { color: { kind: "token", family: "color", name: "obsolete" } } } },
    button: { version: "1.0.0", rules: {}, css: { hover: "color: ;" } },
  } }));
  values.set("techies-tools:framework:rule-drafts:v1", JSON.stringify({ schemaVersion: 1, entries: { a: { base: "padding: 1p;" } } }));

  const controller = make();
  const valid = controller.editRuleDeclarations("a", "base", "padding: 1px;");
  assert.equal(valid.artifacts.elements.available, true, JSON.stringify(valid.diagnostics));
  assert.equal(values.has("techies-tools:framework:rule-drafts:v1"), false);
  const stored = JSON.parse(values.get("techies-tools:framework:element-diffs:v1"));
  assert.equal(stored.entries.a.css.base, "padding: 1px;");
  assert.deepEqual(stored.entries.a.rules, {});
  assert.equal(stored.entries.button, undefined);
  assert.equal(make().ruleDeclarationSource("a", "base").data, "padding: 1px;");
});

test("Context fences arbitrary declaration backticks without breaking Markdown", () => {
  const { storage } = memoryStorage();
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const source = ['content: "```";', '--code-fence: "````";'].join("\n");
  const compilation = controller.editRuleDeclarations("button", "hover", source);
  assert.equal(compilation.artifacts.context.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.context.value.value, /`````css\n/);
  assert.match(compilation.artifacts.context.value.value, /content: "```";/);
  assert.match(compilation.artifacts.context.value.value, /--code-fence: "````";/);
});

test("Actions declaration grammar accepts standards-valid CSS values", () => {
  const valid = [
    "outline-color: var(--focus);",
    "outline-style: dashed;",
    "outline-width: 2ch;",
    "outline-offset: -3vw;",
  ].join("\n");
  assert.equal(parseRuleDeclarations({ definition: button, ruleId: "focus-visible", source: valid, tokens: authoringTokens }).success, true);
  assert.equal(parseRuleDeclarations({ definition: button, ruleId: "focus-visible", source: valid.replace("2ch", "calc(1px + 1rem)"), tokens: authoringTokens }).success, true);
  assert.equal(parseRuleDeclarations({ definition: button, ruleId: "focus-visible", source: valid.replace("2ch", "10%"), tokens: authoringTokens }).success, false);
  assert.equal(parseRuleDeclarations({ definition: button, ruleId: "focus-visible", source: valid.replace("2ch", "2wat"), tokens: authoringTokens }).success, false);
});

test("Actions completion keeps property order and ranks reviewed token scope first", () => {
  const properties = completeRuleDeclaration({ definition: button, ruleId: "base", source: "", offset: 0, tokens: authoringTokens });
  assert.ok(Object.keys(button.definition.rules[0].declarations).every((property) => properties.some((item) => item.label === property)));
  assert.deepEqual(completeRuleDeclaration({ definition: button, ruleId: "base", source: "bac", offset: 3, tokens: authoringTokens }).slice(0, 6).map((item) => item.label), [
    "background",
    "background-color",
    "background-image",
    "background-position",
    "background-size",
    "background-repeat",
  ]);

  const source = "background-color: --";
  const values = completeRuleDeclaration({ definition: button, ruleId: "base", source, offset: source.length, tokens: authoringTokens });
  assert.deepEqual(values.slice(0, 7).map((item) => item.label), ["--brand-action", "--brand-primary", "--brand-dark", "--border", "--focus", "--surface", "--text"]);
  assert.deepEqual(values.slice(0, 2).map((item) => item.group), ["scope", "scope"]);
  assert.ok(values.slice(2).every((item) => item.group === "available"));
  assert.deepEqual(values[0], {
    kind: "token",
    label: "--brand-action",
    insertText: "var(--brand-action)",
    detail: "#2563eb",
    resolvedValue: "#2563eb",
    swatch: "#2563eb",
    tokenId: "semantic.action",
    group: "scope",
  });
  assert.equal(values.some((item) => item.tokenId === "spacing.s"), true);

  const radiusSource = "border-radius: --";
  const radiusValues = completeRuleDeclaration({ definition: button, ruleId: "base", source: radiusSource, offset: radiusSource.length, tokens: authoringTokens });
  const radius = radiusValues.find((item) => item.kind === "token" && item.tokenId === "radius.m");
  assert.deepEqual(radius, {
    kind: "token",
    label: "--radius-m",
    insertText: "var(--radius-m)",
    detail: "0.5rem",
    resolvedValue: "0.5rem",
    tokenId: "radius.m",
    group: "scope",
  });

  const arbitrary = "background: --";
  const arbitraryValues = completeRuleDeclaration({ definition: button, ruleId: "hover", source: arbitrary, offset: arbitrary.length, tokens: authoringTokens });
  assert.deepEqual(arbitraryValues.slice(0, 7).map((item) => item.tokenId), [
    "color.brand.dark",
    "semantic.action",
    "semantic.border",
    "semantic.focus",
    "semantic.primary",
    "semantic.surface",
    "semantic.text",
  ]);
  assert.ok(arbitraryValues.slice(0, 7).every((item) => item.kind === "token" && item.swatch));
  assert.ok(arbitraryValues.some((item) => item.tokenId === "spacing.s"));

  const choices = completeRuleDeclaration({ definition: link, ruleId: "base", source: "text-decoration-line: n", offset: 23, tokens: authoringTokens });
  assert.deepEqual(choices, [{ kind: "choice", label: "none", insertText: "none", detail: "Hide" }]);
  const withoutDeclared = completeRuleDeclaration({ definition: link, ruleId: "base", source: "color: var(--text);\n", offset: 20, tokens: authoringTokens });
  assert.equal(withoutDeclared[0].label, "text-decoration-line");
  assert.equal(withoutDeclared.some((item) => item.label === "color"), false);

  const laterDeclaration = "\nbackground-color: var(--brand-action);";
  const beforeLater = completeRuleDeclaration({ definition: button, ruleId: "base", source: laterDeclaration, offset: 0, tokens: authoringTokens });
  assert.equal(beforeLater.some((item) => item.label === "background-color"), false);
  const partialBeforeLater = `bac;${laterDeclaration}`;
  assert.equal(completeRuleDeclaration({ definition: button, ruleId: "base", source: partialBeforeLater, offset: 3, tokens: authoringTokens }).some((item) => item.label === "background-color"), false);
  const editingCurrent = "background-color: var(--brand-action);\ncolor: var(--surface);";
  assert.deepEqual(completeRuleDeclaration({ definition: button, ruleId: "base", source: editingCurrent, offset: 3, tokens: authoringTokens }).slice(0, 2).map((item) => item.label), ["background", "background-color"]);
  const vendorAndCustom = "-webkit-user-select: none;\n--button-gap: 1rem;\nbac";
  assert.equal(completeRuleDeclaration({ definition: button, ruleId: "base", source: vendorAndCustom, offset: vendorAndCustom.length, tokens: authoringTokens }).some((item) => item.label === "background"), true);
});

test("Actions completion preserves shorthand text while completing trailing token and border-style keyword fragments", () => {
  const shorthand = "border: 1px solid --brand-";
  const tokens = completeRuleDeclaration({ definition: button, ruleId: "base", source: shorthand, offset: shorthand.length, tokens: authoringTokens });
  assert.deepEqual(tokens.slice(0, 3).map((item) => item.label), ["--brand-dark", "--brand-action", "--brand-primary"]);
  assert.ok(tokens.slice(0, 3).every((item) => item.kind === "token" && item.swatch));
  assert.equal(tokens[0].insertText, "var(--brand-dark)");

  const shorthandKeyword = "border: 1px so";
  assert.deepEqual(completeRuleDeclaration({ definition: button, ruleId: "base", source: shorthandKeyword, offset: shorthandKeyword.length, tokens: authoringTokens }), [
    { kind: "choice", label: "solid", insertText: "solid", detail: "Border style keyword" },
  ]);
  const longhandKeyword = "border-style: do";
  assert.deepEqual(completeRuleDeclaration({ definition: button, ruleId: "base", source: longhandKeyword, offset: longhandKeyword.length, tokens: authoringTokens }), [
    { kind: "choice", label: "dotted", insertText: "dotted", detail: "Border style keyword" },
    { kind: "choice", label: "double", insertText: "double", detail: "Border style keyword" },
  ]);
});

test("Actions completion keeps generated color tokens while an invalid draft retains the last valid treatment compilation", () => {
  const controller = createFrameworkController(input(), { definitions: [link, button] });
  controller.editRuleDeclarations("a", "base", "borde");
  const snapshot = {
    colors: [{ name: "Red", value: "#dc2626", scale: ["#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#dc2626", "#b91c1c", "#991b1b"], variable: "--color-red" }],
    semantics: { primary: { role: "primary", reference: "--color-red", value: "#dc2626", variable: "--semantic-primary" } },
    type: { label: "text", min: "1rem", max: "1rem", minRatio: "1", maxRatio: "1", baseIndex: "m", minWidth: 20, maxWidth: 90 },
    radii: { name: "radius", tokens: [{ token: "m", min: .5, max: .5 }], minWidth: 20, maxWidth: 90 },
    spacing: { name: "space", tokens: [{ token: "s", min: .75, max: .75 }], minWidth: 20, maxWidth: 90 },
  };
  const fallback = controller.updatePrimitives(snapshot).resolved.primitives;
  assert.equal(fallback.some((token) => token.cssName === "--color-red"), true);
  assert.match(controller.current().artifacts.tokens.value.value, /--color-red: #dc2626/);
  assert.equal(controller.current().artifacts.tokens.value.contentHash, controller.current().identity.contentHash);
  const source = "border: 1px solid --color-r";
  const items = completeRuleDeclaration({ definition: link, ruleId: "base", source, offset: source.length, tokens: completionTokensFor(snapshot, fallback) });
  assert.equal(items[0]?.label, "--color-red");
});

test("Actions token completion searches variable-name substrings while retaining deterministic compatible ranking", () => {
  const tokens = [
    { id: "color.red", cssName: "--color-red", value: "#dc2626", type: "color" },
    { id: "semantic.red", cssName: "--semantic-red", value: "#ef4444", type: "color" },
    { id: "typography.xl", cssName: "--text-xl", value: "2rem", type: "dimension" },
    { id: "spacing.xl", cssName: "--space-xl", value: "2rem", type: "dimension" },
    { id: "radius.xl", cssName: "--radius-xl", value: "1rem", type: "dimension" },
  ];
  const redSource = "border: 1px solid --red";
  assert.deepEqual(completeRuleDeclaration({ definition: link, ruleId: "base", source: redSource, offset: redSource.length, tokens }).map((item) => item.label), ["--color-red", "--semantic-red"]);

  const xlSource = "padding: --xl";
  assert.deepEqual(completeRuleDeclaration({ definition: button, ruleId: "base", source: xlSource, offset: xlSource.length, tokens }).map((item) => item.label), ["--radius-xl", "--space-xl", "--text-xl"]);

  const allSource = "border: --";
  assert.deepEqual(completeRuleDeclaration({ definition: link, ruleId: "base", source: allSource, offset: allSource.length, tokens }).map((item) => item.label), ["--color-red", "--semantic-red", "--radius-xl", "--space-xl", "--text-xl"]);
});

test("whole-rule preferences validate one atomic candidate and prune starter or omitted values", () => {
  const registry = new Map(authoringTokens.map((item) => [item.id, item.type]));
  const starter = parseRuleDeclarations({
    definition: button,
    ruleId: "base",
    source: serializeRuleDeclarations({ definition: button, ruleId: "base", tokens: authoringTokens }).data,
    tokens: authoringTokens,
  });
  assert.equal(starter.success, true);
  const changedValues = {
    ...starter.data.values,
    "background-color": { kind: "token", family: "semantic", name: "primary" },
    "margin-inline-start": { kind: "token", family: "spacing", name: "s" },
  };
  const changed = nextRuleSelections({ schemaVersion: 1, entries: {} }, button, "base", changedValues, registry);
  assert.equal(changed.success, true, JSON.stringify(changed.diagnostics));
  assert.deepEqual(changed.store.entries.button.rules.base, {
    "background-color": { kind: "token", family: "semantic", name: "primary" },
    "margin-inline-start": { kind: "token", family: "spacing", name: "s" },
  });

  const pruned = nextRuleSelections(changed.store, button, "base", starter.data.values, registry);
  assert.equal(pruned.success, true);
  assert.deepEqual(pruned.store, { schemaVersion: 1, entries: {} });

  const missing = { ...starter.data.values };
  delete missing.color;
  const rejected = nextRuleSelections(changed.store, button, "base", missing, registry);
  assert.equal(rejected.success, false);
  assert.deepEqual(changed.store.entries.button.rules.base, {
    "background-color": { kind: "token", family: "semantic", name: "primary" },
    "margin-inline-start": { kind: "token", family: "spacing", name: "s" },
  });
});

test("controller edits one complete rule atomically and exposes canonical current source", () => {
  const { values, storage: memory } = memoryStorage();
  let writes = 0;
  const storage = { ...memory, setItem: (key, value) => { writes += 1; memory.setItem(key, value); } };
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens: authoringTokens }, { storage, definitions: [link, button] });
  const initial = controller.ruleDeclarationSource("button", "base");
  assert.equal(initial.success, true, JSON.stringify(initial.diagnostics));
  assert.match(initial.data, /background-color: var\(--brand-action\);/);

  const validSource = initial.data.replace("background-color: var(--brand-action);", "background-color: var(--brand-primary);");
  const valid = controller.editRuleDeclarations("button", "base", validSource);
  assert.equal(valid.artifacts.elements.available, true, JSON.stringify(valid.diagnostics));
  assert.equal(writes, 1);
  assert.match(valid.preview.value.css, /background-color: var\(--brand-primary\)/);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.button.css.base, validSource);
  assert.equal(controller.ruleDeclarationSource("button", "base").data, validSource);

  const beforeHash = valid.identity.contentHash;
  const beforePreview = valid.preview.value.css;
  const beforeStorage = values.get("techies-tools:framework:element-diffs:v1");
  const invalidSecond = validSource.replace("background-color: var(--brand-primary);", "background: url(https://example.com/button.png);");
  const invalid = controller.editRuleDeclarations("button", "base", invalidSecond);
  assert.equal(invalid.artifacts.elements.available, false);
  assert.equal(invalid.identity.contentHash, beforeHash);
  assert.equal(invalid.preview.value.css, beforePreview);
  assert.equal(values.get("techies-tools:framework:element-diffs:v1"), beforeStorage);
  assert.equal(writes, 2);
  assert.equal(controller.ruleDeclarationSource("button", "base").data, invalidSecond);

  controller.resetElement("button");
  const reset = controller.ruleDeclarationSource("button", "base");
  assert.equal(reset.success, true);
  assert.equal(reset.data, initial.data);
});

test("Actions Starter definitions retain exact selector/property/value/state/variant/relationship allowlists", () => {
  assert.equal(parseElementDefinition(link).success, true);
  assert.equal(parseElementDefinition(button).success, true);
  for (const mutate of [
    (value) => { value.definition.rules[0].selector = ":where(a[href]), body"; },
    (value) => { value.definition.rules[0].declarations.display = value.definition.rules[0].declarations.color; },
    (value) => { value.definition.rules[1].declarations.color.control.options.push({ family: "semantic", name: "text" }); },
    (value) => { value.definition.rules[1].state = "active"; },
    (value) => { value.definition.relationships[0].rules[0].targetElement = "nav"; },
    (value) => { value.definition.rules[0].declarations.color.allowOmit = true; },
  ]) {
    const unsafe = structuredClone(link); mutate(unsafe); assert.equal(parseElementDefinition(unsafe).success, false);
  }
});

test("color controls accept only current semantic/color registry members, including dotted shades", () => {
  const declaration = link.definition.rules[0].declarations.color;
  const registry = new Map([["semantic.text", "color"], ["color.brand.dark", "color"], ["spacing.s", "dimension"], ["color.fake", "dimension"]]);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "semantic", name: "text" }, declaration, registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "color", name: "brand.dark" }, declaration, registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "color", name: "missing" }, declaration, registry), false);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "color", name: "fake" }, declaration, registry), false);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "spacing", name: "s" }, declaration, registry), false);

  const spacing = button.definition.rules[0].declarations["padding-inline-start"];
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "spacing", name: "s" }, spacing, registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "spacing", name: "m" }, spacing, new Map([["spacing.m", "dimension"]])), true);

  const primitiveTokens = [
    ...Object.entries(primitives).map(([id, value]) => ({ id, cssName: `--${id.replaceAll(".", "-")}`, value, type: id.startsWith("semantic.") ? "color" : "dimension" })),
    { id: "color.brand.dark", cssName: "--brand-dark", value: "#123456", type: "color" },
  ];
  const { storage } = memoryStorage();
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens }, { storage, definitions: [link, button] });
  assert.equal(controller.current().artifacts.elements.available, true, JSON.stringify(controller.current().diagnostics));
  const changed = controller.select("a", "base", "color", { kind: "token", family: "color", name: "brand.dark" });
  assert.equal(changed.artifacts.elements.available, true, JSON.stringify(changed.diagnostics));
  assert.match(changed.artifacts.elements.value.value, /color: var\(--brand-dark\)/);
  const rejected = controller.select("a", "base", "color", { kind: "token", family: "color", name: "brand.missing" });
  assert.equal(rejected.artifacts.elements.available, false);
  assert.equal(rejected.identity.contentHash, changed.identity.contentHash);
});

test("family-scoped token controls accept every current token of the reviewed family and type", () => {
  const registry = new Map([
    ["spacing.s", "dimension"], ["spacing.2xl", "dimension"],
    ["typography.m", "dimension"], ["typography.display", "dimension"],
    ["radius.m", "dimension"], ["radius.pill", "dimension"],
    ["spacing.fake", "color"],
  ]);
  const tokenControl = (family, starter) => ({ label: family, control: { kind: "token", families: [family], options: [{ family, name: starter }] }, starter: { kind: "token", family, name: starter } });
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "spacing", name: "2xl" }, tokenControl("spacing", "s"), registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "typography", name: "display" }, tokenControl("typography", "m"), registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "radius", name: "pill" }, tokenControl("radius", "m"), registry), true);
  assert.equal(selectedValueIsAllowed({ kind: "token", family: "spacing", name: "fake" }, tokenControl("spacing", "s"), registry), false);
});

test("canonical length values accept reviewed CSS units and signed offsets without raw CSS", () => {
  const width = { label: "Width", control: { kind: "length", keywords: ["thin", "medium", "thick"] }, starter: { kind: "length", value: "2px" } };
  const offset = { label: "Offset", control: { kind: "length", allowNegative: true }, starter: { kind: "length", value: "2px" } };
  for (const value of ["0", "1px", ".5rem", "2ch", "3vw", "4Q", "4q", "2PX", "3cqw", "thin", "medium", "thick"]) assert.equal(selectedValueIsAllowed({ kind: "length", value }, width), true, value);
  assert.equal(selectedValueIsAllowed({ kind: "length", value: "-2ch" }, offset), true);
  for (const value of ["thin", "medium", "thick"]) assert.equal(selectedValueIsAllowed({ kind: "length", value }, offset), false, value);
  for (const value of ["10%", "calc(1px + 1rem)", "url(x)", "-1px", "2wat"]) assert.equal(selectedValueIsAllowed({ kind: "length", value }, width), false, value);
});

test("button base exposes reviewed token, border, margin omission, and canonical length controls", () => {
  const base = button.definition.rules.find((rule) => rule.id === "base").declarations;
  assert.deepEqual(Object.keys(base), ["color", "background-color", "font-size", "border-color", "border-style", "border-width", "border-radius", "margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end", "padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end"]);
  assert.deepEqual(base["font-size"].control.families, ["typography"]);
  assert.deepEqual(base["border-radius"].control.families, ["radius"]);
  assert.equal(base["border-width"].control.kind, "length");
  assert.deepEqual(base["border-width"].control.keywords, ["thin", "medium", "thick"]);
  for (const property of ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"]) {
    assert.equal(base[property].allowOmit, true);
    assert.equal(base[property].starter.kind, "omit");
  }
});

test("focus uses visible style choices and canonical length controls", () => {
  for (const definition of [link, button]) {
    const focus = definition.definition.rules.find((rule) => rule.id === "focus-visible");
    assert.deepEqual(focus.declarations["outline-style"].control.options.map((option) => option.value), focusStyles);
    assert.equal(focus.declarations["outline-style"].control.options.some((option) => option.value === "none" || option.value === "hidden"), false);
    for (const property of ["outline-width", "outline-offset"]) {
      assert.equal(focus.declarations[property].control.kind, "length");
      assert.equal(focus.declarations[property].starter.value, "2px");
    }
    assert.equal(focus.declarations["outline-offset"].control.allowNegative, true);
    assert.deepEqual(focus.declarations["outline-width"].control.keywords, ["thin", "medium", "thick"]);
    assert.equal(focus.declarations["outline-offset"].control.keywords, undefined);
  }
  const narrowed = structuredClone(link);
  narrowed.definition.rules.find((rule) => rule.id === "focus-visible").declarations["outline-width"].control.keywords.pop();
  const parsed = parseElementDefinition(narrowed);
  assert.equal(parsed.success, false);
  assert.ok(parsed.diagnostics.some((item) => item.code === "definition.options"));
});

test("select prefill matches token, choice, and omit values semantically instead of by JSON key order", () => {
  const tokenOption = JSON.stringify({ kind: "token", family: "semantic", name: "surface" });
  const choiceOption = JSON.stringify({ kind: "choice", value: "underline" });
  const omitOption = JSON.stringify({ kind: "omit" });
  const options = [tokenOption, choiceOption, omitOption];
  assert.equal(matchingSerializedSelectedValue(options, { family: "semantic", name: "surface", kind: "token" }), tokenOption);
  assert.equal(matchingSerializedSelectedValue(options, { value: "underline", kind: "choice" }), choiceOption);
  assert.equal(matchingSerializedSelectedValue(options, { kind: "omit" }), omitOption);
  assert.equal(matchingSerializedSelectedValue(options, { kind: "token", family: "semantic", name: "ghost" }), undefined);
});

test("one deterministic compiler emits scoped Preview plus separate Tokens, Elements, and Context artifacts", () => {
  const first = compileFramework(input());
  const second = compileFramework(input());
  assert.equal(first.artifacts.tokens.value.value, second.artifacts.tokens.value.value);
  assert.equal(first.artifacts.elements.value.value, second.artifacts.elements.value.value);
  assert.equal(first.artifacts.context.value.value, second.artifacts.context.value.value);
  assert.equal(first.identity.contentHash, second.identity.contentHash);
  assert.match(first.artifacts.elements.value.value, new RegExp(`Content hash: ${first.identity.contentHash}`));
  assert.match(first.artifacts.tokens.value.value, /@layer tokens \{/);
  assert.doesNotMatch(first.artifacts.tokens.value.value, /@layer elements \{/);
  assert.match(first.artifacts.elements.value.value, /@layer tokens, elements, components/);
  assert.doesNotMatch(first.artifacts.elements.value.value, /@layer tokens \{/);
  assert.match(first.preview.value.css, /\[data-framework-preview\] :where\(a\[href\]\)/);
  assert.match(first.artifacts.context.value.value, /\*\*Purpose:\*\*/);
  assert.match(first.artifacts.context.value.value, /\*\*States:\*\*/);
  assert.match(first.artifacts.context.value.value, /\*\*Variants:\*\*/);
  assert.match(first.artifacts.context.value.value, /\*\*Relationships:\*\*/);
  assert.match(first.artifacts.context.value.value, /semantic\.text -> var\(--semantic-text\)/);
  assert.match(first.artifacts.elements.value.value, /padding-block-start: var\(--spacing-3xs\)/);
  assert.match(first.artifacts.elements.value.value, /padding-inline-start: var\(--spacing-s\)/);
  assert.match(first.artifacts.elements.value.value, /outline-offset: 2px/);
  assert.equal(first.artifacts.context.value.value.match(/```css/g)?.length, 2);
  assert.match(first.artifacts.context.value.value, /tokens\.css/);
  assert.match(first.artifacts.context.value.value, /elements\.css/);
  assert.match(first.artifacts.context.value.value, /base: border-width -> 1px/);
  assert.match(first.artifacts.context.value.value, /focus-visible: outline-width -> 2px/);
  assert.match(first.artifacts.context.value.value, /focus-visible: outline-offset -> 2px/);
  assert.doesNotMatch(first.artifacts.context.value.value, /(?:border-width|outline-width|outline-offset) -> omitted/);
});

test("authored rule and declaration ordering keeps relationships last", () => {
  const css = compileFramework(input()).artifacts.elements.value.value;
  const positions = ["a/base", "a/hover", "a/focus-visible", "a/active", "a/quiet", "a/link-in-navigation/current"].map((marker) => css.indexOf(marker));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("unreviewed omission expands the exact value allowlist and is rejected", () => {
  const omitted = structuredClone(link);
  omitted.definition.rules[0].declarations.color.allowOmit = true;
  assert.equal(parseElementDefinition(omitted).success, false);
  const compilation = compileFramework({ ...input(), definitions: [omitted] });
  assert.equal(compilation.artifacts.elements.available, false);
  assert.ok(compilation.diagnostics.some((item) => item.code === "definition.omission"));
});

test("reviewed margin omission policy cannot be silently narrowed", () => {
  const narrowed = structuredClone(button);
  const margin = narrowed.definition.rules[0].declarations["margin-block-start"];
  delete margin.allowOmit;
  margin.starter = { kind: "token", family: "spacing", name: "s" };
  const parsed = parseElementDefinition(narrowed);
  assert.equal(parsed.success, false);
  assert.ok(parsed.diagnostics.some((item) => item.code === "definition.omission"));
});

test("scoped and global serializers differ only by known Preview root for every Actions selector", () => {
  const compilation = compileFramework(input());
  for (const selector of link.definition.rules.map((rule) => rule.selector).concat(link.definition.relationships[0].rules[0].selector)) {
    assert.ok(compilation.artifacts.elements.value.value.includes(selector));
    assert.ok(compilation.preview.value.css.includes(`[data-framework-preview] ${selector}`));
  }
});

test("effective values alter identity; UI/time-free equivalent inputs remain byte-identical and deeply immutable", () => {
  const base = compileFramework(input());
  const changed = compileFramework({ ...input(), primitiveDiffs: { "semantic.action": "#000000" } });
  assert.notEqual(base.identity.contentHash, changed.identity.contentHash);
  assert.notEqual(base.identity.frameworkVersion, changed.identity.frameworkVersion);
  assert.ok(Object.isFrozen(base.resolved));
  assert.ok(Object.isFrozen(base.resolved.elements[0].rules[0].declarations));
});

test("identity hashes the full canonical active Resolved Framework", () => {
  const base = compileFramework(input());
  const guidance = structuredClone(link); guidance.purpose = "Navigate to one reviewed destination.";
  const relationship = structuredClone(link); relationship.definition.relationships[0].when = "Identify the current destination inside navigation.";
  const selector = structuredClone(link); selector.definition.rules[0].selector = ":where(a)";
  assert.notEqual(compileFramework({ ...input(), definitions: [guidance, button] }).identity.contentHash, base.identity.contentHash);
  assert.notEqual(compileFramework({ ...input(), definitions: [relationship, button] }).identity.contentHash, base.identity.contentHash);
  assert.notEqual(compileFramework({ ...input(), definitions: [selector, button] }).identity.contentHash, base.identity.contentHash);
});

test("Primitive token grammar, types, IDs, CSS names, differences, and duplicates block every channel", () => {
  const raw = Object.entries(primitives).map(([id, value]) => ({ id, cssName: `--${id.replaceAll(".", "-")}`, value, type: id.startsWith("semantic.") ? "color" : "dimension" }));
  const cases = [
    [...raw, { ...raw[0], value: "#fff;}body{" }],
    [...raw, { ...raw[0], cssName: "--other" }],
    [...raw, { ...raw[0], id: "semantic.other" }],
    raw.map((token, index) => index ? token : { ...token, type: "dimension" }),
    [...raw, { id: "color.fake", cssName: "--color-fake", value: "1rem", type: "dimension" }],
  ];
  for (const primitiveTokens of cases) {
    const compilation = compileFramework({ ...input(), primitiveDefaults: undefined, primitiveTokens });
    for (const channel of [compilation.preview, ...Object.values(compilation.artifacts)]) assert.equal(channel.available, false);
    assert.ok(compilation.diagnostics.some((item) => item.code.startsWith("primitive.")));
  }
  const familyType = compileFramework({ ...input(), primitiveDefaults: undefined, primitiveTokens: cases.at(-1) });
  assert.ok(familyType.diagnostics.some((item) => item.code === "primitive.family-type"));
  const unknownDiff = compileFramework({ ...input(), primitiveDiffs: { "semantic.ghost": "#fff" } });
  assert.equal(unknownDiff.preview.available, false);
  assert.ok(unknownDiff.diagnostics.some((item) => item.code === "primitive.diff-id"));
  const colors = ["#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999"];
  const duplicateSnapshot = compileFramework({ ...input(), definitions: [], primitiveDefaults: undefined, primitiveSnapshot: { colors: [
    { name: "Brand", value: "#ccc", scale: colors, variable: "--brand" },
    { name: "Brand", value: "#ccc", scale: colors, variable: "--brand" },
  ] } });
  assert.equal(duplicateSnapshot.artifacts.tokens.available, false);
  assert.ok(duplicateSnapshot.diagnostics.some((item) => item.code === "primitive.duplicate-id" || item.code === "primitive.duplicate-css-name"));
});

test("invalid Primitive blocks all channels; invalid promoted definitions preserve Tokens while blocking Elements and Context", () => {
  const primitive = compileFramework({ ...input(), primitiveValid: false });
  assert.equal(primitive.preview.available, false); assert.equal(primitive.artifacts.tokens.available, false);
  const invalid = structuredClone(link); invalid.definition.rules[0].selector = ":where(body)";
  const authored = compileFramework({ ...input(), definitions: [invalid] });
  assert.equal(authored.artifacts.elements.available, false); assert.equal(authored.artifacts.context.available, false); assert.equal(authored.artifacts.tokens.available, true);
  const accessibility = structuredClone(link); accessibility.accessibilityPassed = false;
  const failed = compileFramework({ ...input(), definitions: [accessibility] });
  assert.equal(failed.artifacts.elements.available, false); assert.equal(failed.artifacts.context.available, false);
  assert.equal(failed.diagnostics[0].code, "element.accessibility");
  const missingToken = compileFramework({ ...input(), primitiveDefaults: { "semantic.action": "#2563eb" } });
  assert.equal(missingToken.artifacts.elements.available, false);
});

test("stored differences quarantine only invalid paths, never coerce, and reset removes empty key", () => {
  const { values, storage } = memoryStorage();
  saveElementSelection(link, "base", "text-decoration-line", { kind: "choice", value: "underline" }, { storage, definitions: [link] });
  assert.equal(values.size, 0);
  saveElementSelection(link, "base", "text-decoration-line", { kind: "choice", value: "none" }, { storage, definitions: [link] });
  assert.equal(values.size, 1);
  const raw = JSON.parse(values.values().next().value);
  raw.entries.a.rules.hover = { color: { kind: "choice", value: "url(evil)" } };
  const migrated = migrateStoredOverrides(raw, [link], new Map(Object.keys(primitives).map((id) => [id, id.startsWith("semantic.") ? "color" : "dimension"])));
  assert.equal(migrated.store.entries.a.rules.base["text-decoration-line"].value, "none");
  assert.equal(migrated.store.entries.a.rules.hover, undefined);
  assert.equal(migrated.diagnostics[0].code, "element-store.value");
  resetElement("a", { storage, definitions: [link] }); assert.equal(values.size, 0);
});

test("controller is atomic: valid differences persist; invalid edits retain last Preview/hash and expose diagnostics", () => {
  const { values, storage } = memoryStorage();
  const controller = createFrameworkController(input(), { storage, definitions: [link] });
  const before = controller.current().identity.contentHash;
  const next = controller.select("a", "base", "text-decoration-line", { kind: "choice", value: "none" });
  assert.notEqual(next.identity.contentHash, before);
  assert.equal(valueForControl(next, "a", "base", "text-decoration-line").value, "none");
  const invalid = controller.select("a", "base", "color", { kind: "choice", value: "red;display:block" });
  assert.equal(invalid.identity.contentHash, next.identity.contentHash);
  assert.equal(invalid.artifacts.tokens.value.contentHash, invalid.identity.contentHash);
  assert.equal(invalid.artifacts.tokens.value.value, next.artifacts.tokens.value.value);
  assert.equal(invalid.artifacts.elements.available, false);
  assert.equal(JSON.parse(values.values().next().value).entries.a.rules.base["text-decoration-line"].value, "none");
  controller.resetElement("a"); assert.equal(values.size, 0);
});

test("controller compiles dynamic family tokens, arbitrary reviewed lengths, and omission without partial invalid CSS", () => {
  const { values, storage } = memoryStorage();
  const primitiveTokens = [
    ...Object.entries(primitives).map(([id, value]) => ({ id, cssName: `--${id.replaceAll(".", "-")}`, value, type: id.startsWith("semantic.") ? "color" : "dimension" })),
    { id: "spacing.2xl", cssName: "--spacing-2xl", value: "2rem", type: "dimension" },
    { id: "typography.display", cssName: "--typography-display", value: "3rem", type: "dimension" },
    { id: "radius.pill", cssName: "--radius-pill", value: "99rem", type: "dimension" },
  ];
  const controller = createFrameworkController({ ...input(), primitiveDefaults: undefined, primitiveTokens }, { storage, definitions: [link, button] });
  assert.match(controller.select("button", "base", "padding-inline-start", { kind: "token", family: "spacing", name: "2xl" }).preview.value.css, /padding-inline-start: var\(--spacing-2xl\)/);
  assert.match(controller.select("button", "base", "font-size", { kind: "token", family: "typography", name: "display" }).preview.value.css, /font-size: var\(--typography-display\)/);
  assert.match(controller.select("button", "base", "border-radius", { kind: "token", family: "radius", name: "pill" }).preview.value.css, /border-radius: var\(--radius-pill\)/);
  assert.match(controller.select("button", "base", "border-width", { kind: "length", value: "2ch" }).preview.value.css, /border-width: 2ch/);
  assert.match(controller.select("a", "focus-visible", "outline-offset", { kind: "length", value: "-3vw" }).preview.value.css, /outline-offset: -3vw/);
  controller.select("button", "base", "margin-inline-start", { kind: "token", family: "spacing", name: "2xl" });
  const omitted = controller.select("button", "base", "margin-inline-start", { kind: "omit" });
  assert.doesNotMatch(omitted.preview.value.css, /margin-inline-start:/);
  const before = omitted.identity.contentHash;
  for (const value of ["10%", "calc(1px + 1rem)", "url(x)", "-1px", "2wat"]) {
    const invalid = controller.select("button", "base", "border-width", { kind: "length", value });
    assert.equal(invalid.identity.contentHash, before, value);
    assert.equal(invalid.artifacts.elements.available, false, value);
    assert.ok(invalid.diagnostics.some((item) => item.code === "preferences.length"), value);
  }
  const stored = JSON.parse(values.get("techies-tools:framework:element-diffs:v1"));
  assert.equal(stored.entries.button.rules.base["border-width"].value, "2ch");
  assert.equal(stored.entries.button.rules.base["margin-inline-start"], undefined);
});

test("controller retains the complete last valid Preview when a promoted definition becomes invalid", () => {
  const definitions = [structuredClone(link), structuredClone(button)];
  const controller = createFrameworkController({ ...input(), definitions });
  const before = controller.current();
  definitions[0].definition.rules[0].selector = ":where(body)";
  const invalid = controller.validateForExport();
  assert.equal(invalid.artifacts.elements.available, false);
  assert.equal(invalid.preview.available, true);
  assert.equal(invalid.preview.value.css, before.preview.value.css);
  assert.equal(invalid.identity.contentHash, before.identity.contentHash);
  assert.deepEqual(invalid.resolved, before.resolved);
});

test("deferred Actions use only the isolated Draft specimen channel", () => {
  const draftLink = structuredClone(link); draftLink.promoted = false; draftLink.accessibilityPassed = false;
  const draftButton = structuredClone(button); draftButton.promoted = false; draftButton.accessibilityPassed = false;
  const controller = createFrameworkController({ ...input(), definitions: [draftLink, draftButton] });
  assert.doesNotMatch(controller.current().artifacts.elements.value.value, /button\/base/);
  const specimen = controller.draftSpecimen("button");
  assert.equal(specimen.diagnostics.length, 0);
  assert.match(specimen.css, /\[data-framework-draft-specimen="button"\] :where\(button:not\(\[disabled\]\)\)/);
  assert.match(specimen.css, /color: var\(--semantic-surface\)/);
  assert.match(specimen.css, /padding-inline-start: var\(--spacing-s\)/);
  controller.select("button", "base", "background-color", { kind: "token", family: "semantic", name: "primary" });
  assert.match(controller.draftSpecimen("button").css, /background-color: var\(--semantic-primary\)/);
  assert.equal(createFrameworkController(input()).draftSpecimen("button").css, "");
});

test("choosing a valid value repairs quarantined storage and final export revalidates clean state", () => {
  const { values, storage } = memoryStorage();
  values.set("techies-tools:framework:element-diffs:v1", JSON.stringify({ schemaVersion: 1, entries: { a: { version: "1.0.0", rules: { hover: { color: { kind: "choice", value: "url(evil)" } } } } } }));
  const controller = createFrameworkController(input(), { storage, definitions: [link, button] });
  assert.equal(controller.current().artifacts.elements.available, false);
  const repaired = controller.select("a", "base", "text-decoration-line", { kind: "choice", value: "none" });
  assert.equal(repaired.artifacts.elements.available, true);
  assert.equal(controller.validateForExport().artifacts.elements.available, true);
  assert.equal(JSON.parse(values.get("techies-tools:framework:element-diffs:v1")).entries.a.rules.hover, undefined);
});

test("controller persists only Primitive differences, reloads them, and Framework Reset removes both stores", () => {
  const { values, storage } = memoryStorage();
  const controller = createFrameworkController(input(), { storage, definitions: [link, button] });
  const changed = controller.updatePrimitives(snapshot("#000000"), snapshot());
  assert.equal(changed.artifacts.elements.available, true);
  const stored = JSON.parse(values.get("techies-tools:framework:primitive-diffs:v1"));
  assert.deepEqual(stored.values, { "semantic.action": "#000000" });
  const reloaded = createFrameworkController(input(), { storage, definitions: [link, button] });
  assert.match(reloaded.current().artifacts.tokens.value.value, /--semantic-action: #000000/);
  controller.select("a", "base", "text-decoration-line", { kind: "choice", value: "none" });
  assert.equal(values.has("techies-tools:framework:element-diffs:v1"), true);
  controller.resetFramework();
  assert.equal(values.has("techies-tools:framework:primitive-diffs:v1"), false);
  assert.equal(values.has("techies-tools:framework:element-diffs:v1"), false);
});

test("primitive snapshot produces current editor tokens and stable semantic IDs in one registry", () => {
  const tokens = primitiveTokensFromSnapshot({
    colors: [{ name: "Primary", value: "oklch(55% .2 260)", scale: ["a", "b", "c", "d", "e", "f", "g"], variable: "--brand-primary" }],
    semantics: { action: { role: "action", reference: "--brand-primary", value: "oklch(55% .2 260)", variable: "--role-action" } },
  });
  assert.equal(tokens.find((item) => item.id === "semantic.action").cssName, "--role-action");
  assert.equal(tokens.find((item) => item.id === "semantic.action").value, "var(--brand-primary)");
  assert.equal(tokens.find((item) => item.id === "semantic.action").resolvedValue, "oklch(55% .2 260)");
  assert.equal(tokens.find((item) => item.id === "color.primary").cssName, "--brand-primary");
  assert.equal(resolvedColorSwatch("semantic.action", tokens), "oklch(55% .2 260)");
});
