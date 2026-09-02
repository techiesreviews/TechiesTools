import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

const sharedComponents = [
  ["settings", "SettingsAccordion.astro"],
  ["settings", "SettingsColorField.astro"],
  ["settings", "SettingsExportActions.astro"],
  ["settings", "SettingsExportChoice.astro"],
  ["settings", "SettingsExportChoiceSet.astro"],
  ["settings", "SettingsExportCodePreview.astro"],
  ["settings", "SettingsExportDialog.astro"],
  ["settings", "SettingsExportDialogBody.astro"],
  ["settings", "SettingsRangeField.astro"],
  ["settings", "SettingsSegmentedControl.astro"],
  ["preview", "PreviewBrowser.astro"],
];

test("tool chrome exposes reusable Settings and Preview primitives", () => {
  for (const parts of sharedComponents) {
    assert.equal(existsSync(join(root, "src", "components", ...parts)), true, parts.join("/"));
  }

  const accordion = read("src", "components", "settings", "SettingsAccordion.astro");
  const color = read("src", "components", "settings", "SettingsColorField.astro");
  const range = read("src", "components", "settings", "SettingsRangeField.astro");
  const preview = read("src", "components", "preview", "PreviewBrowser.astro");

  assert.match(accordion, /data-settings-accordion/);
  assert.match(accordion, /data-settings-accordion-trigger/);
  assert.match(accordion, /aria-expanded/);
  assert.match(color, /data-settings-color-input="picker"/);
  assert.match(color, /data-settings-color-input="text"/);
  assert.match(color, /frameworkPalette/);
  assert.match(color, /data-settings-color-palette/);
  assert.match(range, /showStepMarks\?: boolean/);
  assert.match(range, /data-settings-range-control/);
  assert.match(range, /settings-range-field__track/);
  assert.match(range, /settings-range-field__marker/);
  assert.match(range, /\(\(index \+ 1\) \/ stepCount\) \* 100/);
  assert.match(range, /settings-range:sync/);
  assert.match(preview, /data-preview-address/);
  assert.match(preview, /data-preview-device="1440"/);
  assert.match(preview, /data-preview-device="768"/);
  assert.match(preview, /data-preview-device="390"/);
  assert.match(preview, /data-preview-device="fit"/);
  assert.match(preview, /data-preview-width/);
  assert.match(preview, /data-preview-zoom/);
  assert.match(preview, /data-preview-viewport-slider/);
});

test("Framework and Glass Card consume the same Settings and Preview chrome", () => {
  const frameworkSettings = read("src", "components", "dashboard", "FrameworkSettingsBar.astro");
  const elementsSettings = read("src", "components", "dashboard", "ElementsAccordion.astro");
  const frameworkColor = read("src", "components", "dashboard", "FrameworkColorRow.astro");
  const frameworkPreview = read("src", "components", "dashboard", "DesignSystemPreview.astro");
  const glassSettings = read("src", "components", "glass-card", "GlassCardSettingsBar.astro");
  const glassPreview = read("src", "components", "glass-card", "GlassCardPreview.astro");
  const glassBrowser = read("src", "glass-card", "controller", "browser.ts");
  const frameworkExport = read("src", "components", "dashboard", "FrameworkExportDialog.astro");
  const glassExport = read("src", "components", "glass-card", "GlassCardExportDialog.astro");

  assert.match(frameworkSettings, /import SettingsAccordion from "\.\.\/settings\/SettingsAccordion\.astro"/);
  assert.match(frameworkSettings, /<SettingsAccordion/);
  assert.match(elementsSettings, /<SettingsAccordion/);
  assert.match(frameworkColor, /import SettingsColorField from "\.\.\/settings\/SettingsColorField\.astro"/);
  assert.match(glassSettings, /import SettingsAccordion from "\.\.\/settings\/SettingsAccordion\.astro"/);
  assert.match(glassSettings, /import SettingsColorField from "\.\.\/settings\/SettingsColorField\.astro"/);
  assert.match(glassSettings, /frameworkPalette/);
  assert.match(glassSettings, /import SettingsRangeField from "\.\.\/settings\/SettingsRangeField\.astro"/);
  assert.match(glassSettings, /import SettingsSegmentedControl from "\.\.\/settings\/SettingsSegmentedControl\.astro"/);
  assert.match(frameworkExport, /import SettingsExportActions from "\.\.\/settings\/SettingsExportActions\.astro"/);
  assert.match(glassExport, /import SettingsExportActions from "\.\.\/settings\/SettingsExportActions\.astro"/);
  assert.match(frameworkExport, /<SettingsExportActions/);
  assert.match(glassExport, /<SettingsExportActions/);
  assert.doesNotMatch(frameworkExport, /\.framework-export__bar\s*\{/);
  assert.doesNotMatch(glassExport, /\.glass-export__bar\s*\{/);
  assert.match(frameworkPreview, /import PreviewBrowser from "\.\.\/preview\/PreviewBrowser\.astro"/);
  assert.match(glassPreview, /import PreviewBrowser from "\.\.\/preview\/PreviewBrowser\.astro"/);
  assert.doesNotMatch(glassPreview, /data-glass-viewport-button|glass-preview__toolbar|glass-preview__inspector/);
  assert.doesNotMatch(glassSettings, /glass-settings__color-controls|<input type="color"/);
  assert.doesNotMatch(glassBrowser, /data-glass-viewport-button/);
});

test("shared Settings export actions retain the promoted Framework footer treatment", () => {
  const actions = read("src", "components", "settings", "SettingsExportActions.astro");

  assert.match(actions, /grid-template-columns:\s*minmax\(0,\s*1fr\) 34px/);
  assert.match(actions, /gap:\s*6px/);
  assert.match(actions, /background:\s*var\(--semantic-text\)/);
  assert.match(actions, /color:\s*var\(--semantic-surface\)/);
  assert.match(actions, /outline:\s*2px solid var\(--semantic-focus\)/);
  assert.match(actions, /font-size:\s*11px/);
  assert.match(actions, /font-weight:\s*800/);
  assert.match(actions, /data-settings-export-open/);
  assert.match(actions, /data-settings-export-copy/);
});

test("Framework and Glass Card share the promoted export modal and its structural subcomponents", () => {
  const dialog = read("src", "components", "settings", "SettingsExportDialog.astro");
  const body = read("src", "components", "settings", "SettingsExportDialogBody.astro");
  const choice = read("src", "components", "settings", "SettingsExportChoice.astro");
  const preview = read("src", "components", "settings", "SettingsExportCodePreview.astro");
  const framework = read("src", "components", "dashboard", "FrameworkExportDialog.astro");
  const glass = read("src", "components", "glass-card", "GlassCardExportDialog.astro");

  for (const consumer of [framework, glass]) {
    assert.match(consumer, /import SettingsExportDialog from "\.\.\/settings\/SettingsExportDialog\.astro"/);
    assert.match(consumer, /import SettingsExportDialogBody from "\.\.\/settings\/SettingsExportDialogBody\.astro"/);
    assert.match(consumer, /import SettingsExportChoiceSet from "\.\.\/settings\/SettingsExportChoiceSet\.astro"/);
    assert.match(consumer, /import SettingsExportCodePreview from "\.\.\/settings\/SettingsExportCodePreview\.astro"/);
    assert.match(consumer, /<SettingsExportDialog/);
    assert.match(consumer, /<SettingsExportDialogBody/);
    assert.match(consumer, /<SettingsExportChoiceSet/);
    assert.match(consumer, /<SettingsExportCodePreview/);
    assert.match(consumer, /feedbackDataAttribute=/);
  }
  assert.match(dialog, /width:\s*min\(880px,calc\(100vw - 32px\)\)/);
  assert.match(dialog, /min-height:\s*min\(610px,calc\(100vh - 32px\)\)/);
  assert.match(dialog, /max-height:\s*min\(780px,calc\(100vh - 32px\)\)/);
  assert.match(dialog, /border-radius:\s*14px/);
  assert.match(dialog, /box-shadow:\s*0 28px 90px rgb\(15 23 42\/.28\)/);
  assert.match(dialog, /backdrop-filter:\s*blur\(2px\)/);
  assert.match(body, /grid-template-columns:\s*290px minmax\(0,1fr\)/);
  assert.match(body, /@media\(max-width:720px\)/);
  assert.match(choice, /aria-pressed/);
  assert.match(preview, /min-height:\s*410px/);
  assert.match(preview, /max-height:\s*410px/);
  assert.doesNotMatch(framework, /\.framework-export__dialog\s*\{|\.framework-export__surface\s*\{|\.framework-export__header\s*\{/);
  assert.doesNotMatch(glass, /\.glass-export__dialog\s*\{|\.glass-export__header\s*\{|\.glass-export__code\s*\{/);
});

test("Framework and Glass Card share the complete sidebar choice action set", () => {
  const choiceSet = read("src", "components", "settings", "SettingsExportChoiceSet.astro");
  const framework = read("src", "components", "dashboard", "FrameworkExportDialog.astro");
  const glass = read("src", "components", "glass-card", "GlassCardExportDialog.astro");

  assert.match(choiceSet, /import SettingsExportChoice from "\.\/SettingsExportChoice\.astro"/);
  assert.match(choiceSet, /<Copy[^>]+aria-hidden="true"/);
  assert.match(choiceSet, /> Copy<\/button>/);
  assert.match(choiceSet, /<Download[^>]+aria-hidden="true"/);
  assert.match(choiceSet, /> Save<\/button>/);
  assert.match(choiceSet, /<Package[^>]+aria-hidden="true"/);
  assert.match(choiceSet, /> Download all\s*<\/button>/);
  assert.match(choiceSet, /copyDataAttribute/);
  assert.match(choiceSet, /saveDataAttribute/);
  assert.match(choiceSet, /downloadAllDataAttribute/);

  for (const consumer of [framework, glass]) {
    assert.match(consumer, /import SettingsExportChoiceSet from "\.\.\/settings\/SettingsExportChoiceSet\.astro"/);
    assert.match(consumer, /<SettingsExportChoiceSet/);
    assert.doesNotMatch(consumer, /import \{[^}]*(?:Copy|Download|Package)\b|<(?:Copy|Download|Package)(?:\s|\/)/);
  }

  assert.match(glass, /copyDataAttribute="data-glass-export-copy"/);
  assert.match(glass, /saveDataAttribute="data-glass-export-save"/);
  assert.match(glass, /downloadAllDataAttribute="data-glass-export-all"/);
  assert.doesNotMatch(glass, /role="tablist"|role="tabpanel"|glass-export__actions/);
});

test("shared color fields preserve custom entry and expose accessible Framework palette shortcuts", () => {
  const color = read("src", "components", "settings", "SettingsColorField.astro");
  const controller = read("src", "settings", "controller", "browser.ts");

  assert.match(color, /type="color"/);
  assert.match(color, /type="text"/);
  assert.match(color, /<fieldset[^>]+data-settings-color-palette/s);
  assert.match(color, /<legend>Framework colors<\/legend>/);
  assert.match(controller, /loadFrameworkPaletteColors/);
  assert.match(controller, /data-settings-color-choice/);
  assert.match(controller, /color\.variable/);
  assert.match(controller, /settings-color-field__choice-variable/);
  assert.match(controller, /settingsColorSelectedVariable/);
  assert.match(controller, /matchingButtons\.length === 1/);
  assert.match(color, /max-height:\s*260px/);
  assert.match(color, /overflow-y:\s*auto/);
  assert.match(controller, /new Event\("input",\s*\{ bubbles: true \}\)/);
  assert.match(controller, /new Event\("change",\s*\{ bubbles: true \}\)/);
  assert.match(controller, /settings-color:sync/);
});

test("tool authoring contract records shared-first decisions and React fit checks", () => {
  const guide = read("docs", "tools", "authoring.md");
  const decision = read("docs", "adr", "0018-shared-tool-settings-preview-and-react-boundary.md");

  assert.match(guide, /https:\/\/github\.com\/pixel-point\/toolcraft/);
  assert.match(guide, /shared-first/i);
  assert.match(guide, /State-output mapping/i);
  assert.match(guide, /state field, preview effect, persisted value, and export artifact/i);
  assert.match(guide, /React[^\n]+per tool/i);
  assert.match(guide, /SettingsAccordion\.astro/);
  assert.match(guide, /PreviewBrowser\.astro/);
  assert.match(decision, /status:\s*accepted/i);
  assert.match(decision, /React/i);
  assert.match(decision, /PreviewBrowser/);
});

test("shared Preview chrome renders a truthful container-sized viewport and accessible route combobox", () => {
  const preview = read("src", "components", "preview", "PreviewBrowser.astro");
  const controller = read("src", "preview", "controller", "browser.ts");
  const glassPreview = read("src", "components", "glass-card", "GlassCardPreview.astro");
  const segmentedController = read("src", "settings", "controller", "browser.ts");

  assert.match(preview, /width:\s*var\(--preview-browser-width\)/);
  assert.match(preview, /container-name:\s*tool-preview/);
  assert.match(preview, /box-sizing:\s*border-box/);
  assert.match(preview, /role=\{routes\.length \? "combobox"/);
  assert.match(preview, /aria-haspopup=\{routes\.length \? "listbox"/);
  assert.match(preview, /role="option"\s+tabindex="-1"/);
  assert.match(controller, /aria-activedescendant/);
  assert.match(controller, /aria-selected/);
  assert.match(controller, /canonicalAddress/);
  assert.match(controller, /restoreCanonicalAddress/);
  assert.match(controller, /ResizeObserver/);
  assert.match(controller, /applyFit/);
  assert.match(preview, /initialWidth = "fit"/);
  assert.match(controller, /addEventListener\("focusout"/);
  assert.match(controller, /closeSuggestions\(true\)/);
  assert.match(glassPreview, /@container\s+tool-preview\s*\(max-width:\s*720px\)/);
  assert.doesNotMatch(segmentedController, /aria-selected/);
});

test("shared tool shell stacks Main menu, Settings bar, and Preview on mobile", () => {
  const shell = read("src", "components", "dashboard", "AppShell.astro");

  assert.match(shell, /@media \(max-width: 720px\)[\s\S]*?\.dashboard-shell__rail\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(shell, /@media \(max-width: 720px\)[\s\S]*?\.dashboard-shell__settings\s*\{[\s\S]*?inline-size:\s*100%/);
});

test("Glass Card document, export, pointer cancellation, and ADR index preserve final state contracts", () => {
  const route = read("src", "pages", "tools", "glass-card.astro");
  const controller = read("src", "glass-card", "controller", "browser.ts");
  const exportDialog = read("src", "components", "glass-card", "GlassCardExportDialog.astro");
  const colorField = read("src", "components", "settings", "SettingsColorField.astro");
  const adrIndex = read("docs", "adr", "README.md");

  assert.match(route, /<!doctype html>/i);
  assert.match(route, /<html lang="en">/);
  assert.match(route, /<meta name="viewport" content="width=device-width"/);
  assert.match(controller, /const flushRender/);
  assert.match(controller, /flushRender\(\);\s*renderExport\(\);/);
  assert.match(controller, /pointercancel", cancelPointer/);
  assert.doesNotMatch(controller, /pointercancel", finishPointer/);
  assert.match(controller, /settings-color:sync/);
  assert.match(colorField, /<div\s+class="settings-color-field"/);
  assert.doesNotMatch(exportDialog, /role="tabpanel"|role="tablist"/);
  assert.match(exportDialog, /selectDataAttribute="data-glass-export-file"/);
  assert.match(exportDialog, /copyDataAttribute="data-glass-export-copy"/);
  assert.match(exportDialog, /saveDataAttribute="data-glass-export-save"/);
  assert.match(exportDialog, /downloadAllDataAttribute="data-glass-export-all"/);
  assert.match(controller, /data-glass-export-file/);
  assert.match(controller, /aria-pressed/);
  assert.doesNotMatch(controller, /data-glass-export-tab|tab\.focus\(\)/);
  assert.match(adrIndex, /0017-treatment-css-is-open-within-locked-rules\.md/);
});
