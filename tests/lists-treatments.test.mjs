import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { listsTreatments } from "../src/framework/treatments/lists/index.ts";

const ids = ["ul", "ol", "li", "dl", "dt", "dd"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Lists",
  tags: [id],
  capability: "list",
  kind: "native",
  purpose: "Preserve list semantics.",
  treatment: "Apply Element-owned rhythm without changing markers or composition.",
  use: ["Use the correct list relationship."],
  avoid: "Do not remove list semantics for layout.",
  constraints: ["Preserve markers, numbering, nesting, and term-description relationships."],
  accessibility: ["Preserve native list semantics at zoom and reflow."],
  variants: [],
  semanticHtml: listsTreatments[id].specimens[0].semanticHtml,
  activationEvidence: evidence,
  version: "1.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 300 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: ids.map(guidance),
  treatments: listsTreatments,
  tokens: starterTokenRegistry,
});

test("Lists records six independent Active Treatments", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(listsTreatments), ids);
  assert.deepEqual(catalogResult.data.group("Lists").map((item) => item.id), ids);
  assert.ok(catalogResult.data.group("Lists").every((item) => item.lifecycle === "Active"));
  for (const id of ids) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, /^version: "1\.0\.0"$/m);
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("Every List Element uses the locked-selector CSS box without replacing native list behavior", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const forbidden = /^(?:list-style|list-style-type|list-style-position|display|grid|flex|position|overflow|counter-|content)/;
  for (const id of ids) {
    const element = catalogResult.data.get(id);
    assert.deepEqual(element.rules.map((item) => item.path), [`${id}/base`]);
    assert.equal(element.rules[0].rule.selector, `:where(${id})`);
    for (const property of Object.keys(element.rules[0].rule.declarations)) assert.doesNotMatch(property, forbidden);
  }
});

test("List specimens retain markers, numbering, nesting, and description relationships", () => {
  assert.match(listsTreatments.ul.specimens[0].semanticHtml, /<ul>.*<ul>/);
  assert.match(listsTreatments.ol.specimens[0].semanticHtml, /<ol start="3">/);
  assert.match(listsTreatments.ol.specimens[0].semanticHtml, /<li value="5">/);
  assert.match(listsTreatments.li.specimens[0].semanticHtml, /<ul><li>/);
  for (const id of ["dl", "dt", "dd"]) {
    assert.match(listsTreatments[id].specimens[0].semanticHtml, /<dl>.*<dt>.*<dd>/);
  }
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.equal(compilation.artifacts.context.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of ids) {
    assert.match(compilation.artifacts.elements.value.value, new RegExp(`${id}/base`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 1\\.0\\.0"));
    assert.ok(compilation.artifacts.context.value.value.includes(`**Semantic HTML:** \`${listsTreatments[id].specimens[0].semanticHtml}\``));
  }
});
