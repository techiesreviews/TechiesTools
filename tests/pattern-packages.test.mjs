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
  setPatternHtml,
  setPatternStateControl,
  setPatternStylesheet,
} from "../src/patterns/engine.ts";
import { packagePatternArtifacts, patternArtifactFiles } from "../src/patterns/package-artifacts.ts";
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
  assert.equal(sanitizePatternState(button, { ...defaultPatternState(button), supportSource: "body { display:none; }" }).supportSource, button.supportCss.trim());
});

test("advanced Pattern HTML and full CSS edit the same safe compiled state", () => {
  const button = patternDefinitions[0];
  let state = defaultPatternState(button);
  const html = setPatternHtml(button, state, compilePattern(button, state).html.replace("Create pattern", "Ship it"));
  assert.equal(html.success, true);
  state = html.state;
  const css = setPatternStylesheet(button, state, `${compilePattern(button, state).css}\n\n.pattern-button:hover { opacity: .8; }`);
  assert.equal(css.success, true);
  state = css.state;
  const compiled = compilePattern(button, state);
  assert.match(compiled.html, /Ship it/);
  assert.match(compiled.css, /opacity:\s*\.8/);
  assert.equal(setPatternHtml(button, state, '<script>alert(1)</script>').success, false);
  assert.equal(setPatternStylesheet(button, state, 'body { color: red; }').success, false);
  assert.match(compilePattern(button, setPatternStateControl(button, state, "radius", "large")).css, /opacity:\s*\.8/);
});

test("Pattern export packages the exact current HTML and CSS", () => {
  const compiled = compilePattern(patternDefinitions[0]);
  assert.deepEqual(patternArtifactFiles(compiled), [
    { name: `${compiled.state.exportName}.css`, value: compiled.css },
    { name: `${compiled.state.exportName}.html`, value: compiled.html },
  ]);
  assert.equal(packagePatternArtifacts(compiled).name, `${compiled.state.exportName}.zip`);
});

test("all Pattern routes use shared authoring UI with separate controls, HTML, and CSS", () => {
  const route = read("src", "pages", "patterns", "[pattern].astro");
  const settings = read("src", "components", "patterns", "PatternSettingsBar.astro");
  const preview = read("src", "components", "patterns", "PatternPreview.astro");
  const controller = read("src", "patterns", "controller", "browser.ts");
  const drawer = read("src", "components", "patterns", "PatternAdvancedDrawer.astro");
  const exportDialog = read("src", "components", "patterns", "PatternExportDialog.astro");
  const index = read("src", "pages", "patterns.astro");

  assert.match(route, /getPatternDefinition\(Astro\.params\.pattern/);
  assert.match(route, /<PatternSettingsBar slot="settings" definition=\{definition\}/);
  assert.match(route, /<PatternPreview definition=\{definition\}/);
  assert.match(settings, /definition\.controls\.map/);
  assert.match(settings, /<PatternAdvancedDrawer[^>]*html=\{compiled\.html\} css=\{compiled\.css\}/);
  assert.match(settings, /data-pattern-advanced-open/);
  assert.match(settings, /<PatternExportDialog slot="footer"/);
  assert.match(drawer, /<dialog[^>]*data-pattern-advanced-drawer/);
  assert.match(drawer, /grid-template-columns:repeat\(2/);
  assert.match(drawer, /@media\(max-width:720px\)/);
  assert.match(exportDialog, /<SettingsExportActions/);
  assert.match(settings, /data-pattern-export-name/);
  assert.match(settings, /data-pattern-reset data-settings-recovery/);
  assert.match(preview, /data-pattern-live-css/);
  assert.match(preview, /set:html=\{compiled\.html\}/);
  assert.match(controller, /Preview is keeping the last valid CSS/);
  assert.match(controller, /navigator\.clipboard\.writeText/);
  assert.match(controller, /setPatternStateControl/);
  assert.match(controller, /setPatternExportName/);
  assert.match(controller, /setPatternStylesheet/);
  assert.match(controller, /setPatternHtml/);
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
