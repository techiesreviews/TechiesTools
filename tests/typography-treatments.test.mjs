import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterTokenRegistry } from "../src/framework/starter/index.ts";
import { typographyTreatments } from "../src/framework/treatments/typography/index.ts";

const activeIds = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "strong", "em", "small", "mark", "abbr", "blockquote", "cite", "code", "pre", "kbd", "hr"];
const nativeIds = ["time", "q"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Typography",
  tags: [id],
  capability: "text",
  kind: "type",
  purpose: "Preserve native text semantics.",
  treatment: "Apply the reviewed Typography treatment.",
  contextGuidance: nativeIds.includes(id) ? "Use only when its native semantic meaning applies." : undefined,
  use: ["Use semantic HTML."],
  avoid: "Do not choose semantics for appearance.",
  constraints: ["Preserve meaning, wrapping, and native behavior."],
  accessibility: ["Preserve zoom and reflow."],
  variants: [],
  semanticHtml: typographyTreatments[id]?.specimens[0].semanticHtml ?? `<${id}>Example</${id}>`,
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : "0.0.0",
  baseline: { status: "widely-available", source: "mdn", sourceUrl: `https://developer.mozilla.org/${id}`, checkedAt: "2026-07-23" },
  deprecated: false,
  order: 100 + index,
  sourceUrl: `https://developer.mozilla.org/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...activeIds, ...nativeIds].map(guidance),
  treatments: typographyTreatments,
  tokens: starterTokenRegistry,
});
assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
const catalog = catalogResult.data;
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
  type: { label: "text", min: "1rem", max: "1.125rem", minRatio: "1.125", maxRatio: "1.333", baseIndex: "m", minWidth: 20, maxWidth: 90, family: "Inter", headingFamily: "Open Sans", codeFamily: "Roboto Mono", bodyWeights: [400, 500, 600, 700, 800], headingWeights: [700, 800], codeWeights: [400, 500, 600, 700], googleFonts: true },
  radii: { name: "radius", minWidth: 20, maxWidth: 90, tokens: ["xs", "s", "m", "l", "xl", "full"].map((token, index) => ({ token, min: index === 5 ? 999 : 0.125 * (index + 1), max: index === 5 ? 999 : 0.25 * (index + 1) })) },
  spacing: { name: "space", minWidth: 20, maxWidth: 90, tokens: ["4xs", "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"].map((token, index) => ({ token, min: 0.25 * (index + 1), max: 0.25 * (index + 1) })) },
};

test("Typography records 18 Active treatments and two intentional Native fallbacks", () => {
  assert.deepEqual(Object.keys(typographyTreatments), activeIds);
  assert.deepEqual(catalog.group("Typography").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalog.group("Typography").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("every Active Typography Element is catalog-driven through the shared CSS box contract", () => {
  for (const id of activeIds) {
    const element = catalog.get(id);
    assert.ok(element.definition);
    assert.equal(element.rules.length, 1);
    assert.equal(element.rules[0].path, `${id}/base`);
    assert.match(element.rules[0].rule.selector, new RegExp(`^:where\\(${id}\\)$`));
  }
  assert.equal(catalog.get("time").definition, undefined);
  assert.equal(catalog.get("q").definition, undefined);
});

test("Google Fonts source stays in tokens while Typography CSS uses family Tokens", () => {
  const compilation = compileFramework({
    catalog,
    primitiveSnapshot: snapshot,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.tokens.available, true, JSON.stringify(compilation.diagnostics));
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  const tokens = compilation.artifacts.tokens.value.value;
  const elements = compilation.artifacts.elements.value.value;
  const context = compilation.artifacts.context.value.value;
  assert.match(tokens, /@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;500;600;700;800&family=Open\+Sans:wght@700;800&family=Roboto\+Mono:wght@400;500;600;700&display=swap"\);/);
  assert.match(tokens, /--font-body: 'Inter', system-ui, sans-serif;/);
  assert.match(tokens, /--font-heading: 'Open Sans', system-ui, sans-serif;/);
  assert.match(tokens, /--font-code: 'Roboto Mono', ui-monospace, monospace;/);
  assert.match(elements, /font-family: var\(--font-body\);/);
  assert.match(elements, /h1\/base[\s\S]*font-family: var\(--font-heading\);/);
  assert.match(elements, /h6\/base[\s\S]*font-family: var\(--font-heading\);/);
  assert.match(elements, /font-family: var\(--font-code\);/);
  assert.doesNotMatch(elements, /fonts\.googleapis\.com/);
  assert.match(context, /Native Element Decisions/);
  assert.match(context, /Native Element Decisions[\s\S]*`q` 0\.0\.0/);

  const localOnly = compileFramework({
    catalog,
    primitiveSnapshot: { ...snapshot, type: { ...snapshot.type, googleFonts: false } },
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(localOnly.artifacts.tokens.available, true);
  assert.doesNotMatch(localOnly.artifacts.tokens.value.value, /fonts\.googleapis\.com/);
  assert.match(localOnly.artifacts.tokens.value.value, /--font-body: 'Inter', system-ui, sans-serif;/);
  assert.match(localOnly.artifacts.tokens.value.value, /--font-heading: 'Open Sans', system-ui, sans-serif;/);
  assert.notEqual(localOnly.identity.contentHash, compilation.identity.contentHash);

  const sharedHeadingFamily = compileFramework({
    catalog,
    primitiveSnapshot: { ...snapshot, type: { ...snapshot.type, headingFamily: "Inter" } },
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(sharedHeadingFamily.artifacts.tokens.available, true);
  const sharedTokens = sharedHeadingFamily.artifacts.tokens.value.value;
  assert.equal((sharedTokens.match(/family=Inter:/g) ?? []).length, 1);
  assert.match(sharedTokens, /family=Inter:wght@400;500;600;700;800/);
});

test("preformatted treatment preserves whitespace and contains horizontal overflow", () => {
  const declarations = typographyTreatments.pre.rules[0].declarations;
  assert.deepEqual(declarations["white-space"].starter, { kind: "choice", value: "pre" });
  assert.deepEqual(declarations["overflow-x"].starter, { kind: "choice", value: "auto" });
  assert.equal("overflow" in declarations, false);
  assert.equal("max-inline-size" in declarations, false);
});
