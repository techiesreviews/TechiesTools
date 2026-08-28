import { parseCssDeclarationList } from "../../framework/css-declarations/index.ts";
import {
  compilePattern,
  defaultPatternState,
  parseStoredPatternState,
  patternStorageKey,
  selectedPatternOption,
  serializePatternState,
  setPatternControl,
} from "../engine.ts";
import { getPatternDefinition } from "../registry.ts";

const root = document.querySelector<HTMLElement>("[data-pattern-tool]");
const definition = getPatternDefinition(root?.dataset.patternId ?? "");
const editor = root?.querySelector<HTMLTextAreaElement>("[data-pattern-css-source]");
const htmlSource = root?.querySelector<HTMLTextAreaElement>("[data-pattern-html-source]");
const liveCss = root?.querySelector<HTMLStyleElement>("[data-pattern-live-css]");
const problem = root?.querySelector<HTMLElement>("[data-pattern-css-problem]");
const status = root?.querySelector<HTMLElement>("[data-pattern-code-status]");
const reset = root?.querySelector<HTMLButtonElement>("[data-pattern-reset]");
const copyCss = root?.querySelector<HTMLButtonElement>("[data-pattern-copy-css]");
const copyHtml = root?.querySelector<HTMLButtonElement>("[data-pattern-copy-html]");

let source = definition?.defaultCss ?? "";

const syncControls = () => {
  if (!definition) return;
  const labels = definition.controls.map((control) => {
    const selected = selectedPatternOption(definition, source, control.id);
    root?.querySelectorAll<HTMLButtonElement>(`[data-settings-segmented="pattern-control-${control.id}"] [data-settings-segmented-value]`)
      .forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.settingsSegmentedValue === selected)));
    return control.options.find(({ id }) => id === selected)?.label ?? "Custom";
  });

  const appearanceSummary = root?.querySelector<HTMLElement>('[data-pattern-summary="appearance"]');
  if (appearanceSummary) appearanceSummary.textContent = labels.join(" · ");
  const parsed = parseCssDeclarationList(source);
  const cssSummary = root?.querySelector<HTMLElement>('[data-pattern-summary="css"]');
  if (cssSummary && parsed.success) cssSummary.textContent = `${parsed.declarations.length} declarations`;
};

const showProblem = (message: string | null) => {
  if (!problem || !editor) return;
  problem.hidden = message === null;
  problem.textContent = message ?? "";
  editor.setAttribute("aria-invalid", String(message !== null));
};

const applySource = (nextSource: string, options: { syncEditor?: boolean; persist?: boolean } = {}) => {
  if (!definition) return false;
  const parsed = parseCssDeclarationList(nextSource);
  if (!parsed.success) {
    showProblem(parsed.issues[0]?.message ?? "Invalid CSS declaration list.");
    if (status) status.textContent = "Preview is keeping the last valid CSS.";
    return false;
  }

  const compilation = compilePattern(definition, { source: parsed.source });
  source = compilation.source;
  if (liveCss) liveCss.textContent = compilation.css;
  if (options.syncEditor !== false && editor) editor.value = source;
  showProblem(null);
  syncControls();
  if (status) status.textContent = "Preview, settings, and CSS are synchronized.";
  if (options.persist !== false) {
    try {
      localStorage.setItem(patternStorageKey(definition), serializePatternState(definition, { source }));
    } catch {
      // Authoring remains available when storage is blocked.
    }
  }
  return true;
};

const copyText = async (value: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(value);
    if (status) status.textContent = successMessage;
  } catch {
    if (status) status.textContent = "Copy was blocked by the browser.";
  }
};

if (root && definition && editor && liveCss) {
  let stored = defaultPatternState(definition);
  try {
    stored = parseStoredPatternState(definition, localStorage.getItem(patternStorageKey(definition)));
  } catch {
    // Keep the package default when storage is unavailable.
  }
  applySource(stored.source, { persist: false });

  editor.addEventListener("input", () => applySource(editor.value, { syncEditor: false }));
  editor.addEventListener("blur", () => {
    if (applySource(editor.value)) editor.value = source;
  });

  root.addEventListener("settings-segmented:change", (event) => {
    const detail = (event as CustomEvent<{ name?: string; value?: string }>).detail;
    const controlId = detail.name?.replace("pattern-control-", "");
    if (!controlId || !detail.value || !definition.controls.some(({ id }) => id === controlId)) return;
    applySource(setPatternControl(definition, source, controlId, detail.value));
  });

  reset?.addEventListener("click", () => {
    try {
      localStorage.removeItem(patternStorageKey(definition));
    } catch {
      // Reset still applies in memory when storage is unavailable.
    }
    applySource(definition.defaultCss, { persist: false });
  });

  copyCss?.addEventListener("click", () => copyText(compilePattern(definition, { source }).css, `${definition.title} CSS copied.`));
  copyHtml?.addEventListener("click", () => copyText(htmlSource?.value ?? definition.html, `${definition.title} HTML copied.`));

  window.addEventListener("storage", (event) => {
    if (event.key === patternStorageKey(definition)) {
      applySource(parseStoredPatternState(definition, event.newValue).source, { persist: false });
    }
  });
}
