import { createPatternSession, type PatternArtifactKind } from "../session.ts";
import { connectExportDialog, exportDialogAttributes } from "../../settings/export-dialog.ts";
import { resolveNestedSelector, type SourceRange, type ScopedSelectorMatch } from "../inspector-source.ts";
import { getPatternDefinition } from "../registry.ts";

import starterTokenCss from "../../styles/tokens.css?raw";
import { currentFrameworkSiteTheme } from "../../framework/site-theme/browser.ts";

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
const exportDialogElement = root?.querySelector<HTMLDialogElement>("[data-pattern-export-dialog]");
const exportStatus = root?.querySelector<HTMLElement>("[data-pattern-export-status]");

const browserStorage = () => { try { return window.localStorage; } catch { return undefined; } };
const session = definition ? createPatternSession(definition, browserStorage()) : undefined;
let selectedPath: number[] | null = null;
let htmlProjection: SourceRange | null = null;

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

/** Show one projected fragment; without a matching source range the editor is read-only. */
const projectSource = (field: HTMLTextAreaElement, projected: string, editable: boolean, focus = false) => {
  if (field.value !== projected) field.value = projected;
  field.readOnly = !editable;
  field.placeholder = editable ? "" : "No matching source for this element.";
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
  const matches: ScopedSelectorMatch[] = [];
  const visit = (rules: CSSRuleList, parentSelector?: string, scope?: string) => Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSStyleRule) {
      const resolvedSelector = resolveNestedSelector(rule.selectorText, parentSelector);
      const selector = scope ? resolvedSelector.replaceAll(":scope", `:is(${scope})`) : resolvedSelector;
      try { if (target.matches(selector)) matches.push({ selector: rule.selectorText, scope }); } catch { /* Ignore unsupported authored selectors. */ }
      if ("cssRules" in rule) visit(rule.cssRules, resolvedSelector, scope);
    } else if ("cssRules" in rule) {
      if ("start" in rule && "end" in rule) {
        const scopedRule = rule as CSSGroupingRule & { start: string; end: string | null };
        const owner = target.closest(scopedRule.start);
        if (!owner) return;
        for (let element: Element | null = target; element && element !== owner; element = element.parentElement) {
          if (scopedRule.end && element.matches(scopedRule.end)) return;
        }
        visit(scopedRule.cssRules, undefined, scopedRule.start);
      } else visit((rule as CSSGroupingRule).cssRules, parentSelector, scope);
    }
  });
  if (liveCss?.sheet) visit(liveCss.sheet.cssRules);
  return matches.sort((left, right) => Number(left.selector.includes(":")) - Number(right.selector.includes(":")));
};

const markSelectedElement = (target: Element, focusSource = false, revealCss = true, syncEditors = true) => {
  specimen?.querySelectorAll("[data-pattern-inspector-selected]").forEach((element) => element.removeAttribute("data-pattern-inspector-selected"));
  target.setAttribute("data-pattern-inspector-selected", "");
  selectedPath = elementPath(target);
  renderSelectionPath(target);
  if (selectionLabel) selectionLabel.textContent = elementLabel(target);
  const { compilation } = session!;
  // Preorder DOM index; the session maps it onto the compiled HTML source.
  const elementIndex = Array.from(specimen?.querySelectorAll("*") ?? []).indexOf(target);
  const source = session!.elementSource(elementIndex, matchingCssSelectors(target));
  htmlProjection = source.html;
  editor?.dispatchEvent(new CustomEvent("code-editor:color-context", { detail:{ context:target } }));
  if (syncEditors) {
    projectSource(htmlSource!, source.htmlFragment, Boolean(htmlProjection), focusSource);
    projectSource(editor!, compilation.css, true);
    if (revealCss) revealSourceOffset(editor!, source.cssOffset);
  }
  if (status) status.textContent = `${elementLabel(target)} · showing this element's HTML and complete component CSS with the selected rule first.`;
};

const focusElementSource = (target: Element) => markSelectedElement(target, true);

const syncControls = () => {
  if (!definition) return;
  const labels = definition.controls.map((control) => {
    const selected = session!.selectedOption(control.id);
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

/** Render the session's current compilation into Preview, editors, and controls. */
const render = (options: { syncEditors?: boolean; clearProblems?: boolean } = {}) => {
  if (!session) return;
  const { compilation } = session;
  const syncEditors = options.syncEditors !== false && (!selectedPath || advancedDrawer?.hidden);
  if (liveCss) liveCss.textContent = session.previewCss;
  if (syncEditors && editor) { editor.value = compilation.css; refreshCodeEditor(editor); }
  if (specimen) specimen.innerHTML = compilation.html;
  if (syncEditors && htmlSource) { htmlSource.value = compilation.html; refreshCodeEditor(htmlSource); }
  if (exportName) exportName.value = compilation.state.exportName;
  if (options.clearProblems !== false) {
    showProblem(problem ?? undefined, editor ?? undefined, null);
    showProblem(htmlProblem ?? undefined, htmlSource ?? undefined, null);
  }
  let restoredSelection = false;
  if (selectedPath && advancedDrawer && !advancedDrawer.hidden) {
    const selected = elementAtPath(selectedPath);
    if (selected) { markSelectedElement(selected, false, false, options.syncEditors !== false); restoredSelection = true; }
  }
  syncControls();
  if (status && !restoredSelection) status.textContent = "Preview, settings, HTML, and CSS are synchronized.";
};

const applyEdit = (result: ReturnType<NonNullable<typeof session>["editCss"]>, kind: "CSS" | "HTML") => {
  const [target, field] = kind === "CSS" ? [problem, editor] : [htmlProblem, htmlSource];
  if (!result.success) {
    showProblem(target ?? undefined, field ?? undefined, result.message);
    if (status) status.textContent = `Preview is keeping the last valid ${kind}.`;
    return false;
  }
  render({ syncEditors:false, clearProblems:false });
  showProblem(target ?? undefined, field ?? undefined, null);
  return true;
};

const keepSelection = (field: HTMLTextAreaElement, apply: () => boolean) => {
  const selection: [number, number] = [field.selectionStart, field.selectionEnd];
  if (apply()) field.setSelectionRange(Math.min(selection[0], field.value.length), Math.min(selection[1], field.value.length));
};

// The CSS editor always shows the complete stylesheet, so edits replace it whole.
const applyCssEdit = () => { if (session && editor) keepSelection(editor, () => applyEdit(session.editCss(editor.value), "CSS")); };

const applyHtmlEdit = () => {
  if (!session || !htmlSource || !htmlProjection) return;
  const range = htmlProjection;
  keepSelection(htmlSource, () => applyEdit(session.editHtmlFragment(range, htmlSource.value), "HTML"));
};

if (root && definition && session && editor && htmlSource && liveCss) {
  render();

  editor.addEventListener("input", applyCssEdit);
  htmlSource.addEventListener("input", applyHtmlEdit);

  root.addEventListener("settings-segmented:change", (event) => {
    const detail = (event as CustomEvent<{ name?: string; value?: string }>).detail;
    const controlId = detail.name?.replace("pattern-control-", "");
    if (!controlId || !detail.value || !definition.controls.some(({ id }) => id === controlId)) return;
    session.setControl(controlId, detail.value);
    render();
  });

  reset?.addEventListener("click", () => {
    session.reset();
    render();
  });

  const closeAdvanced = () => {
    if (!advancedDrawer) return;
    advancedDrawer.hidden = true;
    advancedOpen?.setAttribute("aria-expanded", "false");
    selectedPath = null;
    htmlProjection = null;
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
    render();
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

  const exportTheme = () => ({ tokenCss: starterTokenCss, theme: currentFrameworkSiteTheme() });
  const mimeTypes: Record<PatternArtifactKind, string> = { css: "text/css", html: "text/html" };
  const exportDialog = connectExportDialog<PatternArtifactKind>({
    root,
    attributes: exportDialogAttributes("data-pattern-export"),
    initial: "css",
    artifact: (kind) => ({ name: session.artifactName(kind), mimeType: mimeTypes[kind], value: session.artifacts(exportTheme())[kind] }),
    packageAll: () => session.packageArtifacts(exportTheme()),
    packageName: () => `${session.compilation.state.exportName}.zip`,
    report: (message) => {
      if (exportStatus) exportStatus.textContent = message;
      if (status && !exportDialogElement?.open) status.textContent = message;
    },
    afterRender: () => root.querySelectorAll<HTMLElement>("[data-pattern-export-card]").forEach((card) => {
      const name = card.querySelector("strong");
      if (name) name.textContent = session.artifactName(card.dataset.patternExportCard as PatternArtifactKind);
    }),
  });
  const refreshOpenExport = () => exportDialog.refresh();
  window.addEventListener("framework-site-theme:update", refreshOpenExport);
  window.addEventListener("framework-site-theme:reset", refreshOpenExport);
  exportName?.addEventListener("change", () => {
    session.setExportName(exportName.value);
    render();
    refreshOpenExport();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === session.storageKey) {
      session.adoptStored(event.newValue);
      render();
    }
    refreshOpenExport();
  });
}
