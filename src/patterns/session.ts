import {
  compilePattern,
  defaultPatternState,
  parseStoredPatternState,
  patternStorageKey,
  scopePatternPreviewCss,
  selectedPatternOption,
  serializePatternState,
  setPatternExportName,
  setPatternHtml,
  setPatternStateControl,
  setPatternStylesheet,
  type PatternCompilation,
  type PatternState,
} from "./engine.ts";
import { compilePatternArtifacts, packagePatternArtifacts, type PatternExportTheme } from "./package-artifacts.ts";
import { cssRuleRange, htmlElementRange, replaceSourceRange, sourceRangeFragment, type ScopedSelectorMatch, type SourceRange } from "./inspector-source.ts";
import type { PatternDefinition } from "./definition.ts";

/** Key-value persistence. Implementations may throw; the session keeps working in memory. */
export interface PatternStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type PatternSessionEdit = { success: true } | { success: false; message: string };

export type PatternArtifactKind = "css" | "html";

/** Source locations for one inspected Preview element. */
export interface PatternElementSource {
  /** The element's own HTML, or null when the source has no matching element. */
  html: SourceRange | null;
  /** The element's HTML with indentation rebased for a fragment editor; "" without a match. */
  htmlFragment: string;
  /** Offset of the first CSS rule matching the element, or 0. */
  cssOffset: number;
}

export interface PatternSession {
  readonly definition: PatternDefinition;
  /** Storage key; other documents' writes to it arrive through `adoptStored`. */
  readonly storageKey: string;
  /** The current compiled Pattern; recompiled once per accepted change. */
  readonly compilation: PatternCompilation;
  /** Author CSS wrapped for isolated Pattern Preview. */
  readonly previewCss: string;
  editCss(css: string): PatternSessionEdit;
  editHtml(html: string): PatternSessionEdit;
  /** Replace one projected HTML fragment inside the full compiled HTML. */
  editHtmlFragment(range: SourceRange, fragment: string): PatternSessionEdit;
  setControl(controlId: string, optionId: string): void;
  selectedOption(controlId: string): string | undefined;
  setExportName(name: string): void;
  /** Clear storage and restore package defaults. */
  reset(): void;
  /** Adopt state written by another document without writing it back. */
  adoptStored(source: string | null): void;
  /** Locate the source for the element at `elementIndex` in DOM preorder of the compiled HTML. */
  elementSource(elementIndex: number, cssMatches: readonly ScopedSelectorMatch[]): PatternElementSource;
  artifactName(kind: PatternArtifactKind): string;
  artifacts(theme: PatternExportTheme): Readonly<Record<PatternArtifactKind, string>>;
  packageArtifacts(theme: PatternExportTheme): ReturnType<typeof packagePatternArtifacts>;
}

const attempt = <T>(action: () => T, fallback: T) => {
  try { return action(); } catch { return fallback; }
};

/** Own one Pattern's authoring state: edits, persistence, inspection, and export. */
export const createPatternSession = (definition: PatternDefinition, storage?: PatternStorage): PatternSession => {
  const key = patternStorageKey(definition);
  let compilation = compilePattern(definition, attempt(() => parseStoredPatternState(definition, storage?.getItem(key) ?? null), defaultPatternState(definition)));

  const adopt = (state: Partial<PatternState>, persist = true) => {
    compilation = compilePattern(definition, state);
    if (persist) attempt(() => storage?.setItem(key, serializePatternState(definition, compilation.state)), undefined);
  };
  const accept = (result: ReturnType<typeof setPatternHtml>): PatternSessionEdit => {
    if (!result.success) return result;
    adopt(result.state);
    return { success: true };
  };

  return {
    definition,
    storageKey: key,
    get compilation() { return compilation; },
    get previewCss() { return scopePatternPreviewCss(definition, compilation.css); },
    editCss: (css) => accept(setPatternStylesheet(definition, compilation.state, css)),
    editHtml: (html) => accept(setPatternHtml(definition, compilation.state, html)),
    editHtmlFragment: (range, fragment) => accept(setPatternHtml(definition, compilation.state, replaceSourceRange(compilation.html, range, fragment))),
    setControl: (controlId, optionId) => adopt(setPatternStateControl(definition, compilation.state, controlId, optionId)),
    selectedOption: (controlId) => selectedPatternOption(definition, compilation.state, controlId),
    setExportName: (name) => adopt(setPatternExportName(definition, compilation.state, name)),
    reset: () => {
      attempt(() => storage?.removeItem(key), undefined);
      adopt(defaultPatternState(definition), false);
    },
    adoptStored: (source) => adopt(parseStoredPatternState(definition, source), false),
    elementSource: (elementIndex, cssMatches) => {
      const html = htmlElementRange(compilation.html, elementIndex);
      return { html, htmlFragment: sourceRangeFragment(compilation.html, html), cssOffset: cssRuleRange(compilation.css, cssMatches)?.start ?? 0 };
    },
    artifactName: (kind) => `${compilation.state.exportName}.${kind}`,
    artifacts: (theme) => compilePatternArtifacts(compilation, theme),
    packageArtifacts: (theme) => packagePatternArtifacts(compilation, theme),
  };
};
