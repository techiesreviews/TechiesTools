import { compileDraftSpecimen, compileFramework, primitiveTokensFromSnapshot, type CompileFrameworkInput, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";
import { parseRuleDeclarations, serializeRuleDeclarations } from "../actions-authoring/index.ts";
import { authoredRules, deepFreeze, type Diagnostic, type ParseResult, type SelectedValue } from "../model/index.ts";
import {
  loadFrameworkPreferences,
  loadRuleDrafts,
  nextElementSelection,
  nextRuleDeclarationSource,
  resetElement as removeElementDiffs,
  resetFramework as removeFrameworkDiffs,
  resetIntentGroup,
  saveElementDiffs,
  savePrimitiveDiffs,
  saveRuleDraft,
  type PreferenceStore,
} from "../preferences/index.ts";

export type FrameworkController = {
  current(): FrameworkCompilation;
  select(elementId: string, ruleId: string, property: string, value: SelectedValue): FrameworkCompilation;
  editRuleDeclarations(elementId: string, ruleId: string, source: string): FrameworkCompilation;
  ruleDeclarationSource(elementId: string, ruleId: string): ParseResult<string>;
  resetElement(elementId: string): FrameworkCompilation;
  resetGroup(groupId: string): FrameworkCompilation;
  resetFramework(): FrameworkCompilation;
  updatePrimitives(snapshot: PrimitiveSnapshot, baseline?: PrimitiveSnapshot): FrameworkCompilation;
  validateForExport(): FrameworkCompilation;
  draftSpecimen(elementId: string): ReturnType<typeof compileDraftSpecimen>;
};

const complete = (compilation: FrameworkCompilation) => compilation.preview.available
  && compilation.artifacts.tokens.available
  && compilation.artifacts.elements.available
  && compilation.artifacts.context.available;

const retainPreview = (lastValid: FrameworkCompilation, attempt: FrameworkCompilation, diagnostics: readonly Diagnostic[]): FrameworkCompilation => deepFreeze({
  ...attempt,
  resolved: lastValid.resolved,
  identity: lastValid.identity,
  preview: lastValid.preview,
  artifacts: {
    ...attempt.artifacts,
    elements: attempt.artifacts.elements.available ? { available: false as const, diagnostics } : attempt.artifacts.elements,
    context: attempt.artifacts.context.available ? { available: false as const, diagnostics } : attempt.artifacts.context,
  },
  diagnostics,
}) as FrameworkCompilation;

export const createFrameworkController = (initialInput: CompileFrameworkInput, preferences: Partial<PreferenceStore> = {}): FrameworkController => {
  let input = { ...initialInput };
  const configuredStore = () => ({ ...preferences, definitions: input.definitions });
  let loaded = loadFrameworkPreferences(configuredStore());
  let drafts = loadRuleDrafts(configuredStore());
  let diffs = initialInput.elementDiffs ?? loaded.elementDiffs;
  let primitiveDiffs = { ...(initialInput.primitiveDiffs ?? {}), ...loaded.primitiveDiffs };
  const cleanInitial = compileFramework({ ...input, elementDiffs: diffs, primitiveDiffs });
  const diagnosticsForDrafts = (tokens: FrameworkCompilation["resolved"]["primitives"]) => Object.entries(drafts.entries).flatMap(([elementId, rules]) => {
    const definition = input.definitions.find((item) => item.id === elementId);
    if (!definition) return [];
    return Object.entries(rules).flatMap(([ruleId, source]) => {
      const parsed = parseRuleDeclarations({ definition, ruleId, source, tokens });
      return parsed.success ? [] : parsed.diagnostics;
    });
  });
  let lastValid = complete(cleanInitial)
    ? cleanInitial
    : compileFramework({ ...input, elementDiffs: { schemaVersion: 1, entries: {} }, primitiveDiffs: {} });
  let current = loaded.diagnostics.length
    ? retainPreview(lastValid, compileFramework({ ...input, elementDiffs: diffs, primitiveDiffs, preferenceDiagnostics: loaded.diagnostics }), loaded.diagnostics)
    : cleanInitial;
  const initialDraftDiagnostics = diagnosticsForDrafts(lastValid.resolved.primitives);
  if (initialDraftDiagnostics.length) current = retainPreview(lastValid, current, [...current.diagnostics, ...initialDraftDiagnostics]);
  if (complete(current)) lastValid = current;

  const compileCandidate = (candidateDiffs = diffs, preferenceDiagnostics: readonly Diagnostic[] = []) =>
    compileFramework({ ...input, elementDiffs: candidateDiffs, primitiveDiffs, preferenceDiagnostics });
  const applyAttempt = (attempt: FrameworkCompilation) => {
    const draftDiagnostics = diagnosticsForDrafts(attempt.resolved.primitives);
    if (draftDiagnostics.length) {
      const diagnostics = [...attempt.diagnostics, ...draftDiagnostics];
      current = retainPreview(lastValid, { ...attempt, diagnostics }, diagnostics);
    } else if (complete(attempt)) {
      lastValid = attempt;
      current = attempt;
    } else {
      current = retainPreview(lastValid, attempt, attempt.diagnostics);
    }
    return current;
  };
  const refresh = () => {
    loaded = loadFrameworkPreferences(configuredStore());
    drafts = loadRuleDrafts(configuredStore());
    diffs = loaded.elementDiffs;
    primitiveDiffs = loaded.primitiveDiffs;
    return applyAttempt(compileCandidate(diffs, loaded.diagnostics));
  };
  const findDefinition = (id: string) => input.definitions.find((item) => item.id === id);
  const rejected = (diagnostics: readonly Diagnostic[]) => {
    const attempt = compileCandidate();
    return retainPreview(lastValid, { ...attempt, diagnostics }, diagnostics);
  };

  return {
    current: () => current,
    select: (elementId, ruleId, property, value) => {
      const definition = findDefinition(elementId);
      if (!definition || !authoredRules(definition).some((item) => item.key === ruleId)) return rejected([{
        code: "controller.path",
        message: `${elementId}/${ruleId}/${property} is not an authored Actions control.`,
        repair: "Use a generated control from the current Treatment Definition.",
        channels: ["preview", "elements", "context"],
        elementId,
        ruleId,
        property,
      }]);
      const tokenRegistry = new Map(current.resolved.primitives.map((token) => [token.id, token.type] as const));
      const next = nextElementSelection(diffs, definition, ruleId, property, value, tokenRegistry);
      if (!next.success) return rejected(next.diagnostics);
      const attempt = compileCandidate(next.store);
      if (!complete(attempt)) return applyAttempt(attempt);
      const saved = saveElementDiffs(next.store, { ...configuredStore(), tokenRegistry });
      if (!saved.ok) return rejected(saved.diagnostics);
      diffs = next.store;
      loaded = { ...loaded, elementDiffs: next.store, diagnostics: [] };
      return applyAttempt(attempt);
    },
    editRuleDeclarations: (elementId, ruleId, source) => {
      const definition = findDefinition(elementId);
      if (!definition || !authoredRules(definition).some((item) => item.key === ruleId)) return rejected([{
        code: "controller.path",
        message: `${elementId}/${ruleId} is not an authored Actions rule.`,
        repair: "Use a generated editor for the current Treatment Definition.",
        channels: ["preview", "elements", "context"],
        elementId,
        ruleId,
      }]);
      const tokens = current.resolved.primitives;
      const parsed = parseRuleDeclarations({ definition, ruleId, source, tokens });
      if (!parsed.success) {
        saveRuleDraft(elementId, ruleId, source, configuredStore());
        drafts = loadRuleDrafts(configuredStore());
        return rejected(parsed.diagnostics);
      }
      const tokenRegistry = new Map(tokens.map((token) => [token.id, token.type] as const));
      const starter = serializeRuleDeclarations({ definition, ruleId, tokens });
      if (!starter.success) return rejected(starter.diagnostics);
      // Re-read through the migration boundary before replacing one rule. A
      // quarantined, unrelated persisted path must not veto this valid edit.
      const cleaned = loadFrameworkPreferences({ ...configuredStore(), tokenRegistry });
      const next = nextRuleDeclarationSource(cleaned.elementDiffs, definition, ruleId, source, starter.data);
      const attempt = compileCandidate(next);
      const saved = saveElementDiffs(next, { ...configuredStore(), tokenRegistry });
      if (!saved.ok) return rejected(saved.diagnostics);
      diffs = next;
      loaded = { ...cleaned, elementDiffs: next, diagnostics: [] };
      // Valid source is persisted with the applied override. Draft storage is
      // reserved for invalid input, so an older invalid draft cannot win after
      // a valid blur commit and reload.
      saveRuleDraft(elementId, ruleId, null, configuredStore());
      drafts = loadRuleDrafts(configuredStore());
      const withWarnings = parsed.diagnostics.length ? deepFreeze({ ...attempt, diagnostics: parsed.diagnostics }) as FrameworkCompilation : attempt;
      return applyAttempt(withWarnings);
    },
    ruleDeclarationSource: (elementId, ruleId) => {
      const definition = findDefinition(elementId);
      const resolvedRule = current.resolved.elements.find((item) => item.id === elementId)?.rules.find((item) => item.id === ruleId);
      if (!definition || !resolvedRule) return {
        success: false,
        diagnostics: [{ code: "controller.path", message: `${elementId}/${ruleId} is not an authored Actions rule.`, repair: "Choose a current listed rule.", channels: ["preview", "elements", "context"], elementId, ruleId }],
      };
      const draft = drafts.entries[elementId]?.[ruleId];
      if (draft !== undefined) return { success: true, data: draft, diagnostics: [] };
      const css = diffs.entries[elementId]?.css?.[ruleId];
      if (css !== undefined) return { success: true, data: css, diagnostics: [] };
      return serializeRuleDeclarations({
        definition,
        ruleId,
        values: Object.fromEntries(resolvedRule.declarations.filter((item) => item.value.kind !== "css").map((item) => [item.property, item.value])) as Readonly<Record<string, SelectedValue>>,
        tokens: current.resolved.primitives,
      });
    },
    resetElement: (elementId) => {
      removeElementDiffs(elementId, configuredStore());
      return refresh();
    },
    resetGroup: (groupId) => {
      resetIntentGroup(groupId, input.definitions, configuredStore());
      return refresh();
    },
    resetFramework: () => {
      removeFrameworkDiffs(configuredStore());
      return refresh();
    },
    updatePrimitives: (snapshot, baseline) => {
      if (baseline) {
        const defaults = new Map(primitiveTokensFromSnapshot(baseline).map((token) => [token.id, token.value]));
        const next = Object.fromEntries(primitiveTokensFromSnapshot(snapshot)
          .filter((token) => defaults.get(token.id) !== token.value)
          .map((token) => [token.id, token.value]));
        const saved = savePrimitiveDiffs(next, configuredStore());
        if (!saved.ok) return rejected(saved.diagnostics);
        primitiveDiffs = next;
      }
      input = { ...input, primitiveSnapshot: snapshot, primitiveTokens: undefined, primitiveDefaults: undefined };
      return applyAttempt(compileCandidate());
    },
    validateForExport: () => applyAttempt(compileCandidate(diffs, loaded.diagnostics)),
    draftSpecimen: (elementId) => {
      const definition = findDefinition(elementId);
      return definition && !definition.promoted
        ? compileDraftSpecimen({ definition, elementDiffs: diffs, primitives: current.resolved.primitives })
        : { css: "", diagnostics: [] };
    },
  };
};

export const valueForControl = (compilation: FrameworkCompilation, elementId: string, ruleId: string, property: string): SelectedValue | undefined => {
  const value = compilation.resolved.elements.find((element) => element.id === elementId)?.rules.find((rule) => rule.id === ruleId)?.declarations.find((declaration) => declaration.property === property)?.value;
  return value?.kind === "css" ? undefined : value;
};
