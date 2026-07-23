import {
  authoredRules,
  differsFromStarter,
  migrateStoredOverrides,
  parsePrimitiveOverrides,
  selectedValueIsAllowed,
  type Diagnostic,
  type ElementDefinition,
  type ElementOverrideStore,
  type SelectedValue,
  type TokenRegistry,
} from "../model/index.ts";
import type { ElementCatalog } from "../catalog/index.ts";
import { parseCssDeclarationList } from "../css-declarations/index.ts";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type PreferenceStore = { storage: StorageLike; catalog: ElementCatalog; tokenRegistry?: TokenRegistry };
const ELEMENT_KEY = "techies-tools:framework:element-diffs:v2";
const LEGACY_ELEMENT_KEY = "techies-tools:framework:element-diffs:v1";
const PRIMITIVE_KEY = "techies-tools:framework:primitive-diffs:v1";
const RULE_DRAFT_KEY = "techies-tools:framework:rule-drafts:v2";
const LEGACY_RULE_DRAFT_KEY = "techies-tools:framework:rule-drafts:v1";
export type RuleDraftStore = { schemaVersion: 2; entries: Record<string, Record<string, string>> };
const empty = (): ElementOverrideStore => ({ schemaVersion: 2, entries: {} });
const browserStore = (): StorageLike | null => {
  try { return globalThis.localStorage ?? null; } catch { return null; }
};
const resolve = (store?: Partial<PreferenceStore>): PreferenceStore | null => {
  const storage = store?.storage ?? browserStore();
  return storage && store?.catalog ? { storage, catalog: store.catalog, tokenRegistry: store.tokenRegistry } : null;
};
const definitionsFor = (catalog: ElementCatalog): readonly ElementDefinition[] => catalog.elements.flatMap((element) =>
  element.definition ? [{ ...element, definition: element.definition } as ElementDefinition] : []);
const cloneStore = (store: ElementOverrideStore): ElementOverrideStore => structuredClone(store);
const emptyDrafts = (): RuleDraftStore => ({ schemaVersion: 2, entries: {} });

export const loadRuleDrafts = (store?: Partial<PreferenceStore>): RuleDraftStore => {
  const resolved = resolve(store);
  if (!resolved) return emptyDrafts();
  try {
    const raw = JSON.parse(resolved.storage.getItem(RULE_DRAFT_KEY) ?? resolved.storage.getItem(LEGACY_RULE_DRAFT_KEY) ?? "null") as unknown;
    if (!raw || typeof raw !== "object" || ![1, 2].includes((raw as { schemaVersion?: number }).schemaVersion ?? -1)) return emptyDrafts();
    const entries: RuleDraftStore["entries"] = {};
    const schemaVersion = (raw as { schemaVersion: 1 | 2 }).schemaVersion;
    const definitions = new Map<string, Set<string>>(definitionsFor(resolved.catalog).map((definition) => [definition.id, new Set(authoredRules(definition).map((rule) => `${definition.id}/${rule.key}`))]));
    for (const [elementId, rules] of Object.entries((raw as { entries?: Record<string, unknown> }).entries ?? {})) {
      if (!definitions.has(elementId) || !rules || typeof rules !== "object") continue;
      for (const [storedRuleId, source] of Object.entries(rules)) {
        const rulePath = schemaVersion === 1 && !storedRuleId.startsWith(`${elementId}/`) ? `${elementId}/${storedRuleId}` : storedRuleId;
        if (definitions.get(elementId)?.has(rulePath) && typeof source === "string" && source.length <= 20000) (entries[elementId] ??= {})[rulePath] = source;
      }
    }
    return { schemaVersion: 2, entries };
  } catch { return emptyDrafts(); }
};

const writeRuleDrafts = (drafts: RuleDraftStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return false;
  try {
    if (Object.keys(drafts.entries).length) resolved.storage.setItem(RULE_DRAFT_KEY, JSON.stringify(drafts));
    else resolved.storage.removeItem(RULE_DRAFT_KEY);
    resolved.storage.removeItem(LEGACY_RULE_DRAFT_KEY);
    return true;
  } catch { return false; }
};

export const saveRuleDraft = (elementId: string, ruleId: string, source: string | null, store?: Partial<PreferenceStore>) => {
  const drafts = structuredClone(loadRuleDrafts(store));
  if (source === null) {
    delete drafts.entries[elementId]?.[ruleId];
    if (drafts.entries[elementId] && !Object.keys(drafts.entries[elementId]).length) delete drafts.entries[elementId];
  } else {
    (drafts.entries[elementId] ??= {})[ruleId] = source;
  }
  return writeRuleDrafts(drafts, store);
};

const readElements = (store?: Partial<PreferenceStore>): { store: ElementOverrideStore; diagnostics: readonly Diagnostic[] } => {
  const resolved = resolve(store);
  if (!resolved) return { store: empty(), diagnostics: [] };
  try {
    const source = resolved.storage.getItem(ELEMENT_KEY) ?? resolved.storage.getItem(LEGACY_ELEMENT_KEY);
    return source ? migrateStoredOverrides(JSON.parse(source), definitionsFor(resolved.catalog), resolved.tokenRegistry) : { store: empty(), diagnostics: [] };
  } catch {
    return {
      store: empty(),
      diagnostics: [{ code: "preferences.quarantined", message: "Saved Element preferences could not be parsed; no saved values were applied.", repair: "Reset Framework preferences or choose new listed values.", channels: ["elements", "context"] }],
    };
  }
};
const writeElements = (value: ElementOverrideStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return { ok: false as const, diagnostics: [] as readonly Diagnostic[] };
  try {
    if (Object.keys(value.entries).length) resolved.storage.setItem(ELEMENT_KEY, JSON.stringify(value));
    else resolved.storage.removeItem(ELEMENT_KEY);
    resolved.storage.removeItem(LEGACY_ELEMENT_KEY);
    return { ok: true as const, diagnostics: [] as readonly Diagnostic[] };
  } catch {
    return { ok: false as const, diagnostics: [{ code: "preferences.write", message: "Element preferences could not be saved.", repair: "Allow local storage or retry in a writable browser context.", channels: ["preview", "elements", "context"] }] as readonly Diagnostic[] };
  }
};

export type LoadedPreferences = { elementDiffs: ElementOverrideStore; primitiveDiffs: Record<string, string>; diagnostics: readonly Diagnostic[] };
export const loadFrameworkPreferences = (store?: Partial<PreferenceStore>): LoadedPreferences => {
  const loaded = readElements(store);
  const resolved = resolve(store);
  if (!resolved) return { elementDiffs: loaded.store, primitiveDiffs: {}, diagnostics: loaded.diagnostics };
  try {
    const source = resolved.storage.getItem(PRIMITIVE_KEY);
    if (!source) return { elementDiffs: loaded.store, primitiveDiffs: {}, diagnostics: loaded.diagnostics };
    const primitive = parsePrimitiveOverrides(JSON.parse(source));
    return primitive.success
      ? { elementDiffs: loaded.store, primitiveDiffs: { ...primitive.data.values }, diagnostics: loaded.diagnostics }
      : { elementDiffs: loaded.store, primitiveDiffs: {}, diagnostics: [...loaded.diagnostics, ...primitive.diagnostics] };
  } catch {
    return { elementDiffs: loaded.store, primitiveDiffs: {}, diagnostics: [...loaded.diagnostics, { code: "primitive-store.quarantined", message: "Saved Primitive differences could not be parsed.", repair: "Reset Primitive preferences.", channels: ["preview", "tokens", "elements", "context"] }] };
  }
};

export const savePrimitiveDiffs = (diffs: Record<string, string>, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  const parsed = parsePrimitiveOverrides({ schemaVersion: 1, values: diffs });
  if (!resolved || !parsed.success) return { ok: false as const, diagnostics: parsed.success ? [] : parsed.diagnostics };
  try {
    if (Object.keys(diffs).length) resolved.storage.setItem(PRIMITIVE_KEY, JSON.stringify({ schemaVersion: 1, values: diffs }));
    else resolved.storage.removeItem(PRIMITIVE_KEY);
    return { ok: true as const, diagnostics: [] as readonly Diagnostic[] };
  } catch {
    return { ok: false as const, diagnostics: [] as readonly Diagnostic[] };
  }
};

export const nextElementSelection = (
  current: ElementOverrideStore,
  definition: ElementDefinition,
  rulePath: string,
  property: string,
  value: SelectedValue,
  tokenRegistry?: TokenRegistry,
): { success: true; store: ElementOverrideStore } | { success: false; diagnostics: readonly Diagnostic[] } => {
  const relativeRuleId = rulePath.slice(definition.id.length + 1);
  const rule = authoredRules(definition).find((item) => item.key === relativeRuleId)?.rule;
  const declaration = rule?.declarations[property];
  if (!declaration || !selectedValueIsAllowed(value, declaration, tokenRegistry)) return {
    success: false,
    diagnostics: [{ code: declaration?.control.kind === "length" ? "preferences.length" : "preferences.value", message: declaration?.control.kind === "length" ? `${rulePath}/${property} is not a safe reviewed CSS length.` : `${rulePath}/${property} is not an authored option.`, repair: declaration?.control.kind === "length" ? `Enter ${declaration.control.allowNegative ? "a signed" : "a nonnegative"} finite number with an admitted CSS length unit, unitless 0${declaration.control.keywords ? `, or ${declaration.control.keywords.join("/")}` : ""}; functions and percentages are not allowed.` : "Choose an exact listed value.", channels: ["preview", "elements", "context"], elementId: definition.id, ruleId: rulePath, property }],
  };
  const next = cloneStore(current);
  const entry = next.entries[definition.id] ?? { version: definition.version, rules: {} };
  const values = entry.rules[rulePath] ?? {};
  if (differsFromStarter(definition, relativeRuleId, property, value)) values[property] = value;
  else delete values[property];
  if (Object.keys(values).length) entry.rules[rulePath] = values;
  else delete entry.rules[rulePath];
  if (Object.keys(entry.rules).length) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return { success: true, store: next };
};

/** Replace one complete rule candidate. Validation finishes before the store is cloned or changed. */
export const nextRuleSelections = (
  current: ElementOverrideStore,
  definition: ElementDefinition,
  rulePath: string,
  candidate: Readonly<Record<string, SelectedValue>>,
  tokenRegistry?: TokenRegistry,
): { success: true; store: ElementOverrideStore } | { success: false; diagnostics: readonly Diagnostic[] } => {
  const relativeRuleId = rulePath.slice(definition.id.length + 1);
  const rule = authoredRules(definition).find((item) => item.key === relativeRuleId)?.rule;
  if (!rule) return {
    success: false,
    diagnostics: [{ code: "preferences.rule", message: `${rulePath} is not an authored Treatment Rule Path.`, repair: "Choose a current listed Treatment Rule Path.", channels: ["preview", "elements", "context"], elementId: definition.id, ruleId: rulePath }],
  };

  const diagnostics: Diagnostic[] = [];
  const normalized: Record<string, SelectedValue> = {};
  for (const property of Object.keys(candidate)) {
    if (!rule.declarations[property]) diagnostics.push({
      code: "preferences.property",
      message: `${rulePath}/${property} is not an authored property.`,
      repair: "Remove it and use only listed properties.",
      channels: ["preview", "elements", "context"],
      elementId: definition.id,
      ruleId: rulePath,
      property,
    });
  }
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    const value = candidate[property] ?? (declaration.allowOmit ? { kind: "omit" as const } : undefined);
    if (!value) {
      diagnostics.push({
        code: "preferences.missing",
        message: `${rulePath}/${property} is required.`,
        repair: "Add the missing listed property and value.",
        channels: ["preview", "elements", "context"],
        elementId: definition.id,
        ruleId: rulePath,
        property,
      });
    } else if (!selectedValueIsAllowed(value, declaration, tokenRegistry)) {
      diagnostics.push({
        code: declaration.control.kind === "length" ? "preferences.length" : "preferences.value",
        message: `${rulePath}/${property} is not a safe admitted value.`,
        repair: "Choose a current listed value.",
        channels: ["preview", "elements", "context"],
        elementId: definition.id,
        ruleId: rulePath,
        property,
      });
    } else {
      normalized[property] = value;
    }
  }
  if (diagnostics.length) return { success: false, diagnostics };

  const next = cloneStore(current);
  const entry = next.entries[definition.id] ?? { version: definition.version, rules: {} };
  const differences = Object.fromEntries(Object.entries(normalized)
    .filter(([property, value]) => differsFromStarter(definition, relativeRuleId, property, value)));
  if (Object.keys(differences).length) entry.rules[rulePath] = differences;
  else delete entry.rules[rulePath];
  if (Object.keys(entry.rules).length) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return { success: true, store: next };
};

/** Store authored source bytes only when their normalized declarations differ from Starter. */
export const nextRuleDeclarationSource = (
  current: ElementOverrideStore,
  definition: ElementDefinition,
  rulePath: string,
  source: string,
  starterSource: string,
): ElementOverrideStore => {
  const next = cloneStore(current);
  const entry = next.entries[definition.id] ?? { version: definition.version, rules: {} };
  const normalized = (value: string) => {
    const parsed = parseCssDeclarationList(value);
    return parsed.success ? parsed.source : value;
  };
  if (normalized(source) === normalized(starterSource)) delete entry.css?.[rulePath];
  else (entry.css ??= {})[rulePath] = source;
  if (entry.css && !Object.keys(entry.css).length) delete entry.css;
  if (Object.keys(entry.rules).length || entry.css) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return next;
};

export const saveElementSelection = (definition: ElementDefinition, rulePath: string, property: string, value: SelectedValue, store?: Partial<PreferenceStore>) => {
  const loaded = readElements(store);
  const next = nextElementSelection(loaded.store, definition, rulePath, property, value, store?.tokenRegistry);
  return next.success ? writeElements(next.store, store) : { ok: false as const, diagnostics: next.diagnostics };
};
export const saveElementDiffs = (diffs: ElementOverrideStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  const validated = migrateStoredOverrides(diffs, resolved ? definitionsFor(resolved.catalog) : [], resolved?.tokenRegistry);
  return validated.diagnostics.length ? { ok: false as const, diagnostics: validated.diagnostics } : writeElements(validated.store, store);
};
export const resetElement = (elementId: string, store?: Partial<PreferenceStore>) => {
  const next = cloneStore(readElements(store).store);
  delete next.entries[elementId];
  const written = writeElements(next, store);
  const drafts = structuredClone(loadRuleDrafts(store));
  delete drafts.entries[elementId];
  writeRuleDrafts(drafts, store);
  return written;
};
export const resetIntentGroup = (groupId: string, catalog: ElementCatalog, store?: Partial<PreferenceStore>) => {
  const definitions = definitionsFor(catalog);
  const next = cloneStore(readElements(store).store);
  for (const definition of definitions.filter((entry) => entry.group === groupId)) delete next.entries[definition.id];
  const written = writeElements(next, store);
  const drafts = structuredClone(loadRuleDrafts(store));
  for (const definition of definitions.filter((entry) => entry.group === groupId)) delete drafts.entries[definition.id];
  writeRuleDrafts(drafts, store);
  return written;
};
export const resetFramework = (store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return { ok: false as const };
  try {
    resolved.storage.removeItem(ELEMENT_KEY);
    resolved.storage.removeItem(LEGACY_ELEMENT_KEY);
    resolved.storage.removeItem(PRIMITIVE_KEY);
    resolved.storage.removeItem(RULE_DRAFT_KEY);
    resolved.storage.removeItem(LEGACY_RULE_DRAFT_KEY);
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
};
