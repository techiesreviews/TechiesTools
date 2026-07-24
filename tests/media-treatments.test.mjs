import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { selectedValueIsAllowed } from "../src/framework/model/index.ts";
import { mediaTreatments } from "../src/framework/treatments/media/index.ts";

const activeIds = ["img", "figure", "figcaption"];
const nativeIds = ["picture", "source", "audio", "video", "track"];
const imageSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E";
const figureSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E";
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const semanticHtmlById = {
  img: `<img width="480" height="240" src="${imageSource}" alt="Blue geometric placeholder showing image proportions">`,
  picture: `<picture><source media="(min-width: 40rem)" srcset="${imageSource}"><img width="480" height="240" src="${imageSource}" alt="Responsive blue geometric placeholder"></picture>`,
  source: `<picture><source type="image/avif" srcset="image.avif"><img width="480" height="240" src="image.jpg" alt="Product overview"></picture>`,
  figure: `<figure><img width="480" height="240" src="${figureSource}" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure>`,
  figcaption: `<figure><img width="480" height="240" src="${figureSource}" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure>`,
  audio: '<audio controls src="interview.mp3">Download the <a href="interview.mp3">audio interview</a>.</audio><a href="transcript.html">Read the transcript</a>',
  video: '<video controls width="480" height="270" poster="preview.jpg" src="overview.mp4"><track default kind="captions" srclang="en" label="English" src="captions.vtt">Download the <a href="overview.mp4">video overview</a>.</video><a href="transcript.html">Read the transcript</a>',
  track: '<video controls src="overview.mp4"><track default kind="captions" srclang="en" label="English" src="captions.vtt">Download the <a href="overview.mp4">video overview</a>.</video>',
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Media",
  tags: [id],
  capability: ["source", "track"].includes(id) ? "non-rendered" : "media",
  kind: "native",
  purpose: "Preserve media semantics.",
  treatment: activeIds.includes(id) ? "Apply intrinsic media or caption treatment." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Preserve source selection, controls, alternatives, and timed-media behavior." : undefined,
  use: ["Use truthful alternatives and intrinsic dimensions."],
  avoid: "Do not replace native behavior without an equivalent.",
  constraints: ["Preserve responsive selection, controls, captions, and fallback content."],
  accessibility: ["Keep alternatives and controls available at zoom and narrow reflow."],
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
  order: 380 + index * 10,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: [...activeIds, ...nativeIds].map(guidance),
  treatments: mediaTreatments,
  tokens: starterTokenRegistry,
});

test("Media records three Active Treatments and five deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(mediaTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Media").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Media").filter((item) => item.lifecycle === "Native").map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
    assert.ok(source.includes(`<div class="native-demo">${semanticHtmlById[id]}</div>`), `${id} visible specimen must equal exported semanticHtml`);
  }
});

test("Every Active Media Element uses a locked CSS box without replacing media behavior", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const forbidden = /^(?:display|position|overflow|content|background-color|color)$/;
  for (const id of activeIds) {
    const element = catalogResult.data.get(id);
    assert.deepEqual(element.rules.map((item) => item.path), [`${id}/base`]);
    assert.equal(element.rules[0].rule.selector, `:where(${id})`);
    for (const property of Object.keys(element.rules[0].rule.declarations)) assert.doesNotMatch(property, forbidden);
  }
  assert.equal(mediaTreatments.img.rules[0].declarations["max-inline-size"].starter.value, "100%");
  assert.equal(mediaTreatments.img.rules[0].declarations["block-size"].starter.value, "auto");
  assert.equal(selectedValueIsAllowed({ kind: "length", value: "100%" }, mediaTreatments.img.rules[0].declarations["max-inline-size"]), true);
  assert.equal(selectedValueIsAllowed({ kind: "length", value: "100%" }, mediaTreatments.figure.rules[0].declarations["margin-inline-start"]), false);
});

test("Media compilation preserves alternatives, dimensions, controls, and Native zero CSS", () => {
  assert.match(semanticHtmlById.img, /width="480".*height="240".*alt="[^"]+"/);
  assert.match(semanticHtmlById.picture, /<source.*<img.*alt="[^"]+"/);
  assert.match(semanticHtmlById.audio, /controls.*transcript/);
  assert.match(semanticHtmlById.video, /controls.*src="overview\.mp4".*<track.*kind="captions".*transcript/);
  assert.match(semanticHtmlById.track, /default.*kind="captions".*srclang="en".*label="English"/);
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  assert.equal(compilation.artifacts.context.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of activeIds) assert.match(compilation.artifacts.elements.value.value, new RegExp(`${id}/base`));
  for (const id of nativeIds) {
    assert.equal(catalogResult.data.get(id).definition, undefined);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
  }
  for (const id of [...activeIds, ...nativeIds]) {
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` " + (activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0")));
    assert.ok(compilation.artifacts.context.value.value.includes(`**Semantic HTML:** \`${semanticHtmlById[id]}\``));
  }
});
