import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { formatCss, formatHtml } from "../src/code-editor/format.ts";
import {
  compilePattern,
  defaultPatternState,
  parseStoredPatternState,
  patternStorageKey,
  sanitizePatternState,
  scopePatternPreviewCss,
  selectedPatternOption,
  serializePatternState,
  setPatternControl,
  setPatternExportName,
  setPatternHtml,
  setPatternStateControl,
  setPatternStylesheet,
} from "../src/patterns/engine.ts";
import { packagePatternArtifacts, patternArtifactFiles } from "../src/patterns/package-artifacts.ts";
import { cssRuleRange, htmlElementRange, replaceSourceRange, resolveNestedSelector, sourceRangeFragment } from "../src/patterns/inspector-source.ts";
import { patternCatalog, patternDefinitions } from "../src/patterns/registry.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const ids = ["button", "listing-card"];

test("each Pattern is a colocated package behind one registry interface", () => {
  assert.deepEqual(patternDefinitions.map(({ id }) => id), ids);
  assert.deepEqual(patternCatalog.map(({ href }) => href), ids.map((id) => `/patterns/${id}`));
  for (const removedId of ["badge", "card", "clickable-card", "section", "container"]) {
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
    } else assert.equal(compiled.html, formatHtml(definition.html));
    assert.match(compiled.css, new RegExp(`^${definition.selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{`));
    assert.ok(compiled.inlineStyle.length > 10);
    if (definition.supportCss) assert.ok(compiled.css.includes(formatCss(definition.supportCss)));
    assert.equal(setPatternStylesheet(definition, defaultPatternState(definition), compiled.css).success, true, `${definition.id} owns every CSS selector`);
  }
});

test("compiled Pattern HTML and CSS always use tab indentation", () => {
  const listing = patternDefinitions.find(({ id }) => id === "listing-card");
  const compiled = compilePattern(listing);

  assert.equal(compiled.html, formatHtml(compiled.html));
  assert.equal(compiled.css, formatCss(compiled.css));
  assert.match(compiled.html, /\n\t<div/);
  assert.match(compiled.css, /\n\t--listing-card-background:/);
  assert.doesNotMatch(`${compiled.html}\n${compiled.css}`, /^ +\S/gm);
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

test("Button authoring exposes every shared btn rule while Preview isolates its stylesheet", () => {
  const button = patternDefinitions.find(({ id }) => id === "button");
  assert.ok(button);
  const compiled = compilePattern(button);
  assert.equal(button.selector, ".btn");
  assert.equal(button.authoringSurfaceFor, "button");
  assert.match(compiled.html, /^<button class="btn"/);
  assert.match(compiled.css, /^\.btn \{/);
  assert.doesNotMatch(compiled.css, /pattern-button|@scope/);
  assert.equal(button.dependencies, undefined);
  assert.match(compiled.css, /display: inline-flex/);
  assert.match(compiled.css, /font-family: var\(--font-body\)/);
  assert.match(compiled.css, /&:hover/);
  assert.match(compiled.css, /&:focus-visible/);
  assert.equal(scopePatternPreviewCss(button, compiled.css), `@scope ([data-pattern-scope="button"]) {\n${compiled.css}\n}`);
});

test("Listing card composes the shared Button component and nests owned selectors", () => {
  const listing = patternDefinitions.find(({ id }) => id === "listing-card");
  assert.ok(listing);
  const compiled = compilePattern(listing);

  assert.deepEqual(listing.dependencies, ["button"]);
  assert.match(compiled.html, /class="btn pattern-listing-card__action"/);
  assert.match(compiled.css, /\.pattern-listing-card \{[\s\S]*& \.pattern-listing-card__media \{/);
  assert.match(compiled.css, /& \.pattern-listing-card__action \{[\s\S]*--btn-background:/);
  assert.doesNotMatch(compiled.css, /\.pattern-listing-card__action \{\s*display:/);
  assert.match(compiled.css, /&\[data-media="cover"\] \{[\s\S]*?border: 0;/);
});

test("Button relates repeated treatment colors through contextual component hooks", () => {
  const button = patternDefinitions.find(({ id }) => id === "button");
  assert.ok(button);
  const primary = compilePattern(button);
  assert.match(primary.css, /--btn-background: var\(--semantic-action\);/);
  assert.match(primary.css, /--btn-border-color: var\(--btn-background\);/);
  assert.match(primary.css, /border-color: var\(--btn-border-color,/);
  assert.match(primary.css, /background: var\(--btn-background,/);
  assert.match(primary.css, /color: var\(--btn-text-color,/);

  const secondary = compilePattern(button, setPatternStateControl(button, defaultPatternState(button), "treatment", "secondary"));
  assert.match(secondary.css, /--btn-background: var\(--semantic-surface\);/);
  assert.match(secondary.css, /--btn-border-color: var\(--semantic-border\);/);
  assert.match(secondary.css, /--btn-text-color: var\(--semantic-text\);/);
});

test("Listing card settings compile portable data attributes into the root HTML", () => {
  const listing = patternDefinitions.find(({ id }) => id === "listing-card");
  assert.ok(listing);
  assert.equal(patternStorageKey(listing), "techies-tools:pattern-listing-card:v4");
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
  const [button, listingCard] = patternDefinitions;
  const unsafe = sanitizePatternState(button, { source: "background: url(https://example.com/image.png);" });
  assert.equal(unsafe.source, button.defaultCss);

  const source = setPatternControl(button, button.defaultCss, "radius", "large");
  const stored = serializePatternState(button, { source });
  assert.equal(patternStorageKey(button), "techies-tools:pattern-button:v5");
  assert.equal(parseStoredPatternState(button, stored).source, source);
  assert.equal(parseStoredPatternState(listingCard, stored).source, listingCard.defaultCss);
  assert.equal(parseStoredPatternState(button, "not json").source, defaultPatternState(button).source);
  assert.equal(sanitizePatternState(button, { ...defaultPatternState(button), nestedSource: "& + body { display:none; }" }).nestedSource, button.nestedCss.trim());
});

test("advanced Pattern HTML and full CSS edit the same safe compiled state", () => {
  const button = patternDefinitions[0];
  let state = defaultPatternState(button);
  const html = setPatternHtml(button, state, compilePattern(button, state).html.replace("Create pattern", "Ship it"));
  assert.equal(html.success, true);
  state = html.state;
  const css = setPatternStylesheet(button, state, `${compilePattern(button, state).css}\n\n@media (width > 40rem) { .btn:hover { opacity: .8; } }`);
  assert.equal(css.success, true);
  state = css.state;
  const compiled = compilePattern(button, state);
  assert.match(compiled.html, /Ship it/);
  assert.match(compiled.css, /opacity:\s*\.8/);
  assert.equal(setPatternHtml(button, state, '<script>alert(1)</script>').success, false);
  assert.equal(setPatternHtml(button, state, `<div>${compiled.html}</div>`).success, false);
  assert.equal(setPatternHtml(button, state, '<button class="btn-group">Ship it</button>').success, false);
  assert.equal(setPatternStylesheet(button, state, 'body { color: red; }').success, false);
  assert.equal(setPatternStylesheet(button, state, `${compiled.css}\n\n.foreign { color: red; }`).success, false);
  assert.equal(setPatternStylesheet(button, state, `${compiled.css}\n\nbody:not(.btn) { color: red; }`).success, false);
  assert.equal(setPatternStylesheet(button, state, `${compiled.css}\n\n.btn + .external { color: red; }`).success, false);
  assert.match(compilePattern(button, setPatternStateControl(button, state, "radius", "large")).css, /opacity:\s*\.8/);
});

test("advanced editing preserves semantic tags when the export class matches an element name", () => {
  const definition = patternDefinitions[0];
  const renamed = setPatternExportName(definition, defaultPatternState(definition), "button");
  const compiled = compilePattern(definition, renamed);
  const html = setPatternHtml(definition, renamed, compiled.html.replace("Create pattern", "Keep button"));
  const css = setPatternStylesheet(definition, html.state, compiled.css);
  assert.equal(html.success, true);
  assert.equal(css.success, true);
  assert.match(compilePattern(definition, css.state).html, /^<button class="button"/);
  assert.doesNotMatch(compilePattern(definition, css.state).html, /<pattern-button/);
});

test("short namespaces rename only owned class and container tokens", () => {
  const definition = patternDefinitions[0];
  const state = setPatternExportName(definition, {
    ...defaultPatternState(definition),
    htmlSource:'<button class = "btn btn__label btn-group" title="btn guide">btn guide</button>',
    supportSource:'.btn::after { content: ".btn btn guide"; }',
  }, "action");
  const compiled = compilePattern(definition, state);
  assert.match(compiled.html, /class="action action__label btn-group" title="btn guide">btn guide/);
  assert.match(compiled.css, /\.action::after \{\s+content: "\.btn btn guide";\s+\}/);
  assert.doesNotMatch(compiled.css, /\.btn::after/);
});

test("Pattern export packages the exact current HTML and CSS", () => {
  const compiled = compilePattern(patternDefinitions[0]);
  assert.deepEqual(patternArtifactFiles(compiled), [
    { name: `${compiled.state.exportName}.css`, value: compiled.css },
    { name: `${compiled.state.exportName}.html`, value: compiled.html },
  ]);
  assert.equal(packagePatternArtifacts(compiled).name, `${compiled.state.exportName}.zip`);
});

test("Pattern inspector maps a clicked DOM-order element to its authored HTML and CSS", () => {
  const html = '<article class="card"><!-- note --><h2 title="1 > 0">Title</h2><p>Body</p></article>';
  assert.deepEqual(htmlElementRange(html, 1), { start: html.indexOf("<h2"), end: html.indexOf("</h2>") + 5 });
  const css = ".card { padding: 1rem; }\n.card h2 { color: red; }";
  assert.deepEqual(cssRuleRange(css, [".card h2", "h2"]), { start: css.indexOf(".card h2"), end: css.length });
  const multilineCss = ".card__header,\n.card__footer { display: flex; }";
  assert.deepEqual(cssRuleRange(multilineCss, [".card__header, .card__footer"]), { start:0, end:multilineCss.length });
  const nestedCss = ".card { & .card__body { color: red; } }";
  assert.deepEqual(cssRuleRange(nestedCss, ["& .card__body"]), { start:nestedCss.indexOf("&"), end:nestedCss.indexOf("}") + 1 });
  assert.equal(resolveNestedSelector("& .card__body", ".card"), ":is(.card) .card__body");
  assert.equal(replaceSourceRange(html, htmlElementRange(html, 1), "<h2>Changed</h2>"), '<article class="card"><!-- note --><h2>Changed</h2><p>Body</p></article>');
  const nestedHtml = "<article>\n    <header>\n      <h2>Title</h2>\n    </header>\n</article>";
  const nestedRange = htmlElementRange(nestedHtml, 1);
  assert.equal(sourceRangeFragment(nestedHtml, nestedRange), "<header>\n  <h2>Title</h2>\n</header>");
  assert.equal(replaceSourceRange(nestedHtml, nestedRange, "<header>\n  <h2>Changed</h2>\n</header>"), "<article>\n    <header>\n      <h2>Changed</h2>\n    </header>\n</article>");
});

test("all Pattern routes use shared authoring UI with separate controls, HTML, and CSS", () => {
  const route = read("src", "pages", "patterns", "[pattern].astro");
  const settings = read("src", "components", "patterns", "PatternSettingsBar.astro");
  const preview = read("src", "components", "patterns", "PatternPreview.astro");
  const controller = read("src", "patterns", "controller", "browser.ts");
  const drawer = read("src", "components", "patterns", "PatternAdvancedDrawer.astro");
  const exportDialog = read("src", "components", "patterns", "PatternExportDialog.astro");
  const shell = read("src", "components", "dashboard", "AppShell.astro");
  const index = read("src", "pages", "patterns.astro");

  assert.match(route, /getPatternDefinition\(Astro\.params\.pattern/);
  assert.match(route, /<PatternSettingsBar slot="settings" definition=\{definition\}/);
  assert.match(route, /<PatternPreview definition=\{definition\}/);
  assert.match(settings, /definition\.controls\.map/);
  assert.doesNotMatch(settings, /<PatternAdvancedDrawer/);
  assert.match(settings, /data-pattern-advanced-open/);
  assert.match(route, /<PatternAdvancedDrawer slot="advanced"[^>]*html=\{compiled\.html\} css=\{compiled\.css\}/);
  assert.match(settings, /<PatternExportDialog slot="footer"/);
  assert.match(drawer, /<section[^>]*hidden[^>]*data-pattern-advanced-drawer/);
  assert.match(drawer, /data-pattern-drawer-resizer/);
  assert.match(drawer, /data-pattern-editor-resizer/);
  assert.match(drawer, /role="separator"/);
  assert.match(drawer, /setPointerCapture/);
  assert.match(drawer, /nextDrawerHeight/);
  assert.match(drawer, /nextEditorSplit/);
  assert.match(drawer, /@media\(max-width:720px\)/);
  assert.match(drawer, /import CodeEditor from "\.\.\/code\/CodeEditor\.astro"/);
  assert.doesNotMatch(drawer, /<header>|PatternCssEditor|PatternHtmlEditor/);
  assert.match(drawer, /language="html"/);
  assert.match(drawer, /language="css"/);
  assert.match(drawer, /completion/);
  assert.match(drawer, /data-pattern-selection/);
  assert.match(drawer, /data-pattern-selection-path/);
  assert.match(drawer, /aria-label="Selected HTML path"/);
  assert.match(drawer, /ChevronRight/);
  assert.match(drawer, /data-pattern-breadcrumb-separator/);
  assert.doesNotMatch(drawer, /data-pattern-select-next|Next element|pattern-advanced__next/);
  assert.match(shell, /<slot name="advanced"/);
  assert.match(exportDialog, /<SettingsExportActions/);
  assert.doesNotMatch(settings, /data-settings-accordion="export"|data-pattern-export-name/);
  assert.match(exportDialog, /data-pattern-export-name/);
  assert.match(exportDialog, /Requires components\.css/);
  assert.match(exportDialog, /<Fragment slot="sidebar">[\s\S]*data-pattern-export-name[\s\S]*<SettingsExportChoiceSet/);
  assert.doesNotMatch(exportDialog, /pattern-export-name-help|Renames matching HTML classes/);
  assert.match(settings, /data-pattern-reset data-settings-recovery/);
  assert.match(preview, /data-pattern-live-css/);
  assert.match(preview, /data-pattern-scope=\{definition\.id\}/);
  assert.doesNotMatch(preview, /pattern-preview__caption|uses the same HTML and CSS/);
  assert.match(controller, /scopePatternPreviewCss/);
  assert.match(controller, /cssProjection = \{ start:0, end:compilation\.css\.length \}/);
  assert.match(controller, /revealSourceOffset\(editor!, selectedCssRange\?\.start \?\? 0\)/);
  assert.match(controller, /markSelectedElement\(selected, false, false\)/);
  assert.match(controller, /complete component CSS with the selected rule first/);
  assert.match(controller, /if \(advancedDrawer && !advancedDrawer\.hidden\) \{\s*closeAdvanced\(\);\s*return;/);
  assert.match(preview, /set:html=\{compiled\.html\}/);
  assert.match(preview, /initialWidth="fit"/);
  assert.match(controller, /Preview is keeping the last valid CSS/);
  assert.match(controller, /navigator\.clipboard\.writeText/);
  assert.match(controller, /setPatternStateControl/);
  assert.match(controller, /setPatternExportName/);
  assert.match(controller, /setPatternStylesheet/);
  assert.match(controller, /setPatternHtml/);
  assert.match(controller, /specimen\.innerHTML = compilation\.html/);
  assert.match(controller, /pointerover/);
  assert.match(controller, /setPointerCapture/);
  assert.match(controller, /pointercancel/);
  assert.match(controller, /data-pattern-inspector-selected/);
  assert.match(controller, /focusElementSource/);
  assert.match(controller, /renderSelectionPath/);
  assert.match(controller, /data-pattern-select-path/);
  assert.match(controller, /data-pattern-breadcrumb-separator/);
  assert.doesNotMatch(controller, /data-pattern-select-next|selectNext/);
  assert.match(controller, /replaceSourceRange/);
  assert.doesNotMatch(controller, /(?:editor|htmlSource)\.addEventListener\("blur", apply(?:Css|Html)Projection\)/);
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
