import {
  compilePattern,
  defaultPatternState,
  parseStoredPatternState,
  patternStorageKey,
  selectedPatternOption,
  serializePatternState,
  setPatternExportName,
  setPatternHtml,
  setPatternStateControl,
  setPatternStylesheet,
} from "../engine.ts";
import { packagePatternArtifacts } from "../package-artifacts.ts";
import { cssRuleRange, htmlElementRange, type SourceRange } from "../inspector-source.ts";
import { getPatternDefinition } from "../registry.ts";

const root = document.querySelector<HTMLElement>("[data-pattern-tool]");
const definition = getPatternDefinition(root?.dataset.patternId ?? "");
const editor = root?.querySelector<HTMLTextAreaElement>("[data-pattern-css-source]");
const htmlSource = root?.querySelector<HTMLTextAreaElement>("[data-pattern-html-source]");
const liveCss = root?.querySelector<HTMLStyleElement>("[data-pattern-live-css]");
const specimen = root?.querySelector<HTMLElement>("[data-pattern-specimen]");
const problem = root?.querySelector<HTMLElement>("[data-pattern-css-problem]");
const htmlProblem = root?.querySelector<HTMLElement>("[data-pattern-html-problem]");
const status = root?.querySelector<HTMLElement>("[data-pattern-code-status]");
const reset = root?.querySelector<HTMLButtonElement>("[data-pattern-reset]");
const copyCss = root?.querySelector<HTMLButtonElement>("[data-pattern-copy-css]");
const copyHtml = root?.querySelector<HTMLButtonElement>("[data-pattern-copy-html]");
const exportName = root?.querySelector<HTMLInputElement>("[data-pattern-export-name]");
const advancedDrawer = root?.querySelector<HTMLElement>("[data-pattern-advanced-drawer]");
const advancedOpen = root?.querySelector<HTMLButtonElement>("[data-pattern-advanced-open]");
const selectionLabel = root?.querySelector<HTMLElement>("[data-pattern-selection]");
const selectNext = root?.querySelector<HTMLButtonElement>("[data-pattern-select-next]");
const exportDialog = root?.querySelector<HTMLDialogElement>("[data-pattern-export-dialog]");
const exportStatus = root?.querySelector<HTMLElement>("[data-pattern-export-status]");
const exportCode = root?.querySelector<HTMLElement>("[data-pattern-export-code]");
const exportPreviewName = root?.querySelector<HTMLElement>("[data-pattern-export-preview-name]");

let state = definition ? defaultPatternState(definition) : { source: "", supportSource: "", htmlSource: "", attributes: {}, exportName: "pattern" };
let activeArtifact: "css" | "html" = "css";
let selectedPath: number[] | null = null;

const elementPath = (target: Element) => {
  if (!specimen?.contains(target)) return null;
  const path: number[] = [];
  let current: Element | null = target;
  while (current && current !== specimen) {
    const parent: Element | null = current.parentElement;
    if (!parent) return null;
    path.unshift(Array.from(parent.children).indexOf(current));
    current = parent;
  }
  return path;
};

const elementAtPath = (path: readonly number[]) => {
  let current: Element | undefined = specimen ?? undefined;
  for (const index of path) current = current?.children[index];
  return current;
};

const elementLabel = (target: Element) => {
  const identity = target.id ? `#${target.id}` : Array.from(target.classList).slice(0, 2).map((name) => `.${name}`).join("");
  return `${target.tagName.toLowerCase()}${identity}`;
};

const selectRange = (field: HTMLTextAreaElement, range: SourceRange | null, focus = false) => {
  if (!range) return;
  field.setSelectionRange(range.start, range.end);
  const lines = field.value.slice(0, range.start).split("\n").length - 1;
  const lineHeight = Number.parseFloat(getComputedStyle(field).lineHeight) || 17;
  field.scrollTop = Math.max(0, lines * lineHeight - field.clientHeight / 3);
  if (focus) field.focus({ preventScroll:true });
};

const matchingCssSelectors = (target: Element) => {
  const matches: string[] = [];
  const visit = (rules: CSSRuleList) => Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSStyleRule) {
      try { if (target.matches(rule.selectorText)) matches.push(rule.selectorText); } catch { /* Ignore unsupported authored selectors. */ }
    } else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
  });
  if (liveCss?.sheet) visit(liveCss.sheet.cssRules);
  return matches.sort((left, right) => Number(left.includes(":")) - Number(right.includes(":")));
};

const markSelectedElement = (target: Element, focusSource = false) => {
  specimen?.querySelectorAll("[data-pattern-inspector-selected]").forEach((element) => element.removeAttribute("data-pattern-inspector-selected"));
  target.setAttribute("data-pattern-inspector-selected", "");
  selectedPath = elementPath(target);
  if (selectionLabel) selectionLabel.textContent = elementLabel(target);
  const elementIndex = Array.from(specimen?.querySelectorAll("*") ?? []).indexOf(target);
  selectRange(editor!, cssRuleRange(editor!.value, matchingCssSelectors(target)));
  selectRange(htmlSource!, htmlElementRange(htmlSource!.value, elementIndex), focusSource);
  if (status) status.textContent = `${elementLabel(target)} selected. Its complete HTML and nearest matching CSS rule are selected.`;
};

const focusElementSource = (target: Element) => markSelectedElement(target, true);

const syncControls = () => {
  if (!definition) return;
  const labels = definition.controls.map((control) => {
    const selected = selectedPatternOption(definition, state, control.id);
    root?.querySelectorAll<HTMLButtonElement>(`[data-settings-segmented="pattern-control-${control.id}"] [data-settings-segmented-value]`)
      .forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.settingsSegmentedValue === selected)));
    return control.options.find(({ id }) => id === selected)?.label ?? "Custom";
  });

  const appearanceSummary = root?.querySelector<HTMLElement>('[data-pattern-summary="appearance"]');
  if (appearanceSummary) appearanceSummary.textContent = labels.join(" · ");
  const exportSummary = root?.querySelector<HTMLElement>('[data-pattern-summary="export"]');
  if (exportSummary) exportSummary.textContent = `.${state.exportName}`;
};

const showProblem = (target: HTMLElement | undefined, field: HTMLTextAreaElement | undefined, message: string | null) => {
  if (!target || !field) return;
  target.hidden = message === null;
  target.textContent = message ?? "";
  field.setAttribute("aria-invalid", String(message !== null));
};

const applyState = (nextState: Parameters<typeof compilePattern>[1], options: { persist?: boolean; syncEditors?: boolean; clearProblems?: boolean } = {}) => {
  if (!definition) return;
  const compilation = compilePattern(definition, nextState);
  state = compilation.state;
  if (liveCss) liveCss.textContent = compilation.css;
  if (options.syncEditors !== false && editor) editor.value = compilation.css;
  if (specimen) specimen.innerHTML = compilation.html;
  if (options.syncEditors !== false && htmlSource) htmlSource.value = compilation.html;
  if (exportName) exportName.value = state.exportName;
  if (options.clearProblems !== false) {
    showProblem(problem ?? undefined, editor ?? undefined, null);
    showProblem(htmlProblem ?? undefined, htmlSource ?? undefined, null);
  }
  if (selectedPath && advancedDrawer && !advancedDrawer.hidden) {
    const selected = elementAtPath(selectedPath);
    if (selected) markSelectedElement(selected);
  }
  syncControls();
  if (status) status.textContent = "Preview, settings, HTML, and CSS are synchronized.";
  if (options.persist !== false) {
    try {
      localStorage.setItem(patternStorageKey(definition), serializePatternState(definition, state));
    } catch {
      // Authoring remains available when storage is blocked.
    }
  }
};

const applyCss = (value: string, syncEditors = false) => {
  if (!definition) return false;
  const result = setPatternStylesheet(definition, state, value);
  if (!result.success) { showProblem(problem ?? undefined, editor ?? undefined, result.message); if (status) status.textContent = "Preview is keeping the last valid CSS."; return false; }
  applyState(result.state, { syncEditors, clearProblems:false });
  showProblem(problem ?? undefined, editor ?? undefined, null);
  return true;
};

const applyHtml = (value: string, syncEditors = false) => {
  if (!definition) return false;
  const result = setPatternHtml(definition, state, value);
  if (!result.success) { showProblem(htmlProblem ?? undefined, htmlSource ?? undefined, result.message); if (status) status.textContent = "Preview is keeping the last valid HTML."; return false; }
  applyState(result.state, { syncEditors, clearProblems:false });
  showProblem(htmlProblem ?? undefined, htmlSource ?? undefined, null);
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

if (root && definition && editor && htmlSource && liveCss) {
  let stored = defaultPatternState(definition);
  try {
    stored = parseStoredPatternState(definition, localStorage.getItem(patternStorageKey(definition)));
  } catch {
    // Keep the package default when storage is unavailable.
  }
  applyState(stored, { persist: false });

  editor.addEventListener("input", () => applyCss(editor.value));
  editor.addEventListener("blur", () => applyCss(editor.value, true));
  htmlSource.addEventListener("input", () => applyHtml(htmlSource.value));
  htmlSource.addEventListener("blur", () => applyHtml(htmlSource.value, true));

  root.addEventListener("settings-segmented:change", (event) => {
    const detail = (event as CustomEvent<{ name?: string; value?: string }>).detail;
    const controlId = detail.name?.replace("pattern-control-", "");
    if (!controlId || !detail.value || !definition.controls.some(({ id }) => id === controlId)) return;
    applyState(setPatternStateControl(definition, state, controlId, detail.value));
  });

  exportName?.addEventListener("change", () => {
    applyState(setPatternExportName(definition, state, exportName.value));
  });

  reset?.addEventListener("click", () => {
    try {
      localStorage.removeItem(patternStorageKey(definition));
    } catch {
      // Reset still applies in memory when storage is unavailable.
    }
    applyState(defaultPatternState(definition), { persist: false });
  });

  copyCss?.addEventListener("click", () => copyText(compilePattern(definition, state).css, `${definition.title} CSS copied.`));
  copyHtml?.addEventListener("click", () => copyText(compilePattern(definition, state).html, `${definition.title} HTML copied.`));

  const closeAdvanced = () => {
    if (!advancedDrawer) return;
    advancedDrawer.hidden = true;
    advancedOpen?.setAttribute("aria-expanded", "false");
    selectedPath = null;
    if (selectionLabel) selectionLabel.textContent = "No element selected";
    root.removeAttribute("data-pattern-inspector-active");
    specimen?.querySelectorAll("[data-pattern-inspector-hover],[data-pattern-inspector-selected]").forEach((element) => {
      element.removeAttribute("data-pattern-inspector-hover");
      element.removeAttribute("data-pattern-inspector-selected");
    });
    advancedOpen?.focus({ preventScroll:true });
  };
  advancedOpen?.addEventListener("click", () => {
    applyState(state, { persist:false });
    if (advancedDrawer) advancedDrawer.hidden = false;
    advancedOpen?.setAttribute("aria-expanded", "true");
    root.setAttribute("data-pattern-inspector-active", "");
    if (window.matchMedia("(max-width:720px)").matches) advancedDrawer?.closest(".dashboard-shell__main")?.scrollIntoView({ block:"start" });
  });
  root.querySelector<HTMLButtonElement>("[data-pattern-advanced-close]")?.addEventListener("click", closeAdvanced);
  root.addEventListener("keydown", (event) => { if (event.key === "Escape" && advancedDrawer && !advancedDrawer.hidden) closeAdvanced(); });
  specimen?.addEventListener("pointerover", (event) => {
    if (!advancedDrawer || advancedDrawer.hidden || !(event.target instanceof Element) || event.target === specimen) return;
    specimen.querySelectorAll("[data-pattern-inspector-hover]").forEach((element) => element.removeAttribute("data-pattern-inspector-hover"));
    event.target.setAttribute("data-pattern-inspector-hover", "");
  });
  specimen?.addEventListener("pointerleave", () => specimen.querySelectorAll("[data-pattern-inspector-hover]").forEach((element) => element.removeAttribute("data-pattern-inspector-hover")));
  let pressedElement: Element | null = null;
  specimen?.addEventListener("pointerdown", (event) => {
    if (!advancedDrawer || advancedDrawer.hidden || !(event.target instanceof Element) || event.target === specimen) return;
    pressedElement = event.target;
    specimen.setPointerCapture(event.pointerId);
  });
  specimen?.addEventListener("pointerup", (event) => {
    const target = pressedElement;
    pressedElement = null;
    if (specimen.hasPointerCapture(event.pointerId)) specimen.releasePointerCapture(event.pointerId);
    if (!target || !advancedDrawer || advancedDrawer.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    focusElementSource(target);
  });
  specimen?.addEventListener("pointercancel", (event) => {
    pressedElement = null;
    if (specimen.hasPointerCapture(event.pointerId)) specimen.releasePointerCapture(event.pointerId);
  });
  specimen?.addEventListener("click", (event) => {
    if (!advancedDrawer || advancedDrawer.hidden) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  selectNext?.addEventListener("click", () => {
    const elements = Array.from(specimen?.querySelectorAll("*") ?? []);
    if (!elements.length) return;
    const selected = specimen?.querySelector("[data-pattern-inspector-selected]");
    markSelectedElement(elements[(elements.indexOf(selected as Element) + 1) % elements.length]);
  });

  const artifact = (name: "css" | "html") => compilePattern(definition, state)[name];
  const artifactName = (name: "css" | "html") => `${state.exportName}.${name}`;
  const renderExport = () => {
    if (exportCode) exportCode.textContent = artifact(activeArtifact);
    if (exportPreviewName) exportPreviewName.textContent = artifactName(activeArtifact);
    root.querySelectorAll<HTMLButtonElement>("[data-pattern-export-file]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.patternExportFile === activeArtifact)));
    root.querySelectorAll<HTMLElement>("[data-pattern-export-card]").forEach((card) => { const kind = card.dataset.patternExportCard as "css" | "html"; const name = card.querySelector("strong"); if (name) name.textContent = artifactName(kind); });
  };
  const setExportStatus = (message:string) => { if (exportStatus) exportStatus.textContent = message; };
  const download = (name:string, type:string, value:BlobPart) => { const url = URL.createObjectURL(new Blob([value], {type})); const link = document.createElement("a"); link.href=url; link.download=name; link.hidden=true; document.body.append(link); link.click(); window.setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 0); setExportStatus(`Download started for ${name}`); };
  root.querySelector<HTMLButtonElement>("[data-pattern-export-open]")?.addEventListener("click", () => { renderExport(); exportDialog?.showModal(); });
  root.querySelector<HTMLButtonElement>("[data-pattern-export-close]")?.addEventListener("click", () => exportDialog?.close());
  exportDialog?.addEventListener("click", (event) => { if (event.target === exportDialog) exportDialog.close(); });
  root.querySelectorAll<HTMLButtonElement>("[data-pattern-export-file]").forEach((button) => button.addEventListener("click", () => { activeArtifact = button.dataset.patternExportFile as "css" | "html"; renderExport(); }));
  root.querySelectorAll<HTMLButtonElement>("[data-pattern-export-copy]").forEach((button) => button.addEventListener("click", () => { const kind = button.dataset.patternExportCopy as "css" | "html"; void copyText(artifact(kind), `Copied ${artifactName(kind)}`); }));
  root.querySelector<HTMLButtonElement>("[data-pattern-export-direct-copy]")?.addEventListener("click", () => void copyText(artifact(activeArtifact), `Copied ${artifactName(activeArtifact)}`));
  root.querySelectorAll<HTMLButtonElement>("[data-pattern-export-save]").forEach((button) => button.addEventListener("click", () => { const kind = button.dataset.patternExportSave as "css" | "html"; download(artifactName(kind), kind === "css" ? "text/css" : "text/html", artifact(kind)); }));
  root.querySelector<HTMLButtonElement>("[data-pattern-export-all]")?.addEventListener("click", () => { const packaged = packagePatternArtifacts(compilePattern(definition,state)); download(packaged.name, packaged.mimeType, packaged.value.slice().buffer as ArrayBuffer); });

  window.addEventListener("storage", (event) => {
    if (event.key === patternStorageKey(definition)) {
      applyState(parseStoredPatternState(definition, event.newValue), { persist: false });
    }
  });
}
