import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildElementCatalog } from "../src/framework/catalog/index.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../src/framework/starter/index.ts";
import { actionsTreatments } from "../src/framework/treatments/actions/index.ts";
import { formsFileActionTreatments } from "../src/framework/treatments/forms-file-action/index.ts";

const activeIds = ["input-submit", "input-reset", "input-button"];
const nativeIds = ["input-file", "input-image", "input-hidden"];
const evidence = Object.fromEntries(["definition", "baseline", "nativeBehavior", "keyboard", "focus", "parity"].map((key) =>
  [key, { status: "pass", reference: `tests/${key}`, checkedAt: "2026-07-23" }]));
const inputOwner = {
  id: "input",
  title: "Input",
  group: "Forms",
  tags: ["input"],
  capability: "form-control",
  kind: "native",
  purpose: "Own typed input selector subjects.",
  treatment: "Keep Native Fallback.",
  use: ["Use semantic HTML."],
  avoid: "Do not remove native behavior.",
  version: "0.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input",
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 700,
  sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input",
};
const guidance = (id, index) => ({
  id,
  title: id,
  group: "Forms",
  tags: [id],
  capability: id === "input-hidden" ? "non-rendered" : "form-control",
  kind: "native",
  purpose: "Preserve native form behavior.",
  treatment: activeIds.includes(id) ? "Apply the shared action-control intent." : "Keep Native Fallback.",
  contextGuidance: nativeIds.includes(id) ? "Preserve native selection, submission, naming, focus, and security behavior." : undefined,
  use: ["Use semantic HTML and an accessible name."],
  avoid: "Do not replace native behavior.",
  constraints: ["Preserve disabled, submission, reset, file-picker, and coordinate behavior."],
  accessibility: ["Preserve keyboard, focus, touch, and assistive-technology behavior."],
  variants: activeIds.includes(id) ? [{ name: "secondary", when: "Use for a lower-priority action." }] : [],
  defaultVariant: activeIds.includes(id) ? "default" : undefined,
  semanticHtml: formsFileActionTreatments[id]?.specimens[0].semanticHtml ?? `<input type="${id.slice(6)}">`,
  activationEvidence: activeIds.includes(id) ? evidence : undefined,
  version: activeIds.includes(id) ? "1.0.0" : "0.0.0",
  baseline: {
    status: "widely-available",
    source: "mdn",
    sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/${id.slice(6)}`,
    checkedAt: "2026-07-23",
  },
  deprecated: false,
  order: 860 + index,
  sourceUrl: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/${id.slice(6)}`,
});
const catalogResult = buildElementCatalog({
  guidance: [inputOwner, ...[...activeIds, ...nativeIds].map(guidance)],
  treatments: formsFileActionTreatments,
  tokens: starterTokenRegistry,
});

test("Forms file/action records three Active controls and three deliberate Native fallbacks", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  assert.deepEqual(Object.keys(formsFileActionTreatments), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => item.lifecycle === "Active").map((item) => item.id), activeIds);
  assert.deepEqual(catalogResult.data.group("Forms").filter((item) => nativeIds.includes(item.id)).map((item) => item.id), nativeIds);
  for (const id of [...activeIds, ...nativeIds]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    assert.match(source, new RegExp(`^version: "${activeIds.includes(id) ? "1\\.0\\.0" : "0\\.0\\.0"}"$`, "m"));
    assert.match(source, /checkedAt: "2026-07-23"/);
  }
});

test("Button-like inputs expand canonical action intent into independent locked CSS boxes", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const buttonDefinition = actionsTreatments.button;
  const expectedRules = ["base", "hover", "focus-visible", "active", "disabled", "secondary"];
  for (const id of activeIds) {
    const type = id.slice(6);
    const element = catalogResult.data.get(id);
    assert.deepEqual(element.rules.map((item) => item.path), expectedRules.map((ruleId) => `${id}/${ruleId}`));
    assert.equal(element.rules[0].rule.selector, `:where(input[type="${type}"])`);
    assert.equal(element.rules[1].rule.selector, `:where(input[type="${type}"]:not(:disabled):hover)`);
    assert.equal(element.rules[2].rule.selector, `:where(input[type="${type}"]:not(:disabled):focus-visible)`);
    assert.equal(element.rules[3].rule.selector, `:where(input[type="${type}"]:not(:disabled):active)`);
    assert.equal(element.rules[4].rule.selector, `:where(input[type="${type}"]:disabled)`);
    assert.equal(element.rules[5].rule.selector, `:where(input[type="${type}"]:not(:disabled)[data-variant="secondary"])`);
    assert.equal(element.rules[2].rule.declarations["outline-offset"].starter.value, "-2px");
    assert.deepEqual(Object.keys(element.rules[4].rule.declarations), ["color", "background-color", "border-color"]);
    assert.deepEqual(element.definition.contrastChecks.map((item) => item.id), [
      `${id}-base-text`,
      `${id}-secondary-text`,
      `${id}-base-boundary`,
      `${id}-secondary-boundary`,
      `${id}-disabled-text`,
      `${id}-disabled-boundary`,
      `${id}-focus-inner`,
      `${id}-focus-secondary-inner`,
      `${id}-focus-outer`,
    ]);
    assert.notEqual(element.definition, buttonDefinition);
    assert.notEqual(element.rules[0].rule.declarations, buttonDefinition.rules[0].declarations);
  }
  assert.notEqual(formsFileActionTreatments["input-submit"].rules[0].declarations, formsFileActionTreatments["input-reset"].rules[0].declarations);
  assert.notEqual(formsFileActionTreatments["input-reset"].rules[0].declarations, formsFileActionTreatments["input-button"].rules[0].declarations);
  const buttonSpecimen = formsFileActionTreatments["input-button"].specimens[0].semanticHtml;
  assert.match(buttonSpecimen, /onclick=/);
  assert.match(buttonSpecimen, /<output aria-live="polite"><\/output>/);
  assert.doesNotMatch(buttonSpecimen, /popovertarget|popover>/);
});

test("Native file, image, and hidden inputs emit zero CSS and decision-helpful Context", () => {
  assert.equal(catalogResult.success, true, JSON.stringify(catalogResult.diagnostics));
  const compilation = compileFramework({
    catalog: catalogResult.data,
    primitiveDefaults: starterPrimitiveDefaults,
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });
  assert.equal(compilation.artifacts.elements.available, true, JSON.stringify(compilation.diagnostics));
  for (const id of activeIds) assert.match(compilation.artifacts.elements.value.value, new RegExp(`${id}/base`));
  for (const id of nativeIds) {
    assert.equal(catalogResult.data.get(id).definition, undefined);
    assert.doesNotMatch(compilation.artifacts.elements.value.value, new RegExp(`${id}/`));
    assert.match(compilation.artifacts.context.value.value, new RegExp("`" + id + "` 0\\.0\\.0"));
  }
  assert.doesNotMatch(compilation.artifacts.elements.value.value, /input\[type="hidden"\]/);
  for (const id of ["input-file", "input-image", "input-hidden"]) {
    const source = readFileSync(join(process.cwd(), "src", "content", "elements", `${id}.md`), "utf8");
    const renderedBody = source.slice(source.lastIndexOf("---") + 3);
    assert.match(renderedBody, new RegExp(`type="${id.slice(6)}"`));
  }
  const fileSource = readFileSync(join(process.cwd(), "src", "content", "elements", "input-file.md"), "utf8");
  assert.match(fileSource, /aria-describedby="profile-image-help"/);
  assert.match(fileSource, /id="profile-image-help"/);
  const imageBody = readFileSync(join(process.cwd(), "src", "content", "elements", "input-image.md"), "utf8").split("---").at(-1);
  assert.doesNotMatch(imageBody, /<label\b/);
  assert.match(imageBody, /alt="Submit selection"/);
});
