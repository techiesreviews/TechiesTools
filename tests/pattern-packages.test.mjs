import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  compilePattern,
  defaultPatternState,
  parseStoredPatternState,
  patternStorageKey,
  sanitizePatternState,
  selectedPatternOption,
  serializePatternState,
  setPatternControl,
} from "../src/patterns/engine.ts";
import { patternCatalog, patternDefinitions } from "../src/patterns/registry.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const ids = ["button", "badge", "card", "clickable-card"];

test("each Pattern is a colocated package behind one registry interface", () => {
  assert.deepEqual(patternDefinitions.map(({ id }) => id), ids);
  assert.deepEqual(patternCatalog.map(({ href }) => href), ids.map((id) => `/patterns/${id}`));
  for (const removedId of ["section", "container"]) {
    assert.equal(existsSync(join(root, "src", "patterns", "library", removedId)), false);
  }

  for (const definition of patternDefinitions) {
    assert.equal(existsSync(join(root, "src", "patterns", "library", definition.id, "index.ts")), true);
    assert.ok(definition.html.length > 20, `${definition.id} HTML`);
    assert.ok(definition.defaultCss.includes("var(--"), `${definition.id} Framework CSS`);
    assert.ok(definition.controls.length >= 2, `${definition.id} settings`);
    assert.ok(definition.previewScale > 0 && definition.previewScale <= 1, `${definition.id} scale`);
  }
});

test("the shared compiler emits each package's HTML and complete CSS", () => {
  for (const definition of patternDefinitions) {
    const compiled = compilePattern(definition);
    assert.equal(compiled.html, definition.html);
    assert.match(compiled.css, new RegExp(`^${definition.selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{`));
    assert.ok(compiled.inlineStyle.length > 10);
    if (definition.supportCss) assert.ok(compiled.css.includes(definition.supportCss.trim()));
  }
});

test("every package's settings modify the same direct CSS source", () => {
  for (const definition of patternDefinitions) {
    for (const control of definition.controls) {
      assert.notEqual(selectedPatternOption(definition, definition.defaultCss, control.id), undefined, `${definition.id}/${control.id} default`);
      for (const option of control.options) {
        const source = setPatternControl(definition, definition.defaultCss, control.id, option.id);
        assert.equal(selectedPatternOption(definition, source, control.id), option.id, `${definition.id}/${control.id}/${option.id}`);
        assert.equal(compilePattern(definition, { source }).source, source);
      }
    }
  }
});

test("shared Pattern state blocks unsafe CSS and isolates persisted settings by Pattern ID", () => {
  const [button, badge] = patternDefinitions;
  const unsafe = sanitizePatternState(button, { source: "background: url(https://example.com/image.png);" });
  assert.equal(unsafe.source, button.defaultCss);

  const source = setPatternControl(button, button.defaultCss, "radius", "large");
  const stored = serializePatternState(button, { source });
  assert.equal(patternStorageKey(button), "techies-tools:pattern-button:v1");
  assert.equal(parseStoredPatternState(button, stored).source, source);
  assert.equal(parseStoredPatternState(badge, stored).source, badge.defaultCss);
  assert.equal(parseStoredPatternState(button, "not json").source, defaultPatternState(button).source);
});

test("all Pattern routes use shared authoring UI with separate controls, HTML, and CSS", () => {
  const route = read("src", "pages", "patterns", "[pattern].astro");
  const settings = read("src", "components", "patterns", "PatternSettingsBar.astro");
  const preview = read("src", "components", "patterns", "PatternPreview.astro");
  const controller = read("src", "patterns", "controller", "browser.ts");
  const index = read("src", "pages", "patterns.astro");

  assert.match(route, /getPatternDefinition\(Astro\.params\.pattern/);
  assert.match(route, /<PatternSettingsBar slot="settings" definition=\{definition\}/);
  assert.match(route, /<PatternPreview definition=\{definition\}/);
  assert.match(settings, /definition\.controls\.map/);
  assert.match(settings, /<PatternCssEditor selector=\{definition\.selector\}/);
  assert.match(settings, /<PatternHtmlEditor html=\{definition\.html\}/);
  assert.match(settings, /data-pattern-reset data-settings-recovery/);
  assert.match(preview, /data-pattern-live-css/);
  assert.match(preview, /set:html=\{compiled\.html\}/);
  assert.match(controller, /Preview is keeping the last valid CSS/);
  assert.match(controller, /navigator\.clipboard\.writeText/);
  assert.match(index, /patterns-library__card patterns-library__card--clickable/);
  assert.match(index, /<h2><a class="patterns-library__link"[^>]*>\{definition\.title\}<\/a><\/h2>/);
});

test("Card-only authoring implementation was replaced instead of layered", () => {
  for (const path of [
    ["src", "components", "patterns", "PatternCardSettingsBar.astro"],
    ["src", "components", "patterns", "PatternCardPreview.astro"],
    ["src", "patterns", "card", "model.ts"],
    ["src", "pages", "patterns", "card.astro"],
  ]) assert.equal(existsSync(join(root, ...path)), false, path.join("/"));
});
