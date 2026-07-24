import { compileDraftSpecimen, compileFramework, primitiveTokensFromSnapshot, type CompileFrameworkInput, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";
import { parseRuleDeclarations, serializeRuleDeclarations } from "../element-authoring/index.ts";
import { deepFreeze, valueToCss, type Diagnostic, type ParseResult, type SelectedValue } from "../model/index.ts";
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
import { prepareAccessibilityRepair, type AccessibilityRepair } from "../accessibility/index.ts";

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
  acceptAccessibilityRepair(repair: AccessibilityRepair): FrameworkCompilation;
  draftSpecimen(elementId: string): ReturnType<typeof compileDraftSpecimen>;
};

const complete = (compilation: FrameworkCompilation) => compilation.preview.available
  && compilation.artifacts.tokens.available
  && compilation.artifacts.elements.available
  && compilation.artifacts.context.available;

const retainPreview = (lastValid: FrameworkCompilation, attempt: FrameworkCompilation, diagnostics: readonly Diagnostic[]): FrameworkCompilation => {
  const primitivesChanged = JSON.stringify(attempt.resolved.primitives) !== JSON.stringify(lastValid.resolved.primitives);
  const useAttemptCompilation = complete(attempt) || (attempt.artifacts.tokens.available && primitivesChanged);
  return deepFreeze({
    ...attempt,
    resolved: useAttemptCompilation ? attempt.resolved : lastValid.resolved,
    identity: useAttemptCompilation ? attempt.identity : lastValid.identity,
    preview: useAttemptCompilation ? attempt.preview : lastValid.preview,
    artifacts: {
      ...attempt.artifacts,
      tokens: attempt.artifacts.tokens.available
        ? useAttemptCompilation ? attempt.artifacts.tokens : lastValid.artifacts.tokens
        : attempt.artifacts.tokens,
      elements: attempt.artifacts.elements.available
        ? useAttemptCompilation ? attempt.artifacts.elements : lastValid.artifacts.elements
        : attempt.artifacts.elements,
      context: attempt.artifacts.context.available
        ? useAttemptCompilation ? attempt.artifacts.context : lastValid.artifacts.context
        : attempt.artifacts.context,
    },
    diagnostics,
  }) as FrameworkCompilation;
};

export const createFrameworkController = (initialInput: CompileFrameworkInput, preferences: Partial<PreferenceStore> = {}): FrameworkController => {
  let input = { ...initialInput };
  const configuredStore = () => ({ ...preferences, catalog: input.catalog });
  let loaded = loadFrameworkPreferences(configuredStore());
  let drafts = loadRuleDrafts(configuredStore());
  let diffs = initialInput.elementDiffs ?? loaded.elementDiffs;
  let primitiveDiffs = { ...(initialInput.primitiveDiffs ?? {}), ...loaded.primitiveDiffs };
  const cleanInitial = compileFramework({ ...input, elementDiffs: diffs, primitiveDiffs });
  const diagnosticsForDrafts = (tokens: FrameworkCompilation["resolved"]["primitives"]) => Object.entries(drafts.entries).flatMap(([elementId, rules]) => {
    const element = input.catalog.get(elementId);
    const definition = element?.definition ? { ...element, definition: element.definition } : undefined;
    if (!definition) return [];
    return Object.entries(rules).flatMap(([ruleId, source]) => {
      const parsed = parseRuleDeclarations({ catalog: input.catalog, rulePath: ruleId, source, tokens });
      return parsed.success ? [] : parsed.diagnostics;
    });
  });
  let lastValid = complete(cleanInitial)
    ? cleanInitial
    : compileFramework({ ...input, elementDiffs: { schemaVersion: 2, entries: {} }, primitiveDiffs: {} });
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
  const findDefinition = (id: string) => {
    const element = input.catalog.get(id);
    return element?.definition ? { ...element, definition: element.definition } : undefined;
  };
  const rejected = (diagnostics: readonly Diagnostic[]) => {
    const attempt = compileCandidate();
    return retainPreview(lastValid, { ...attempt, diagnostics }, diagnostics);
  };

  return {
    current: () => current,
    select: (elementId, ruleId, property, value) => {
      const rulePath = `${elementId}/${ruleId}`;
      const definition = findDefinition(elementId);
      if (!definition || !input.catalog.rule(rulePath)) return rejected([{
        code: "controller.path",
        message: `${rulePath}/${property} is not an authored Element control.`,
        repair: "Use a generated control from the current Treatment Definition.",
        channels: ["preview", "elements", "context"],
        elementId,
        ruleId: rulePath,
        property,
      }]);
      const tokenRegistry = new Map(current.resolved.primitives.map((token) => [token.id, token.type] as const));
      const next = nextElementSelection(diffs, definition, rulePath, property, value, tokenRegistry);
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
      const rulePath = `${elementId}/${ruleId}`;
      const definition = findDefinition(elementId);
      if (!definition || !input.catalog.rule(rulePath)) return rejected([{
        code: "controller.path",
        message: `${rulePath} is not an authored Treatment Rule Path.`,
        repair: "Use a generated editor for the current Treatment Definition.",
        channels: ["preview", "elements", "context"],
        elementId,
        ruleId: rulePath,
      }]);
      const tokens = current.resolved.primitives;
      const parsed = parseRuleDeclarations({ catalog: input.catalog, rulePath, source, tokens });
      if (!parsed.success) {
        saveRuleDraft(elementId, rulePath, source, configuredStore());
        drafts = loadRuleDrafts(configuredStore());
        return rejected(parsed.diagnostics);
      }
      const tokenRegistry = new Map(tokens.map((token) => [token.id, token.type] as const));
      const starter = serializeRuleDeclarations({ catalog: input.catalog, rulePath, tokens });
      if (!starter.success) return rejected(starter.diagnostics);
      // Re-read through the migration boundary before replacing one rule. A
      // quarantined, unrelated persisted path must not veto this valid edit.
      const cleaned = loadFrameworkPreferences({ ...configuredStore(), tokenRegistry });
      const next = nextRuleDeclarationSource(cleaned.elementDiffs, definition, rulePath, source, starter.data);
      const attempt = compileCandidate(next, parsed.diagnostics);
      if (!complete(attempt)) return applyAttempt(attempt);
      const saved = saveElementDiffs(next, { ...configuredStore(), tokenRegistry });
      if (!saved.ok) return rejected(saved.diagnostics);
      diffs = next;
      loaded = { ...cleaned, elementDiffs: next, diagnostics: [] };
      // Valid source is persisted with the applied override. Draft storage is
      // reserved for invalid input, so an older invalid draft cannot win after
      // a valid blur commit and reload.
      saveRuleDraft(elementId, rulePath, null, configuredStore());
      drafts = loadRuleDrafts(configuredStore());
      return applyAttempt(attempt);
    },
    ruleDeclarationSource: (elementId, ruleId) => {
      const rulePath = `${elementId}/${ruleId}`;
      const definition = findDefinition(elementId);
      const resolvedRule = current.resolved.elements.find((item) => item.id === elementId)?.rules.find((item) => item.id === ruleId);
      if (!definition || !resolvedRule) return {
        success: false,
        diagnostics: [{ code: "controller.path", message: `${rulePath} is not an authored Treatment Rule Path.`, repair: "Choose a current listed rule.", channels: ["preview", "elements", "context"], elementId, ruleId: rulePath }],
      };
      const draft = drafts.entries[elementId]?.[rulePath];
      if (draft !== undefined) return { success: true, data: draft, diagnostics: [] };
      const css = diffs.entries[elementId]?.css?.[rulePath];
      if (css !== undefined) return { success: true, data: css, diagnostics: [] };
      return serializeRuleDeclarations({
        catalog: input.catalog,
        rulePath,
        values: Object.fromEntries(resolvedRule.declarations.filter((item) => item.value.kind !== "css").map((item) => [item.property, item.value])) as Readonly<Record<string, SelectedValue>>,
        tokens: current.resolved.primitives,
      });
    },
    resetElement: (elementId) => {
      removeElementDiffs(elementId, configuredStore());
      return refresh();
    },
    resetGroup: (groupId) => {
      resetIntentGroup(groupId, input.catalog, configuredStore());
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
    acceptAccessibilityRepair: (repair) => {
      const prepared = prepareAccessibilityRepair({ framework: current.resolved, repair });
      if (!prepared.success) return rejected(prepared.diagnostics);
      const definition = findDefinition(prepared.data.elementId);
      if (!definition) return rejected([{
        code: "controller.path",
        message: `${prepared.data.elementId} is no longer an Active Treatment.`,
        repair: "Recalculate contrast improvements.",
        channels: ["preview", "elements", "context"],
        elementId: prepared.data.elementId,
        severity: "warning",
        portability: "app-only",
      }]);
      const tokenRegistry = new Map(current.resolved.primitives.map((token) => [token.id, token.type] as const));
      const cssSource = diffs.entries[prepared.data.elementId]?.css?.[prepared.data.rulePath];
      let next;
      if (cssSource !== undefined) {
        const parsed = parseRuleDeclarations({ catalog: input.catalog, rulePath: prepared.data.rulePath, source: cssSource, tokens: current.resolved.primitives });
        if (!parsed.success) return rejected(parsed.diagnostics);
        const tokenVariables = new Map(current.resolved.primitives.map((token) => [token.id, token.cssName]));
        const repairedValue = valueToCss(prepared.data.value, tokenVariables);
        if (!repairedValue) return rejected([{
          code: "controller.repair-value",
          message: `${prepared.data.property} could not be serialized for the current Token registry.`,
          repair: "Recalculate contrast improvements.",
          channels: ["preview", "elements", "context"],
          elementId: prepared.data.elementId,
          ruleId: prepared.data.rulePath,
          property: prepared.data.property,
        }]);
        const lastTargetIndex = parsed.data.declarations.findLastIndex((declaration) => declaration.property === prepared.data.property);
        const repairedSource = parsed.data.declarations
          .map((declaration, index) => `${declaration.property}: ${index === lastTargetIndex ? repairedValue : declaration.value}${declaration.important ? " !important" : ""};`)
          .join("\n");
        const starter = serializeRuleDeclarations({ catalog: input.catalog, rulePath: prepared.data.rulePath, tokens: current.resolved.primitives });
        if (!starter.success) return rejected(starter.diagnostics);
        next = nextRuleDeclarationSource(diffs, definition, prepared.data.rulePath, repairedSource, starter.data);
      } else {
        next = nextElementSelection(diffs, definition, prepared.data.rulePath, prepared.data.property, prepared.data.value, tokenRegistry);
        if (!next.success) return rejected(next.diagnostics);
        next = next.store;
      }
      const attempt = compileCandidate(next);
      if (!complete(attempt)) return applyAttempt(attempt);
      const saved = saveElementDiffs(next, { ...configuredStore(), tokenRegistry });
      if (!saved.ok) return rejected(saved.diagnostics);
      diffs = next;
      loaded = { ...loaded, elementDiffs: next, diagnostics: [] };
      return applyAttempt(attempt);
    },
    draftSpecimen: (elementId) => {
      const element = input.catalog.get(elementId);
      return element?.lifecycle === "Draft"
        ? compileDraftSpecimen({ element, elementDiffs: diffs, primitives: current.resolved.primitives })
        : { css: "", diagnostics: [] };
    },
  };
};

export const valueForControl = (compilation: FrameworkCompilation, elementId: string, ruleId: string, property: string): SelectedValue | undefined => {
  const value = compilation.resolved.elements.find((element) => element.id === elementId)?.rules.find((rule) => rule.id === ruleId)?.declarations.find((declaration) => declaration.property === property)?.value;
  return value?.kind === "css" ? undefined : value;
};
