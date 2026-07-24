import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { structureTreatments } from "../src/framework/treatments/structure/index.ts";

const activeIds = ["address"];
const nativeIds = ["header", "nav", "main", "section", "article", "aside", "footer", "search"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const semanticHtmlById = {
  address: '<address>Techies Tools<br><a href="mailto:hello@example.test">hello@example.test</a></address>',
  header: "<header><h2>Section introduction</h2></header>",
  nav: '<nav aria-label="Example"><a href="/overview">Overview</a></nav>',
  main: "<main><h1>Unique page content</h1></main>",
  section: '<section aria-labelledby="topic"><h2 id="topic">A named theme</h2></section>',
  article: "<article><h2>Reusable story</h2><p>Self-contained content.</p></article>",
  aside: '<aside aria-labelledby="related"><h2 id="related">Related note</h2></aside>',
  footer: "<article><footer>Article ownership</footer></article>",
  search: '<search><form><label for="query">Search</label><input id="query" type="search"></form></search>',
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Structure",
  tags: [id],
  capability: "structure",
  kind: "native",
  purpose: "Preserve structural semantics.",
  treatment: activeIds.includes(id) ? "Apply contact typography and rhythm." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Choose the element from document hierarchy and landmark purpose; keep layout in higher layers." : undefined,
  use: ["Use the semantic owner relationship."],
  avoid: "Do not choose structural HTML for visual layout.",
  constraints: ["Preserve landmark scope and document hierarchy."],
  accessibility: ["Keep names, headings, zoom, and reflow correct."],
  variants: [],
  semanticHtml: semanticHtmlById[id],
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : "0.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 10 + index * 10,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...nativeIds, ...activeIds].map(guidance),
  treatments: structureTreatments,
  tokens: starterTokenRegistry,
});

test("Structure records one Active Treatment and eight deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(structureTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Structure").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Structure").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
    assert.ok(source.includes(`<div class="native-demo">${semanticHtmlById[id]}</div>`), `${id} visible specimen must equal exported semanticHtml`);
  }
  const navSource = readFileSync(join(process.cwd(), "src", "content", "elements", "nav.md"), "utf8");
  assert.match(navSource, /different content or purpose distinct short labels/);
  assert.match(navSource, /same links and purpose should reuse the same label/);
});

test("Address uses the shared locked-selector CSS box without owning page layout", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const element = catalogResult.data.get("address");
  assert.deepEqual(element.rules.map((item) => item.path), ["address/base"]);
  assert.equal(element.rules[0].rule.selector, ":where(address)");
  const properties = Object.keys(element.rules[0].rule.declarations);
  for (const forbidden of ["display", "grid", "flex", "position", "inline-size", "block-size", "padding", "background-color", "border-color"]) {
    assert.equal(properties.includes(forbidden), false);
  }
});

test("Native landmarks emit zero CSS and retain decision-helpful Context guidance", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.equal(compilation.artifacts.context.available, true, JSON.stringify(compilation.diagnostics));
  assert.match(compilation.artifacts.elements.value.value, /address\/base/);
  assert.match(compilation.artifacts.context.value.value, /`address` 1\.0\.0/);
  assert.ok(compilation.artifacts.context.value.value.includes(`**Semantic HTML:** \`${semanticHtmlById.address}\``));
  for (const id of nativeIds) {
    assert.equal(catalogResult.data.get(id).definition, undefined);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 0\\.0\\.0"));
  }
});
