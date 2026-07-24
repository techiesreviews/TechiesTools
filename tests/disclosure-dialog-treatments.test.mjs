import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { disclosureDialogTreatments } from "../src/framework/treatments/disclosure-dialog/index.ts";

const activeIds = ["details", "summary", "dialog"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const semanticHtmlById = {
  details: "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>",
  summary: "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>",
  dialog: '<dialog open aria-labelledby="promotion-title"><h2 id="promotion-title">Confirm Promotion</h2><form method="dialog"><button value="cancel">Cancel</button><button value="confirm">Promote</button></form></dialog>',
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Disclosure",
  tags: [id],
  capability: id === "dialog" ? "dialog" : "disclosure",
  kind: id === "dialog" ? "dialog" : "disclosure",
  purpose: "Preserve native disclosure behavior.",
  treatment: "Apply safe visual treatment without replacing native behavior.",
  use: ["Use native semantics and controls."],
  avoid: "Do not replace native behavior.",
  constraints: id === "dialog"
    ? ["Use showModal() for modal behavior; the open specimen is intentionally non-modal.", "Do not add tabindex to dialog."]
    : ["Keep summary first and preserve its marker."],
  accessibility: id === "dialog"
    ? ["Choose initial focus, preserve native Escape, and restore focus to the invoker."]
    : ["Preserve native focus and keyboard activation."],
  variants: [],
  semanticHtml: semanticHtmlById[id],
  activationEvidence: evidence,
  version: "1.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 680 + index * 10,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${id}`,
});
const catalogResult = buildElementCatalog({
  guidance: activeIds.map(guidance),
  treatments: disclosureDialogTreatments,
  tokens: starterTokenRegistry,
});
test("Disclosure records details, summary, and dialog as Active 1.0.0 Treatments", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(disclosureDialogTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Disclosure").map((item) => item.id), activeIds);
  assert.ok(catalogResult.data.group("Disclosure").every((item) => item.lifecycle === "Active"));
  for (const id of activeIds) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, /^version: "1\.0\.0"$/m);
    assert.match(source, /checkedAt: "2026-07-23"/);
    assert.ok(source.includes(`<div class="native-demo">${semanticHtmlById[id]}</div>`), `${id} visible specimen must equal exported semanticHtml`);
  }
});

test("Every Active Disclosure Element uses a locked CSS box without owning native behavior", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  for (const id of activeIds) {
    const element = catalogResult.data.get(id);
    assert.ok(element.definition);
    assert.ok(element.rules.length >= 1);
    assert.equal(element.rules[0].path, `${id}/base`);
    assert.equal(element.rules[0].rule.selector, `:where(${id})`);
  }
  const allProperties = Object.values(disclosureDialogTreatments)
    .flatMap((definition) => definition.rules)
    .flatMap((rule) => Object.keys(rule.declarations));
  for (const forbidden of ["display", "list-style", "content", "appearance", "position", "overflow", "opacity", "pointer-events"]) {
    assert.equal(allProperties.includes(forbidden), false);
  }
  assert.equal(disclosureDialogTreatments.summary.rules.some((rule) => rule.selector.includes("::marker")), false);
  assert.equal(disclosureDialogTreatments.dialog.rules.some((rule) => rule.selector.includes("::backdrop")), false);
  assert.deepEqual(disclosureDialogTreatments.summary.contrastChecks, [
    {
      id: "summary-focus-inner",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "summary-focus-outer",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
  ]);
});

test("Disclosure specimens preserve marker, open state, close action, modality guidance, and focus duties", () => {
  assert.match(semanticHtmlById.details, /^<details><summary>/);
  assert.equal(semanticHtmlById.details.includes("open"), false);
  assert.match(semanticHtmlById.dialog, /<dialog open aria-labelledby="promotion-title">/);
  assert.match(semanticHtmlById.dialog, /<form method="dialog">/);
  assert.match(semanticHtmlById.dialog, /<button value="cancel">Cancel<\/button>/);
  assert.doesNotMatch(semanticHtmlById.dialog, /tabindex=/);

  const detailsSource = readFileSync(join(process.cwd(), "src/content/elements/details.md"), "utf8");
  const summarySource = readFileSync(join(process.cwd(), "src/content/elements/summary.md"), "utf8");
  const dialogSource = readFileSync(join(process.cwd(), "src/content/elements/dialog.md"), "utf8");
  assert.match(detailsSource, /Escape-to-close is not required/);
  assert.match(summarySource, /preserve (?:the )?native marker/i);
  assert.match(dialogSource, /showModal\(\)/);
  assert.match(dialogSource, /non-modal/);
  assert.match(dialogSource, /restore focus to the invoker/i);
  assert.match(dialogSource, /native Escape/i);
  assert.match(dialogSource, /Do not add tabindex/i);
  assert.match(dialogSource, /backdrop/i);
  const specSource = readFileSync(join(process.cwd(), "docs/specs/disclosure-dialog-treatments.md"), "utf8");
  assert.match(specSource, /^### Details and summary$/m);
  assert.match(specSource, /^### Dialog$/m);
});

test("Disclosure compilation preserves Context parity and offers two AA-rated token repairs per boundary advisory", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of activeIds) {
    assert.match(compilation.artifacts.elements.value.value, new RegExp(`:where\\(${id}\\)`));
    assert.ok(compilation.artifacts.context.value.value.includes(semanticHtmlById[id]));
  }
  for (const id of ["details", "dialog"]) {
    const advisory = compilation.accessibilityAdvisories.find((item) => item.elementId === id);
    assert.ok(advisory);
    assert.equal(advisory.message, "Contrast can be improved.");
    assert.equal(advisory.repairs.length, 2);
    assert.ok(advisory.repairs.every((repair) => repair.rating.includes("AA")));
  }
  assert.equal(compilation.accessibilityAdvisories.some((item) => item.elementId === "summary"), false);
});
