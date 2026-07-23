import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("CSS declaration tooling uses the Cloudflare-safe css-tree ESM bundle", () => {
  const sources = [
    read("src", "framework", "css-declarations", "index.ts"),
    read("src", "framework", "element-authoring", "index.ts"),
  ];

  assert.match(sources.join("\n"), /from "css-tree\/dist\/csstree\.esm"/);
  for (const source of sources) assert.doesNotMatch(source, /^import(?!\s+type\b)[^;]+from "css-tree";/m);
});

test("Settings bar owns its accessible fixed-region shell", () => {
  const source = read("src", "components", "settings", "SettingsBar.astro");

  assert.match(source, /path:\s*string/);
  assert.match(source, /title:\s*string/);
  assert.match(source, /ariaLabel:\s*string/);
  assert.match(source, /<aside[^>]+class="settings-bar"[^>]+aria-label=\{ariaLabel\}/s);
  assert.match(source, /Astro\.slots\.has\("headerAction"\)/);
  assert.match(source, /<slot name="content"\s*\/>/);
  assert.match(source, /Astro\.slots\.has\("footer"\)/);
  assert.match(source, /data-has-footer=\{hasFooter/);
  assert.match(source, /isolation:isolate/);
  assert.match(source, /grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(source, /\.settings-bar\[data-has-footer\] \{ grid-template-rows:auto minmax\(0,1fr\) auto; \}/);
  assert.match(source, /settings-bar__header \{ position:relative; z-index:2/);
  assert.match(source, /settings-bar__footer \{ position:relative; z-index:2/);
  assert.match(source, /\.settings-bar:has\(:popover-open\) \.settings-bar__content \{ overflow:hidden; \}/);

  const header = source.indexOf("settings-bar__header");
  const content = source.indexOf("settings-bar__content");
  const footer = source.indexOf("settings-bar__footer");
  assert.ok(header >= 0 && header < content && content < footer);

  assert.equal(source.match(/overflow(?:-block)?:\s*auto/g)?.length, 1);
  for (const variable of ["inline-size", "surface", "border", "text", "muted", "accent"]) {
    assert.match(source, new RegExp(`--settings-bar-${variable}`));
  }
});

test("Framework combobox uses a native anchored Popover overlay", () => {
  const source = read("src", "components", "dashboard", "FrameworkCombobox.prototype.astro");

  assert.match(source, /popover="manual"/);
  assert.match(source, /showPopover\(\)/);
  assert.match(source, /hidePopover\(\)/);
  assert.match(source, /anchor-name:/);
  assert.match(source, /position-anchor:/);
  assert.match(source, /top:anchor\(bottom\)/);
  assert.match(source, /inset:auto/);
  assert.match(source, /width:anchor-size\(width\)/);
  assert.match(source, /position-try-fallbacks:flip-block/);
  assert.doesNotMatch(source, /overlay\.hidden/);
  const setValueStart = source.indexOf('root.addEventListener("framework-combobox:set-value"');
  const setValueEnd = source.indexOf('input?.addEventListener("focus"', setValueStart);
  const setValueHandler = source.slice(setValueStart, setValueEnd);
  assert.ok(setValueStart >= 0 && setValueEnd > setValueStart);
  assert.match(setValueHandler, /item\.dataset\.value===next/);
  assert.match(setValueHandler, /setAttribute\("aria-selected",String\(item===option\)\)/);
  assert.match(setValueHandler, /input\.value=option\.dataset\.label/);
  assert.match(setValueHandler, /value\.textContent=formatMeta/);
  assert.match(setValueHandler, /selectedPreview\.hidden=false/);
  assert.match(setValueHandler, /selectedPreview\.className=`framework-combobox__selected-preview is-\$\{type\}`/);
  assert.match(setValueHandler, /selectedPreview\.textContent=/);
  assert.match(setValueHandler, /selectedPreview\.style\.setProperty\("--preview"/);
  assert.match(setValueHandler, /searchIcon\.hidden=true/);
  assert.doesNotMatch(setValueHandler, /framework-combobox:select|dispatchEvent/);
  assert.match(source, /framework-combobox:update-options/);
  assert.match(source, /const anchorId = id\.replace/);
  assert.match(source, /--framework-combobox-\$\{anchorId\}/);
  assert.match(source, /\[data-combobox-id="element-picker"\] input:placeholder-shown \{ grid-row:1\/3; align-self:center; text-align:left; \}/);
});


test("Framework settings composition retains Framework ownership", () => {
  const source = read("src", "components", "dashboard", "FrameworkSettingsBar.astro");

  assert.match(source, /<SettingsBar path="Tools" title="Framework" ariaLabel="Framework settings">/);
  assert.match(source, /slot="headerAction"[^>]+data-framework-reset/);
  assert.match(source, /<Fragment slot="content">/);
  assert.match(source, /<FrameworkExportDialog slot="footer"\s*\/>/);
  assert.match(source, /LEGACY_STORAGE_KEY = "techies-tools:framework:v1"/);
  assert.match(source, /UI_DIFF_KEY = "techies-tools:framework:ui-diffs:v1"/);
  assert.match(source, /stateDiff\(collectState\(\), defaultState\)/);
  assert.match(source, /mergeState\(defaultState/);
  assert.match(source, /framework-preview:update/);
  assert.match(source, /framework-export:request/);
  assert.match(source, /localStorage\.removeItem\(LEGACY_STORAGE_KEY\)/);
  assert.match(source, /localStorage\.removeItem\(UI_DIFF_KEY\)/);
  assert.match(source, /framework-primitives:request-baseline/);
  assert.match(source, /publishAll\("baseline"\)/);
  assert.match(source, /document\.querySelector<HTMLElement>\("\[data-framework-settings\]"\)\?\.closest<HTMLElement>\("\[data-settings-bar\]"\)/);
  assert.match(source, /\.settings-bar \{ --line:var\(--settings-bar-border\); --muted:var\(--settings-bar-muted\); --ink:var\(--settings-bar-text\); --accent:var\(--settings-bar-accent\); \}/);
  assert.doesNotMatch(source, /:global\(\.settings-bar\)/);
});

test("Framework settings bar persists selected Element treatment UI through page navigation", () => {
  const settings = read("src", "components", "dashboard", "FrameworkSettingsBar.astro");
  const elements = read("src", "components", "dashboard", "ElementsAccordion.astro");

  assert.match(settings, /elements\?:\s*\{ selectedElement:string\|null; treatmentRule:string\|null \}/);
  assert.match(settings, /window\.addEventListener\("framework-elements:state-change"/);
  assert.match(settings, /framework-elements:apply-ui-state/);
  assert.match(settings, /elements: elementUiState/);
  assert.doesNotMatch(elements, /localStorage/);
  assert.match(elements, /framework-elements:state-change/);
  assert.match(elements, /framework-elements:apply-ui-state/);
  assert.match(elements, /setTreatmentRule/);
});

test("migrated Framework path has no Sidebar compatibility alias", () => {
  assert.equal(existsSync(join(root, "src", "components", "dashboard", "FrameworkSidebar.astro")), false);

  const dashboard = read("src", "components", "dashboard", "DashboardShell.astro");
  const globalCss = read("src", "styles", "global.css");
  assert.match(dashboard, /import FrameworkSettingsBar from "\.\/FrameworkSettingsBar\.astro"/);
  assert.match(dashboard, /<FrameworkSettingsBar\s*\/>/);
  assert.doesNotMatch(`${dashboard}\n${globalCss}`, /FrameworkSidebar|framework-sidebar/);
  assert.match(globalCss, /dashboard-shell__rail > \.dashboard-shell__settings/);
});

test("Element CSS authoring exposes catalog-generated interaction and accessible editor contracts", () => {
  const source = read("src", "components", "dashboard", "ElementsAccordion.astro");
  const treatmentEditor = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /data-element-treatment/);
  assert.doesNotMatch(source, /data-element-treatment aria-live/);
  assert.match(source, /<legend class="sr-only">\{entry\.title\}<\/legend>/);
  assert.doesNotMatch(source, /elements-editor__treatment-heading|\{entry\.title\} treatment/);
  assert.match(source, /getCollection\("elements"\)/);
  assert.match(source, /<TreatmentCssEditor/);
  assert.match(source, /selector=\{rule\.selector\}/);
  assert.match(source, /lineCount=\{rule\.lineCount\}/);
  assert.match(source, /data-element-reset/);
  assert.match(source, /data-treatment-state-select/);
  assert.match(source, /<span>State<\/span>/);
  assert.match(source, /entry\.rules\.map\(\(rule, ruleIndex\)/);
  assert.match(source, /<option value=\{rule\.key\}>\{rule\.label\}<\/option>/);
  assert.match(source, /hidden=\{ruleIndex > 0 \? true : undefined\}/);
  assert.match(source, /stateSelect\.addEventListener\("change"/);
  assert.match(source, /setTreatmentRule\(stateSelect\.dataset\.elementId \?\? "",stateSelect\.value\)/);
  assert.match(source, /framework-elements:request-state/);
  assert.doesNotMatch(source, /data-element-group-reset/);
  assert.doesNotMatch(source, /data-treatment-(?:control|token-control|length-control|length-input)/);
  assert.doesNotMatch(source, /framework-elements:select/);
  for (const label of ["Base", "Hover", "Focus visible", "Active", "Quiet", "Current navigation", "Disabled", "Secondary"]) assert.match(source, new RegExp(`[:\"]${label}`));
  assert.match(source, /framework-elements:reset-element/);
  assert.doesNotMatch(source, /localStorage/);

  assert.match(treatmentEditor, /data-treatment-css-editor/);
  assert.match(treatmentEditor, /data-editor-size=\{editorSize\}/);
  assert.match(treatmentEditor, /lineCount <= 2 \? "compact" : lineCount <= 5 \? "standard" : "large"/);
  assert.match(treatmentEditor, /data-locked-selector/);
  assert.match(treatmentEditor, /Locked selector/);
  assert.match(treatmentEditor, /<textarea[^>]+role="combobox"[^>]+aria-autocomplete="list"/s);
  assert.match(treatmentEditor, /aria-controls=\{listboxId\}/);
  assert.match(treatmentEditor, /data-syntax-overlay/);
  assert.match(treatmentEditor, /data-caret-anchor/);
  assert.match(treatmentEditor, /role="listbox"/);
  assert.match(treatmentEditor, /role="listbox"[^>]+popover="manual"/);
  assert.match(treatmentEditor, /role="status" aria-live="polite"/);
  assert.match(treatmentEditor, /role="alert"/);
  assert.match(treatmentEditor, /data-diagnostic-checklist/);
  for (const key of ["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"]) assert.match(treatmentEditor, new RegExp(`event\\.key===\"${key}\"`));
  assert.match(treatmentEditor, /framework-elements:edit-rule/);
  assert.match(treatmentEditor, /framework-elements:complete/);
  assert.match(treatmentEditor, /setAttribute\("fill"/);
  assert.match(treatmentEditor, /syntax-color-marker/);
  assert.match(treatmentEditor, /tokenSwatches/);
  assert.match(treatmentEditor, /marker\.setAttribute\("fill", swatch\)/);
  assert.doesNotMatch(treatmentEditor, /innerHTML[^\n]*swatch/);
  assert.doesNotMatch(treatmentEditor, /style=|\.style\b|setAttribute\("style"/);
  assert.match(treatmentEditor, /\[data-editor-size="compact"\][^}]*block-size:72px/);
  assert.match(treatmentEditor, /\[data-editor-size="standard"\][^}]*block-size:112px/);
  assert.match(treatmentEditor, /\[data-editor-size="large"\][^}]*block-size:180px/);
  assert.doesNotMatch(treatmentEditor, /ResizeObserver|textarea\.style\.height/);
});

test("Treatment CSS editor grows with authored lines where field-sizing is available and retains a bounded fallback", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /@supports \(field-sizing: content\)/);
  assert.match(source, /\.treatment-css-editor__surface textarea \{ field-sizing:content; inline-size:100%; min-inline-size:100%; max-inline-size:100%; block-size:auto; height:auto; min-block-size:var\(--editor-min-block-size\); max-block-size:var\(--editor-max-block-size\); overflow-x:auto; overflow-y:auto; \}/);
  assert.match(source, /\[data-editor-size="compact"\] \.treatment-css-editor__surface \{ block-size:auto; min-block-size:72px; max-block-size:var\(--editor-max-block-size\); \}/);
  assert.match(source, /\[data-editor-size="standard"\] \.treatment-css-editor__surface \{ block-size:auto; min-block-size:112px; max-block-size:var\(--editor-max-block-size\); \}/);
  assert.match(source, /\[data-editor-size="large"\] \.treatment-css-editor__surface \{ block-size:auto; min-block-size:180px; max-block-size:var\(--editor-max-block-size\); \}/);
  assert.match(source, /\.treatment-css-editor__surface pre \{ position:absolute; inset:0;/);
  assert.doesNotMatch(source, /ResizeObserver|textarea\.style\.height/);
});

test("Treatment CSS editor keeps an inline fixed editable column and scrolls unwrapped long lines", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /\.treatment-css-editor__codeframe \{ min-inline-size:0; max-inline-size:100%; overflow:hidden; border:1px solid var\(--line\)/);
  assert.match(source, /\.treatment-css-editor__surface \{ --editor-max-block-size:360px; position:relative; inline-size:100%; min-inline-size:0; max-inline-size:100%; contain:inline-size; overflow:hidden; \}/);
  assert.match(source, /textarea,\.treatment-css-editor__surface pre \{ box-sizing:border-box; inline-size:100%; min-inline-size:100%; max-inline-size:100%; width:100%; height:100%; margin:0; overflow-x:auto; overflow-y:auto;/);
  assert.match(source, /white-space:pre;/);
  assert.match(source, /overlay\.parentElement!\.scrollLeft = textarea\.scrollLeft/);
  assert.match(source, /caretOverlay\.scrollLeft = textarea\.scrollLeft/);
});

test("color values use a safe non-layout-shifting square source marker", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /syntax-color-marker/);
  assert.match(source, /viewBox", "0 0 8 8"/);
  assert.match(source, /marker\.setAttribute\("width", "8"\)/);
  assert.match(source, /marker\.setAttribute\("height", "8"\)/);
  assert.match(source, /value\.prepend\(icon\)/);
  assert.match(source, /\.syntax-color-marker[^}]*position:absolute[^}]*width:6px[^}]*height:6px/);
  assert.doesNotMatch(source, /syntax-color-marker[^}]*underline|syntax-color-marker[^}]*bottom:-2px|syntax-color-marker[^}]*height:2px/);
  assert.doesNotMatch(source, /innerHTML[^\n]*swatch|style=|\.style\b/);
  assert.match(source, /value\.classList\.add\("has-color-marker"\)/);
  assert.match(source, /\$\{escapeHtml\(colon\)\}<span class="syntax-value">/);
  assert.match(source, /syntax-value\.has-color-marker\) \{ position:relative; padding-inline-start:0; \}/);
  assert.match(source, /syntax-color-marker\) \{ position:absolute; inset-inline-start:-8px; top:50%; width:6px; height:6px;/);
  assert.equal(source.match(/syntax-value\.has-color-marker/g)?.length, 1);
  assert.equal(source.match(/syntax-color-marker\) \{/g)?.length, 1);
  assert.doesNotMatch(source, /:global\(\.syntax-value\)\s*\{[^}]*padding-inline-start/);
  assert.match(source, /syntax-color-marker[^}]*inset-inline-start:-8px/);
  assert.match(source, /CSS\.supports\("color", rawValue\)/);
  assert.match(source, /const literalSwatch = !cssName && CSS\.supports\("color", rawValue\) \? rawValue : undefined/);
  assert.match(source, /const swatch = tokenSwatch \?\? literalSwatch/);
  assert.match(source, /value\.textContent = item\.resolvedValue \?\? item\.detail/);
  assert.match(source, /\(\?:--\[a-z0-9-\]\+\|-\?\[a-z\]\[a-z0-9-\]\*\)/);
});

test("completion anchoring mirrors the real textarea caret without syntax decoration spacing", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /data-caret-overlay/);
  assert.match(source, /caretOverlay\.replaceChildren\(beforeCaret, caret, afterCaret/);
  assert.match(source, /caretOverlay\.scrollTop = textarea\.scrollTop/);
  assert.match(source, /caretOverlay\.scrollLeft = textarea\.scrollLeft/);
  assert.match(source, /overlay\.parentElement!\.scrollTop = textarea\.scrollTop/);
  assert.match(source, /overlay\.parentElement!\.scrollLeft = textarea\.scrollLeft/);
  assert.doesNotMatch(source, /overlay\.innerHTML = [^\n]+data-caret-anchor/);
});

test("completion listbox stays closed at a blank declaration cursor", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /const completionSegment = \(\) => \{/);
  assert.match(source, /if \(!completionSegment\(\)\.trim\(\)\) \{ closeListbox\(\); return; \}/);
  assert.match(source, /textarea\.addEventListener\("click", syncOverlay\);/);
  assert.doesNotMatch(source, /textarea\.addEventListener\("click",[^\n]*requestCompletions/);
});

test("completion listbox uses the top layer and preserves variable names over resolved-value overflow", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /listbox\.showPopover\(\)/);
  assert.match(source, /listbox\.hidePopover\(\)/);
  assert.match(source, /listbox\.matches\(":popover-open"\)/);
  assert.doesNotMatch(source, /listbox\.hidden/);
  assert.match(source, /position:fixed; position-anchor:--treatment-caret/);
  assert.match(source, /position-try-fallbacks:flip-block,flip-inline,flip-block flip-inline/);
  assert.match(source, /width:min\(260px,calc\(100vw - 10px\)\); max-inline-size:calc\(100vw - 10px\)/);
  assert.match(source, /grid-template-columns:max-content minmax\(0,1fr\)/);
  assert.match(source, /\.completion-main\) \{ display:flex; align-items:center; gap:5px; min-width:max-content/);
  assert.match(source, /\.completion-main\) code \{[^}]*white-space:nowrap/);
});

test("completion options retain a full accessible label while safely highlighting the typed fragment", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /const appendHighlightedLabel =/);
  assert.match(source, /document\.createElement\("mark"\)/);
  assert.match(source, /target\.append\(document\.createTextNode/);
  assert.match(source, /option\.setAttribute\("aria-label", item\.label\)/);
  assert.doesNotMatch(source, /innerHTML[^\n]*completion/);
  assert.match(source, /setRangeText\(completion\.insertText, start, textarea\.selectionEnd, "end"\)/);
  assert.match(source, /min-height:24px; padding:3px 5px/);
  assert.match(source, /\.completion-main\) code \{[^}]*font:600 12px\/1\.3/);
  assert.match(source, /:global\(small\) \{[^}]*font-size:11px/);
  assert.match(source, /:global\(mark\) \{[^}]*font-weight:850[^}]*text-decoration:underline/);
});

test("token completion rows hide resolved values and highlight the variable-name query without its command prefix", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /const completionFragment = \(\) => \{[^}]*startsWith\("--"\) \? raw\.slice\(2\)/s);
  assert.match(source, /if \(item\.kind !== "token"\) \{[^}]*value\.textContent = item\.resolvedValue \?\? item\.detail/s);
});

test("Settings bar is wide enough for authored token values and remains viewport-safe", () => {
  const source = read("src", "components", "settings", "SettingsBar.astro");
  assert.match(source, /--settings-bar-inline-size:320px/);
  assert.match(source, /inline-size:min\(var\(--settings-bar-inline-size\),100vw\)/);
  assert.doesNotMatch(source, /--settings-bar-inline-size:260px/);
});

test("locked selector, declaration source, and closing brace share one accessible code frame", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /<div class="treatment-css-editor__codeframe" data-treatment-codeframe>[\s\S]*data-locked-selector[\s\S]*<textarea[\s\S]*data-closing-brace[\s\S]*<\/div>/);
  assert.match(source, /<label class="sr-only" for=\{editorId\}>\{label\} declarations<\/label>/);
  assert.match(source, /data-locked-selector[\s\S]*<code aria-label=\{`Locked selector: \$\{selector\}`\}>/);
  assert.match(source, /\.treatment-css-editor__codeframe \{[^}]*border:1px solid var\(--line\)[^}]*border-radius:7px/);
  const selector = source.indexOf("data-locked-selector");
  const textarea = source.indexOf("<textarea");
  const brace = source.indexOf("data-closing-brace");
  assert.ok(selector >= 0 && selector < textarea && textarea < brace);
});

test("editor preserves invalid authored drafts and warnings do not set aria-invalid", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.doesNotMatch(source, /dirty = false; closeListbox\(\);/);
  assert.match(source, /issue\?\.severity!=="warning"/);
  assert.match(source, /setAttribute\("role", issue\?\.severity==="warning" \? "status" : "alert"\)/);
  assert.match(source, /canonical !== undefined && \(detail\.reason !== "edit" \|\| !dirty\)/);
});

test("editor republishes its exact source on blur before a reload can restore it", () => {
  const source = read("src", "components", "dashboard", "TreatmentCssEditor.astro");
  assert.match(source, /textarea\.addEventListener\("blur", \(\) => \{ closeListbox\(\); publishEdit\(\); \}\);/);
});

test("Element browser bootstrap uses inert serialized definitions and a bundled module", () => {
  const source = read("src", "components", "dashboard", "DashboardShell.astro");
  const browser = read("src", "framework", "controller", "browser.ts");
  assert.match(source, /type="application\/json"[^>]+data-element-guidance/);
  assert.match(source, /id="framework-element-guidance"/);
  assert.match(source, /import "\.\.\/\.\.\/framework\/controller\/browser\.ts"/);
  assert.doesNotMatch(source, /<script define:vars/);
  assert.doesNotMatch(source, /localStorage/);
  assert.match(browser, /document\.createElement\("style"\)/);
  assert.match(browser, /style\.dataset\.frameworkTreatmentPreview/);
  assert.match(source, /"spacing\.3xs"/);
  assert.match(source, /"spacing\.s"/);
  assert.match(browser, /"spacing\.3xs": "0\.5rem"/);
  assert.match(browser, /"spacing\.s": "0\.75rem"/);
  assert.match(browser, /controller\.updatePrimitives\(snapshot, completeSnapshot\(baselineSnapshot\)/);
  assert.match(browser, /frameworkDraftTreatmentPreview/);
  assert.match(browser, /controller\.draftSpecimen/);
  assert.match(browser, /type === "color" \? resolvedColorSwatch/);
  assert.match(browser, /resolvedColorSwatch/);
  assert.match(browser, /swatch: type === "color" \? resolvedColorSwatch\(id, compilation\.resolved\.primitives\) : value/);
  assert.match(browser, /framework-elements:edit-rule/);
  assert.match(browser, /controller\.editRuleDeclarations/);
  assert.match(browser, /framework-elements:complete/);
  assert.match(browser, /completeRuleDeclaration/);
  assert.match(browser, /framework-elements:completions/);
  assert.match(browser, /sources:/);
  assert.match(browser, /controller\.ruleDeclarationSource/);
  assert.doesNotMatch(browser, /framework-elements:select/);
  assert.doesNotMatch(browser, /\.style\b|setAttribute\("style"/);
  assert.doesNotMatch(browser, /Object\.assign\([^\n]+dataset/);
});

test("Element Reference exposes only explicit Draft Treatment specimens", () => {
  const source = read("src", "components", "dashboard", "ElementReference.astro");
  assert.match(source, /data-framework-draft-specimen=\{referenceState\(entry\) === "Draft" && treatmentModules\[entry\.id\] \? entry\.id : undefined\}/);
  assert.doesNotMatch(source, /entry\.data\.promoted|entry\.data\.treatmentDefinition/);
  assert.doesNotMatch(source, /ActionsStateNavigationPrototype|actionsPrototype/);
  assert.doesNotMatch(source, /ButtonCssAuthoring|buttonCssPrototype/);
  assert.equal(existsSync(join(root, "src", "components", "dashboard", "ButtonCssAuthoring.prototype.astro")), false);
});

test("Export implements selected Variant A as a read-only consumer of three compiler artifacts", () => {
  const source = read("src", "components", "dashboard", "FrameworkExportDialog.astro");
  const browser = read("src", "framework", "controller", "browser.ts");
  assert.match(source, /framework-elements:outputs/);
  assert.match(source, /framework-export:request/);
  assert.match(source, /data-export-file="tokens"/);
  assert.match(source, /data-export-file="elements"/);
  assert.match(source, /data-export-file="context"/);
  assert.match(source, /data-export-all/);
  assert.match(source, /data-export-card-diagnostic/);
  assert.match(source, /itemProblem\.message/);
  assert.match(source, /data-export-direct-copy/);
  assert.match(source, /const copy = async/);
  assert.match(source, /Clipboard access is unavailable/);
  assert.match(source, /Could not copy/);
  assert.match(source, /const copyArtifact = async \(id: ArtifactId\)/);
  assert.match(source, /const saveArtifact = \(id: ArtifactId\)/);
  assert.doesNotMatch(source, /continueWithContrastDecision\(async \(\) => reportCopy\(item\.value/);
  assert.doesNotMatch(source, /await navigator\.clipboard\?\.writeText/);
  assert.match(source, /aria-pressed="true"/);
  assert.doesNotMatch(source, /aria-selected=/);
  assert.match(browser, /packageArtifacts\(compilation\.artifacts\)/);
  assert.match(browser, /framework-export:package-ready/);
  assert.match(browser, /framework-export:package-failed/);
  assert.match(browser, /framework-accessibility:failed/);
  assert.match(source, /framework-export:package-failed/);
  assert.match(source, /framework-accessibility:failed/);
  assert.match(source, /Download started/);
  assert.match(source, /Could not start download/);
  assert.doesNotMatch(source, /DTCG|>text\/css<|>text\/markdown<|Ready with|Load order|Use CSS in order/);
  assert.doesNotMatch(source, /buildCss|buildDtcg|framework-preview:update/);
  assert.doesNotMatch(source, /currentCss|currentDtcg/);
});

test("dashboard reset rules exclude Framework Preview descendants", () => {
  const source = read("src", "styles", "global.css");
  assert.match(source, /\*:not\(\[data-framework-preview\], \[data-framework-preview\] \*\)/);
  assert.match(source, /:where\(button, input\):not\(\[data-framework-preview\] \*\)/);
  assert.match(source, /button:not\(\[data-framework-preview\] \*\)/);
  assert.match(source, /\[data-framework-preview\] \{[\s\S]*color: initial;[\s\S]*font: initial;/);
});
