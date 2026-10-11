import type { Diagnostic } from "./model/index.ts";
import type { AccessibilityRepair, ContrastAdvisory } from "./accessibility/index.ts";
import type { FrameworkCompilation, PackagedArtifacts, PrimitiveSnapshot } from "./compiler/index.ts";
import type { RuleDeclarationCompletion } from "./element-authoring/index.ts";
import type { FrameworkSiteTheme } from "./site-theme/index.ts";

/** A partial Primitive snapshot from the Framework settings bar. `baseline` records Starter Defaults. */
export type PrimitiveUpdate = Partial<PrimitiveSnapshot> & { baseline?: boolean; deferCompilation?: boolean; primary?: string; radius?: string };
export type RuleEdit = { elementId: string; ruleId: string; source: string };
export type CompletionRequest = RuleEdit & { editorId: string; offset: number };
/** Element picker selection that the settings bar persists and restores. */
export type ElementUiState = { selectedElement: string | null; treatmentRule: string | null };

export type FrameworkOutputs = Pick<FrameworkCompilation, "preview" | "artifacts" | "identity" | "diagnostics"> & {
  accessibilityAdvisories: readonly ContrastAdvisory[];
};

export type FrameworkElementsState = {
  elements: readonly { id: string; rules: Record<string, Record<string, unknown>> }[];
  sources: Record<string, Record<string, string>>;
  tokens: readonly { id: string; cssName: string; value: string; type: string; swatch: string }[];
  diagnostics: readonly Diagnostic[];
  reason: string;
};

/** Every window-level Framework event and its payload. */
export interface FrameworkEventMap {
  "framework-preview:update": PrimitiveUpdate;
  "framework-primitives:request-baseline": undefined;
  "framework-site-theme:update": FrameworkSiteTheme;
  "framework-site-theme:reset": undefined;
  "framework-elements:outputs": FrameworkOutputs;
  "framework-elements:state": FrameworkElementsState;
  "framework-elements:request-state": { reason?: string } | undefined;
  "framework-elements:edit-rule": RuleEdit;
  "framework-elements:complete": CompletionRequest;
  "framework-elements:completions": { editorId?: string; items: readonly RuleDeclarationCompletion[] };
  "framework-elements:reset-element": { elementId: string };
  "framework-elements:reset-group": { groupId?: string };
  "framework-elements:reset-framework": undefined;
  "framework-elements:state-change": ElementUiState;
  "framework-elements:apply-ui-state": ElementUiState;
  "framework-export:request": undefined;
  "framework-export:package": undefined;
  "framework-export:package-ready": PackagedArtifacts;
  "framework-export:package-failed": { message: string };
  "framework-accessibility:accept": { repair: AccessibilityRepair };
  "framework-accessibility:accepted": undefined;
  "framework-accessibility:failed": undefined;
}

export type FrameworkEventName = keyof FrameworkEventMap;
type DetailArgs<Name extends FrameworkEventName> = undefined extends FrameworkEventMap[Name]
  ? [detail?: FrameworkEventMap[Name]]
  : [detail: FrameworkEventMap[Name]];

/** Dispatch one Framework event on `window`. Listeners run synchronously. */
export const emitFrameworkEvent = <Name extends FrameworkEventName>(name: Name, ...[detail]: DetailArgs<Name>) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

/** Listen for one Framework event on `window`; returns the unsubscribe function. */
export const onFrameworkEvent = <Name extends FrameworkEventName>(name: Name, listener: (detail: FrameworkEventMap[Name]) => void) => {
  const handler = (event: Event) => listener((event as CustomEvent<FrameworkEventMap[Name]>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
};
