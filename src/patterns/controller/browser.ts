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
  scopePatternPreviewCss,
} from "../engine.ts";
import { packagePatternArtifacts } from "../package-artifacts.ts";
import { cssRuleRange, htmlElementRange, replaceSourceRange, resolveNestedSelector, sourceRangeFragment, type SourceRange } from "../inspector-source.ts";
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
const exportName = root?.querySelector<HTMLInputElement>("[data-pattern-export-name]");
const advancedDrawer = root?.querySelector<HTMLElement>("[data-pattern-advanced-drawer]");
const advancedOpen = root?.querySelector<HTMLButtonElement>("[data-pattern-advanced-open]");
const selectionLabel = root?.querySelector<HTMLElement>("[data-pattern-selection]");
const selectionPath = root?.querySelector<HTMLOListElement>("[data-pattern-selection-path]");
const breadcrumbSeparator = root?.querySelector<HTMLTemplateElement>("[data-pattern-breadcrumb-separator]");
const exportDialog = root?.querySelector<HTMLDialogElement>("[data-pattern-export-dialog]");
const exportStatus = root?.querySelector<HTMLElement>("[data-pattern-export-status]");
const exportCode = root?.querySelector<HTMLElement>("[data-pattern-export-code]");
const exportPreviewName = root?.querySelector<HTMLElement>("[data-pattern-export-preview-name]");

let state = definition ? defaultPatternState(definition) : { source: "", supportSource: "", htmlSource: "", attributes: {}, exportName: "pattern" };
let activeArtifact: "css" | "html" = "css";
let selectedPath: number[] | null = null;
let htmlProjection: SourceRange | null = null;
let cssProjection: SourceRange | null = null;

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

const renderSelectionPath = (target: Element) => {
  if (!selectionPath) return;
  const path = elementPath(target);
  if (!path) { selectionPath.replaceChildren(); return; }
  const crumbs = path.map((_, index) => {
    const crumbPath = path.slice(0, index + 1);
    const element = elementAtPath(crumbPath);
    if (!element) return null;
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = elementLabel(element);
    button.dataset.patternSelectPath = crumbPath.join(".");
    if (index === path.length - 1) button.setAttribute("aria-current", "page");
    if (index > 0 && breadcrumbSeparator) item.append(breadcrumbSeparator.content.cloneNode(true));
    item.append(button);
    return item;
  }).filter((item): item is HTMLLIElement => item !== null);
  selectionPath.replaceChildren(...crumbs);
  selectionPath.lastElementChild?.scrollIntoView({ inline:"nearest", block:"nearest" });
};

const refreshCodeEditor = (field: HTMLTextAreaElement) => field.dispatchEvent(new Event("code-editor:refresh"));

const projectSource = (field: HTMLTextAreaElement, source: string, range: SourceRange | null, focus = false) => {
  const projected = sourceRangeFragment(source, range);
  if (field.value !== projected) field.value = projected;
  field.readOnly = !range;
  field.placeholder = range ? "" : "No matching source for this element.";
  refreshCodeEditor(field);
  if (focus) {
    field.focus({ preventScroll:true });
    field.setSelectionRange(0, 0);
  }
};

const revealSourceOffset = (field: HTMLTextAreaElement, offset: number) => {
  field.dispatchEvent(new CustomEvent("code-editor:reveal-source", { detail:{ offset } }));
};

const matchingCssSelectors = (target: Element) => {
  const matches: string[] = [];
  const visit = (rules: CSSRuleList, parentSelector?: string) => Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSStyleRule) {
      const resolvedSelector = resolveNestedSelector(rule.selectorText, parentSelector);
      try { if (target.matches(resolvedSelector)) matches.push(rule.selectorText); } catch { /* Ignore unsupported authored selectors. */ }
      if ("cssRules" in rule) visit(rule.cssRules, resolvedSelector);
    } else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules, parentSelector);
  });
  if (liveCss?.sheet) visit(liveCss.sheet.cssRules);
  return matches.sort((left, right) => Number(left.includes(":")) - Number(right.includes(":")));
};

const markSelectedElement = (target: Element, focusSource = false, revealCss = true) => {
  specimen?.querySelectorAll("[data-pattern-inspector-selected]").forEach((element) => element.removeAttribute("data-pattern-inspector-selected"));
  target.setAttribute("data-pattern-inspector-selected", "");
  selectedPath = elementPath(target);
  renderSelectionPath(target);
  if (selectionLabel) selectionLabel.textContent = elementLabel(target);
  const compilation = compilePattern(definition!, state);
  const elementIndex = Array.from(specimen?.querySelectorAll("*") ?? []).indexOf(target);
  htmlProjection = htmlElementRange(compilation.html, elementIndex);
  const selectedCssRange = cssRuleRange(compilation.css, matchingCssSelectors(target));
  cssProjection = { start:0, end:compilation.css.length };
  projectSource(htmlSource!, compilation.html, htmlProjection, focusSource);
  projectSource(editor!, compilation.css, cssProjection);
  if (revealCss) revealSourceOffset(editor!, selectedCssRange?.start ?? 0);
  if (status) status.textContent = `${elementLabel(target)} · showing this element's HTML and complete component CSS with the selected rule first.`;
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
  if (liveCss) liveCss.textContent = scopePatternPreviewCss(definition, compilation.css);
  if (options.syncEditors !== false && editor && (!selectedPath || advancedDrawer?.hidden)) { editor.value = compilation.css; refreshCodeEditor(editor); }
  if (specimen) specimen.innerHTML = compilation.html;
  if (options.syncEditors !== false && htmlSource && (!selectedPath || advancedDrawer?.hidden)) { htmlSource.value = compilation.html; refreshCodeEditor(htmlSource); }
  if (exportName) exportName.value = state.exportName;
  if (options.clearProblems !== false) {
    showProblem(problem ?? undefined, editor ?? undefined, null);
    showProblem(htmlProblem ?? undefined, htmlSource ?? undefined, null);
  }
  let restoredSelection = false;
  if (selectedPath && advancedDrawer && !advancedDrawer.hidden) {
    const selected = elementAtPath(selectedPath);
    if (selected) { markSelectedElement(selected, false, false); restoredSelection = true; }
  }
  syncControls();
  if (status && !restoredSelection) status.textContent = "Preview, settings, HTML, and CSS are synchronized.";
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

const applyCssProjection = () => {
  if (!definition || !editor || !cssProjection) return false;
  const selection: [number, number] = [editor.selectionStart, editor.selectionEnd];
  const fullSource = compilePattern(definition, state).css;
  const success = applyCss(replaceSourceRange(fullSource, cssProjection, editor.value));
  if (success) editor.setSelectionRange(Math.min(selection[0], editor.value.length), Math.min(selection[1], editor.value.length));
  return success;
};

const applyHtmlProjection = () => {
  if (!definition || !htmlSource || !htmlProjection) return false;
  const selection: [number, number] = [htmlSource.selectionStart, htmlSource.selectionEnd];
  const fullSource = compilePattern(definition, state).html;
  const success = applyHtml(replaceSourceRange(fullSource, htmlProjection, htmlSource.value));
  if (success) htmlSource.setSelectionRange(Math.min(selection[0], htmlSource.value.length), Math.min(selection[1], htmlSource.value.length));
  return success;
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

  editor.addEventListener("input", applyCssProjection);
  htmlSource.addEventListener("input", applyHtmlProjection);

  root.addEventListener("settings-segmented:change", (event) => {
    const detail = (event as CustomEvent<{ name?: string; value?: string }>).detail;
    const controlId = detail.name?.replace("pattern-control-", "");
    if (!controlId || !detail.value || !definition.controls.some(({ id }) => id === controlId)) return;
    applyState(setPatternStateControl(definition, state, controlId, detail.value));
  });

  reset?.addEventListener("click", () => {
    try {
      localStorage.removeItem(patternStorageKey(definition));
    } catch {
      // Reset still applies in memory when storage is unavailable.
    }
    applyState(defaultPatternState(definition), { persist: false });
  });

  const closeAdvanced = () => {
    if (!advancedDrawer) return;
    advancedDrawer.hidden = true;
    advancedOpen?.setAttribute("aria-expanded", "false");
    selectedPath = null;
    htmlProjection = null;
    cssProjection = null;
    if (selectionLabel) selectionLabel.textContent = "No element selected";
    selectionPath?.replaceChildren();
    root.removeAttribute("data-pattern-inspector-active");
    specimen?.querySelectorAll("[data-pattern-inspector-hover],[data-pattern-inspector-selected]").forEach((element) => {
      element.removeAttribute("data-pattern-inspector-hover");
      element.removeAttribute("data-pattern-inspector-selected");
    });
    advancedOpen?.focus({ preventScroll:true });
  };
  advancedOpen?.addEventListener("click", () => {
    if (advancedDrawer && !advancedDrawer.hidden) {
      closeAdvanced();
      return;
    }
    applyState(state, { persist:false });
    if (advancedDrawer) advancedDrawer.hidden = false;
    advancedOpen?.setAttribute("aria-expanded", "true");
    root.setAttribute("data-pattern-inspector-active", "");
    const firstElement = specimen?.querySelector("*");
    if (firstElement) markSelectedElement(firstElement);
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
  selectionPath?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-pattern-select-path]") : null;
    if (!button) return;
    const path = button.dataset.patternSelectPath?.split(".").map(Number).filter(Number.isInteger) ?? [];
    const target = elementAtPath(path);
    if (target) focusElementSource(target);
  });

  const artifact = (name: "css" | "html") => compilePattern(definition, state)[name];
  const artifactName = (name: "css" | "html") => `${state.exportName}.${name}`;
  const renderExport = () => {
    if (exportCode) exportCode.textContent = artifact(activeArtifact);
    if (exportPreviewName) exportPreviewName.textContent = artifactName(activeArtifact);
    root.querySelectorAll<HTMLButtonElement>("[data-pattern-export-file]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.patternExportFile === activeArtifact)));
    root.querySelectorAll<HTMLElement>("[data-pattern-export-card]").forEach((card) => { const kind = card.dataset.patternExportCard as "css" | "html"; const name = card.querySelector("strong"); if (name) name.textContent = artifactName(kind); });
  };
  exportName?.addEventListener("change", () => {
    applyState(setPatternExportName(definition, state, exportName.value));
    renderExport();
  });
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
