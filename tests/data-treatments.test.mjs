import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { dataTreatments } from "../src/framework/treatments/data/index.ts";
import { assertNativeAccentDraft } from "./helpers/native-accent-draft.mjs";

const activeIds = ["table", "caption", "th", "td"];
const draftIds = ["progress"];
const nativeIds = ["thead", "tbody", "tfoot", "tr", "data", "meter"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const semanticHtmlById = {
  table: '<table><caption>Token status</caption><thead><tr><th scope="col">Token</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Color</td><td>Supported</td></tr></tbody></table>',
  caption: "<table><caption>Framework tokens</caption><tbody><tr><th scope=\"row\">Color</th><td>OKLCH</td></tr></tbody></table>",
  thead: '<table><thead><tr><th scope="col">Element</th><th scope="col">Status</th></tr></thead><tbody><tr><td>button</td><td>Supported</td></tr></tbody></table>',
  tbody: '<table><tbody><tr><th scope="row">button</th><td>Supported</td></tr></tbody></table>',
  tfoot: '<table><tbody><tr><td>Reviewed</td><td>15</td></tr></tbody><tfoot><tr><th scope="row">Total</th><td>15</td></tr></tfoot></table>',
  tr: '<table><tbody><tr><th scope="row">Status</th><td>Supported</td></tr></tbody></table>',
  th: '<table><tbody><tr><th scope="row">Color</th><td>Supported</td></tr></tbody></table>',
  td: '<table><tbody><tr><th scope="row">Status</th><td>Draft</td></tr></tbody></table>',
  data: '<data value="sku-1042">Framework starter</data>',
  meter: '<label for="review-meter">Accessibility review</label><meter id="review-meter" min="0" max="100" low="60" high="85" optimum="100" value="82">82%</meter>',
  progress: '<label for="export-progress">Export progress</label><progress id="export-progress" max="100" value="68">68%</progress>',
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Data",
  tags: [id],
  capability: "data",
  kind: "native",
  purpose: "Preserve data semantics.",
  treatment: activeIds.includes(id) ? "Apply intrinsic table or cell treatment." : draftIds.includes(id) ? "Draft native accent color." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Preserve native data relationships, value semantics, and widget behavior." : undefined,
  use: ["Use semantic relationships and truthful values."],
  avoid: "Do not replace semantics for visual layout.",
  constraints: ["Preserve caption, header, row, column, range, and progress relationships."],
  accessibility: ["Keep data understandable at zoom and narrow reflow."],
  variants: [],
  semanticHtml: semanticHtmlById[id],
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : draftIds.includes(id) ? "0.1.0" : "0.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 460 + index * 10,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...activeIds, ...draftIds, ...nativeIds].map(guidance),
  treatments: dataTreatments,
  tokens: starterTokenRegistry,
});

test("Data records four Active Treatments, one Draft progress accent, and six deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(dataTreatments), [...activeIds, ...draftIds]);
  assert.deepEqual(catalogResult.data.group("Data").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Data").filter((item) => item.lifecycle === "Draft").map((item) => item.id), draftIds);
  assert.deepEqual(catalogResult.data.group("Data").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...draftIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : draftIds.includes(id) ? "0\\.1\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
    assert.ok(source.includes(`<div class="native-demo">${semanticHtmlById[id]}</div>`), `${id} visible specimen must equal exported semanticHtml`);
  }
});

test("Every Active Data Element uses a locked CSS box without responsive-layout claims", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const forbidden = /^(?:display|grid|flex|position|overflow|inline-size|block-size|max-inline-size|min-block-size|white-space)$/;
  for (const id of activeIds) {
    const element = catalogResult.data.get(id);
    assert.deepEqual(element.rules.map((item) => item.path), [`${id}/base`]);
    assert.equal(element.rules[0].rule.selector, `:where(${id})`);
    for (const property of Object.keys(element.rules[0].rule.declarations)) assert.doesNotMatch(property, forbidden);
  }
});

test("Draft progress uses only the native accent-color hook", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const element = catalogResult.data.get("progress");
  assertNativeAccentDraft(element, "progress/base", ":where(progress)");
});

test("Data compilation preserves relationships and Draft and Native widgets emit zero CSS", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.match(semanticHtmlById.table, /<caption>.*<thead>.*scope="col".*<tbody>/);
  assert.match(semanticHtmlById.th, /scope="row"/);
  assert.match(semanticHtmlById.meter, /min="0".*max="100".*low="60".*high="85".*optimum="100".*value="82"/);
  assert.match(semanticHtmlById.progress, /max="100".*value="68"/);
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
  for (const id of [...activeIds, ...nativeIds]) {
    assert.ok(compilation.artifacts.context.value.value.includes(`**Semantic HTML:** \`${semanticHtmlById[id]}\``), `${id} Context semantic HTML must equal the visible specimen`);
  }
});
