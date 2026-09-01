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
  setPatternExportName,
  setPatternStateControl,
} from "../src/patterns/engine.ts";
import { patternCatalog, patternDefinitions } from "../src/patterns/registry.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const ids = ["button", "badge", "card", "clickable-card", "listing-card"];

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
    if (definition.defaultAttributes) {
      for (const [name, value] of Object.entries(definition.defaultAttributes)) {
        assert.match(compiled.html, new RegExp(`${name}="${value}"`));
      }
    } else assert.equal(compiled.html, definition.html);
    assert.match(compiled.css, new RegExp(`^${definition.selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{`));
    assert.ok(compiled.inlineStyle.length > 10);
    if (definition.supportCss) assert.ok(compiled.css.includes(definition.supportCss.trim()));
  }
});

test("every package's settings modify the same compiled Pattern state", () => {
  for (const definition of patternDefinitions) {
    for (const control of definition.controls) {
      const defaultState = defaultPatternState(definition);
      assert.notEqual(selectedPatternOption(definition, defaultState, control.id), undefined, `${definition.id}/${control.id} default`);
      for (const option of control.options) {
        const state = setPatternStateControl(definition, defaultState, control.id, option.id);
        assert.equal(selectedPatternOption(definition, state, control.id), option.id, `${definition.id}/${control.id}/${option.id}`);
        assert.deepEqual(compilePattern(definition, state).state, state);
      }
    }
  }
});

test("Listing card settings compile portable data attributes into the root HTML", () => {
  const listing = patternDefinitions.find(({ id }) => id === "listing-card");
  assert.ok(listing);
  let state = defaultPatternState(listing);
  assert.match(compilePattern(listing, state).html, /<article class="pattern-listing-card" data-media="inset">/);

  state = setPatternStateControl(listing, state, "media", "cover");
  state = setPatternStateControl(listing, state, "density", "compact");
  state = setPatternStateControl(listing, state, "tone", "accent");
  const cover = compilePattern(listing, state);
  assert.match(cover.html, /data-media="cover"/);
  assert.match(cover.html, /data-density="compact"/);
  assert.match(cover.html, /data-tone="accent"/);

  const withoutMedia = compilePattern(listing, setPatternStateControl(listing, state, "media", "off"));
  assert.doesNotMatch(withoutMedia.html, /data-media=/);
  assert.doesNotMatch(withoutMedia.html, /data-unsafe=/);
});

test("Pattern export names rewrite HTML, CSS selectors, and named containers together", () => {
  const listing = patternDefinitions.find(({ id }) => id === "listing-card");
  assert.ok(listing);

  const renamed = compilePattern(listing, setPatternExportName(
    listing,
    defaultPatternState(listing),
    " Client Property Card! ",
  ));

  assert.equal(renamed.state.exportName, "client-property-card");
  assert.equal(renamed.selector, ".client-property-card");
  assert.match(renamed.html, /class="client-property-card"/);
  assert.match(renamed.html, /class="client-property-card__media"/);
  assert.match(renamed.css, /^\.client-property-card \{/);
  assert.match(renamed.css, /\.client-property-card__media/);
  assert.match(renamed.css, /container:\s*client-property-card\/inline-size/);
  assert.match(renamed.css, /@container client-property-card/);
  assert.doesNotMatch(`${renamed.html}\n${renamed.css}`, /pattern-listing-card/);

  const invalid = setPatternExportName(listing, renamed.state, "123");
  assert.equal(invalid.exportName, "pattern-listing-card");
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
  assert.match(settings, /<PatternCssEditor selector=\{compiled\.selector\}/);
  assert.match(settings, /<PatternHtmlEditor html=\{compiled\.html\}/);
  assert.match(settings, /data-pattern-export-name/);
  assert.match(settings, /data-pattern-reset data-settings-recovery/);
  assert.match(preview, /data-pattern-live-css/);
  assert.match(preview, /set:html=\{compiled\.html\}/);
  assert.match(controller, /Preview is keeping the last valid CSS/);
  assert.match(controller, /navigator\.clipboard\.writeText/);
  assert.match(controller, /setPatternStateControl/);
  assert.match(controller, /setPatternExportName/);
  assert.match(controller, /specimen\.innerHTML = compilation\.html/);
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
