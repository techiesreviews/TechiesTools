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
import { parseCssDeclarationList } from "../css-declarations/index.ts";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type PreferenceStore = { storage: StorageLike; definitions: readonly ElementDefinition[]; tokenRegistry?: TokenRegistry };
const ELEMENT_KEY = "techies-tools:framework:element-diffs:v1";
const PRIMITIVE_KEY = "techies-tools:framework:primitive-diffs:v1";
const RULE_DRAFT_KEY = "techies-tools:framework:rule-drafts:v1";
export type RuleDraftStore = { schemaVersion: 1; entries: Record<string, Record<string, string>> };
const empty = (): ElementOverrideStore => ({ schemaVersion: 1, entries: {} });
const browserStore = (): StorageLike | null => {
  try { return globalThis.localStorage ?? null; } catch { return null; }
};
const resolve = (store?: Partial<PreferenceStore>): PreferenceStore | null => {
  const storage = store?.storage ?? browserStore();
  return storage ? { storage, definitions: store?.definitions ?? [], tokenRegistry: store?.tokenRegistry } : null;
};
const cloneStore = (store: ElementOverrideStore): ElementOverrideStore => structuredClone(store);
const emptyDrafts = (): RuleDraftStore => ({ schemaVersion: 1, entries: {} });

export const loadRuleDrafts = (store?: Partial<PreferenceStore>): RuleDraftStore => {
  const resolved = resolve(store);
  if (!resolved) return emptyDrafts();
  try {
    const raw = JSON.parse(resolved.storage.getItem(RULE_DRAFT_KEY) ?? "null") as unknown;
    if (!raw || typeof raw !== "object" || (raw as { schemaVersion?: unknown }).schemaVersion !== 1) return emptyDrafts();
    const entries: RuleDraftStore["entries"] = {};
    const definitions = new Map<string, Set<string>>(resolved.definitions.map((definition) => [definition.id, new Set(authoredRules(definition).map((rule) => rule.key))]));
    for (const [elementId, rules] of Object.entries((raw as { entries?: Record<string, unknown> }).entries ?? {})) {
      if (!definitions.has(elementId) || !rules || typeof rules !== "object") continue;
      for (const [ruleId, source] of Object.entries(rules)) {
        if (definitions.get(elementId)?.has(ruleId) && typeof source === "string" && source.length <= 20000) (entries[elementId] ??= {})[ruleId] = source;
      }
    }
    return { schemaVersion: 1, entries };
  } catch { return emptyDrafts(); }
};

const writeRuleDrafts = (drafts: RuleDraftStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return false;
  try {
    if (Object.keys(drafts.entries).length) resolved.storage.setItem(RULE_DRAFT_KEY, JSON.stringify(drafts));
    else resolved.storage.removeItem(RULE_DRAFT_KEY);
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
    const source = resolved.storage.getItem(ELEMENT_KEY);
    return source ? migrateStoredOverrides(JSON.parse(source), resolved.definitions, resolved.tokenRegistry) : { store: empty(), diagnostics: [] };
  } catch {
    return {
      store: empty(),
      diagnostics: [{ code: "preferences.quarantined", message: "Saved Element preferences could not be parsed; no saved values were applied.", repair: "Reset Framework preferences or choose new listed values.", channels: ["css", "context"] }],
    };
  }
};
const writeElements = (value: ElementOverrideStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return { ok: false as const, diagnostics: [] as readonly Diagnostic[] };
  try {
    if (Object.keys(value.entries).length) resolved.storage.setItem(ELEMENT_KEY, JSON.stringify(value));
    else resolved.storage.removeItem(ELEMENT_KEY);
    return { ok: true as const, diagnostics: [] as readonly Diagnostic[] };
  } catch {
    return { ok: false as const, diagnostics: [{ code: "preferences.write", message: "Element preferences could not be saved.", repair: "Allow local storage or retry in a writable browser context.", channels: ["preview", "css", "context"] }] as readonly Diagnostic[] };
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
    return { elementDiffs: loaded.store, primitiveDiffs: {}, diagnostics: [...loaded.diagnostics, { code: "primitive-store.quarantined", message: "Saved Primitive differences could not be parsed.", repair: "Reset Primitive preferences.", channels: ["preview", "css", "dtcg", "context"] }] };
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
  ruleId: string,
  property: string,
  value: SelectedValue,
  tokenRegistry?: TokenRegistry,
): { success: true; store: ElementOverrideStore } | { success: false; diagnostics: readonly Diagnostic[] } => {
  const rule = authoredRules(definition).find((item) => item.key === ruleId)?.rule;
  const declaration = rule?.declarations[property];
  if (!declaration || !selectedValueIsAllowed(value, declaration, tokenRegistry)) return {
    success: false,
    diagnostics: [{ code: declaration?.control.kind === "length" ? "preferences.length" : "preferences.value", message: declaration?.control.kind === "length" ? `${definition.id}/${ruleId}/${property} is not a safe reviewed CSS length.` : `${definition.id}/${ruleId}/${property} is not an authored option.`, repair: declaration?.control.kind === "length" ? `Enter ${declaration.control.allowNegative ? "a signed" : "a nonnegative"} finite number with a reviewed CSS length unit, unitless 0${declaration.control.keywords ? `, or ${declaration.control.keywords.join("/")}` : ""}; functions and percentages are not allowed.` : "Choose an exact listed value.", channels: ["preview", "css", "context"], elementId: definition.id, ruleId, property }],
  };
  const next = cloneStore(current);
  const entry = next.entries[definition.id] ?? { version: definition.version, rules: {} };
  const values = entry.rules[ruleId] ?? {};
  if (differsFromStarter(definition, ruleId, property, value)) values[property] = value;
  else delete values[property];
  if (Object.keys(values).length) entry.rules[ruleId] = values;
  else delete entry.rules[ruleId];
  if (Object.keys(entry.rules).length) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return { success: true, store: next };
};

/** Replace one complete rule candidate. Validation finishes before the store is cloned or changed. */
export const nextRuleSelections = (
  current: ElementOverrideStore,
  definition: ElementDefinition,
  ruleId: string,
  candidate: Readonly<Record<string, SelectedValue>>,
  tokenRegistry?: TokenRegistry,
): { success: true; store: ElementOverrideStore } | { success: false; diagnostics: readonly Diagnostic[] } => {
  const rule = authoredRules(definition).find((item) => item.key === ruleId)?.rule;
  if (!rule) return {
    success: false,
    diagnostics: [{ code: "preferences.rule", message: `${definition.id}/${ruleId} is not an authored rule.`, repair: "Choose a current listed rule.", channels: ["preview", "css", "context"], elementId: definition.id, ruleId }],
  };

  const diagnostics: Diagnostic[] = [];
  const normalized: Record<string, SelectedValue> = {};
  for (const property of Object.keys(candidate)) {
    if (!rule.declarations[property]) diagnostics.push({
      code: "preferences.property",
      message: `${definition.id}/${ruleId}/${property} is not an authored property.`,
      repair: "Remove it and use only listed properties.",
      channels: ["preview", "css", "context"],
      elementId: definition.id,
      ruleId,
      property,
    });
  }
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    const value = candidate[property] ?? (declaration.allowOmit ? { kind: "omit" as const } : undefined);
    if (!value) {
      diagnostics.push({
        code: "preferences.missing",
        message: `${definition.id}/${ruleId}/${property} is required.`,
        repair: "Add the missing listed property and value.",
        channels: ["preview", "css", "context"],
        elementId: definition.id,
        ruleId,
        property,
      });
    } else if (!selectedValueIsAllowed(value, declaration, tokenRegistry)) {
      diagnostics.push({
        code: declaration.control.kind === "length" ? "preferences.length" : "preferences.value",
        message: `${definition.id}/${ruleId}/${property} is not a safe reviewed value.`,
        repair: "Choose a current listed value.",
        channels: ["preview", "css", "context"],
        elementId: definition.id,
        ruleId,
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
    .filter(([property, value]) => differsFromStarter(definition, ruleId, property, value)));
  if (Object.keys(differences).length) entry.rules[ruleId] = differences;
  else delete entry.rules[ruleId];
  if (Object.keys(entry.rules).length) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return { success: true, store: next };
};

/** Store authored source bytes only when their normalized declarations differ from Starter. */
export const nextRuleDeclarationSource = (
  current: ElementOverrideStore,
  definition: ElementDefinition,
  ruleId: string,
  source: string,
  starterSource: string,
): ElementOverrideStore => {
  const next = cloneStore(current);
  const entry = next.entries[definition.id] ?? { version: definition.version, rules: {} };
  const normalized = (value: string) => {
    const parsed = parseCssDeclarationList(value);
    return parsed.success ? parsed.source : value;
  };
  if (normalized(source) === normalized(starterSource)) delete entry.css?.[ruleId];
  else (entry.css ??= {})[ruleId] = source;
  if (entry.css && !Object.keys(entry.css).length) delete entry.css;
  if (Object.keys(entry.rules).length || entry.css) next.entries[definition.id] = entry;
  else delete next.entries[definition.id];
  return next;
};

export const saveElementSelection = (definition: ElementDefinition, ruleId: string, property: string, value: SelectedValue, store?: Partial<PreferenceStore>) => {
  const loaded = readElements({ ...store, definitions: store?.definitions?.length ? store.definitions : [definition] });
  const next = nextElementSelection(loaded.store, definition, ruleId, property, value, store?.tokenRegistry);
  return next.success ? writeElements(next.store, store) : { ok: false as const, diagnostics: next.diagnostics };
};
export const saveElementDiffs = (diffs: ElementOverrideStore, store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  const validated = migrateStoredOverrides(diffs, resolved?.definitions ?? [], resolved?.tokenRegistry);
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
export const resetIntentGroup = (groupId: string, definitions: readonly ElementDefinition[] = [], store?: Partial<PreferenceStore>) => {
  const next = cloneStore(readElements({ ...store, definitions }).store);
  for (const definition of definitions.filter((entry) => entry.group === groupId)) delete next.entries[definition.id];
  const written = writeElements(next, store);
  const drafts = structuredClone(loadRuleDrafts({ ...store, definitions }));
  for (const definition of definitions.filter((entry) => entry.group === groupId)) delete drafts.entries[definition.id];
  writeRuleDrafts(drafts, store);
  return written;
};
export const resetFramework = (store?: Partial<PreferenceStore>) => {
  const resolved = resolve(store);
  if (!resolved) return { ok: false as const };
  try {
    resolved.storage.removeItem(ELEMENT_KEY);
    resolved.storage.removeItem(PRIMITIVE_KEY);
    resolved.storage.removeItem(RULE_DRAFT_KEY);
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
};
