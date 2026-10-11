import type { FrameworkElementsState } from "../events.ts";

export type RuleEditorIssue = Readonly<{
  message: string;
  repair: string;
  severity: "error" | "warning";
  checklist: readonly string[];
}>;

/** What one Treatment rule editor shows after a Framework state update. */
export type RuleEditorUpdate = Readonly<{
  /** New textarea source, or null to leave the author's text and caret alone. */
  source: string | null;
  /** The first error, otherwise the first warning, for this rule. */
  issue: RuleEditorIssue | null;
  /** Color swatch for each color token CSS variable. */
  swatches: ReadonlyMap<string, string>;
}>;

export type RuleEditorTarget = Readonly<{ elementId: string; ruleId: string }>;

/**
 * Select one rule's view of the Framework state.
 *
 * Canonical source replaces the textarea only when it differs from what is shown, and never while the
 * author has unsent typing (`dirty`) unless the update is a reset. Updates caused by other edits,
 * Primitive changes, or state requests therefore cannot move the caret mid-edit.
 */
export const ruleEditorUpdate = (
  state: Partial<FrameworkElementsState> | undefined,
  target: RuleEditorTarget,
  editor: Readonly<{ value: string; dirty: boolean }>,
): RuleEditorUpdate => {
  const canonical = state?.sources?.[target.elementId]?.[target.ruleId];
  const replace = canonical !== undefined && canonical !== editor.value && (state?.reason === "reset" || !editor.dirty);
  const relevant = (state?.diagnostics ?? []).filter((item) => item.elementId === target.elementId && item.ruleId === target.ruleId);
  const issue = relevant.find((item) => item.severity !== "warning") ?? relevant[0];
  return {
    source: replace ? canonical : null,
    issue: issue ? {
      message: issue.message,
      repair: issue.repair,
      severity: issue.severity === "warning" ? "warning" : "error",
      checklist: (issue as { checklist?: readonly string[] }).checklist ?? [],
    } : null,
    swatches: new Map((state?.tokens ?? []).filter((token) => token.type === "color").map((token) => [token.cssName, token.swatch])),
  };
};

/** Delay between the last keystroke and the rule edit that triggers a full Framework compile. */
export const RULE_EDIT_DEBOUNCE_MS = 150;
