import {
  allowedProperties,
  authoredRules,
  deepFreeze,
  elementContentSchema,
  selectedValueIsAllowed,
  treatmentDefinitionSchema,
  type Diagnostic,
  type ElementContent,
  type FlatRule,
  type ParseResult,
  type TokenRegistry,
  type TreatmentDefinition,
} from "../model/index.ts";

export type TreatmentRulePath = string & { readonly __treatmentRulePath: unique symbol };
export type ElementLifecycleState = "Native" | "Draft" | "Active";
export type TreatmentModules = Readonly<Record<string, TreatmentDefinition>>;
export type CatalogGuidance = ElementContent & { id: string };
export type CatalogRule = FlatRule & {
  path: TreatmentRulePath;
  elementId: string;
};
export type CatalogElement = CatalogGuidance & {
  lifecycle: ElementLifecycleState;
  definition?: TreatmentDefinition;
  rules: readonly CatalogRule[];
};
export type ElementCatalog = Readonly<{
  elements: readonly CatalogElement[];
  get(elementId: string): CatalogElement | undefined;
  rule(path: string): CatalogRule | undefined;
  group(groupId: string): readonly CatalogElement[];
}>;

const intentOrder = ["Structure", "Typography", "Lists", "Actions", "Media", "Data", "Forms", "Disclosure"];
const stableVersion = (version: string) => /^([1-9]\d*)\.\d+\.\d+$/.test(version);
const draftVersion = (version: string) => /^0\.(?!0\.0$)\d+\.\d+$/.test(version);
const diagnostic = (
  code: string,
  message: string,
  repair: string,
  elementId?: string,
  ruleId?: string,
  property?: string,
): Diagnostic => ({ code, message, repair, channels: ["preview", "elements", "context"], elementId, ruleId, property });

export const defineTreatment = <T extends TreatmentDefinition>(definition: T): Readonly<T> => deepFreeze(structuredClone(definition)) as Readonly<T>;

const rightmostSubject = (selector: string) => {
  const inside = selector.slice(7, -1);
  const candidates = [...inside.matchAll(/(?:^|[\s>+~])([a-z][a-z0-9-]*)|^([a-z][a-z0-9-]*)/g)]
    .map((match) => match[1] ?? match[2])
    .filter(Boolean);
  return candidates.at(-1);
};

const selectorDiagnostics = (
  element: CatalogGuidance,
  flat: FlatRule,
  path: TreatmentRulePath,
  selectorSubject: string,
): Diagnostic[] => {
  const selector = flat.rule.selector;
  const target = flat.relationship ? "targetElement" in flat.rule ? flat.rule.targetElement : element.id : selectorSubject;
  const invalidEnvelope = !selector.startsWith(":where(")
    || !selector.endsWith(")")
    || /[\r\n{},#]/.test(selector)
    || /(^|[^\\])\.[_a-z]/i.test(selector)
    || /:has\s*\(/i.test(selector);
  const body = selector.slice(7, -1);
  const hasCombinator = /(?:\s|[>+~])/.test(body);
  const result: Diagnostic[] = [];
  if (invalidEnvelope || rightmostSubject(selector) !== target || (!flat.relationship && hasCombinator)) {
    result.push(diagnostic(
      "catalog.selector",
      `Selector '${selector}' violates the low-specificity owner contract for '${path}'.`,
      `Use one top-level :where(...) selector whose rightmost subject is '${target}'; combinators belong only to explicit relationships.`,
      element.id,
      path,
    ));
  }
  if (flat.rule.kind === "state" && flat.rule.state && !selector.includes(`:${flat.rule.state}`) && !(flat.rule.state === "disabled" && selector.includes("[disabled]"))) {
    result.push(diagnostic("catalog.state-selector", `State Rule '${path}' does not select '${flat.rule.state}'.`, "Add the declared native state to the immutable authored selector.", element.id, path));
  }
  return result;
};

const definitionDiagnostics = (
  element: CatalogGuidance,
  definition: TreatmentDefinition,
  tokens: TokenRegistry,
  inventoryIds: ReadonlySet<string>,
): { diagnostics: Diagnostic[]; rules: CatalogRule[] } => {
  const result: Diagnostic[] = [];
  const selectorSubject = definition.selectorSubject ?? element.id;
  if (selectorSubject !== element.id
    && (!element.id.startsWith(`${selectorSubject}-`) || !inventoryIds.has(selectorSubject))) {
    result.push(diagnostic(
      "catalog.selector-subject",
      `Selector subject '${selectorSubject}' does not own virtual Element entry '${element.id}'.`,
      "Use the entry ID itself or an existing inventory Element whose stable ID prefixes the virtual entry.",
      element.id,
    ));
  }
  const flat = authoredRules({ ...element, definition } as never);
  const seen = new Set<string>();
  const rules: CatalogRule[] = [];
  for (const item of flat) {
    const relative = item.relationship ? `${item.relationship.id}/${item.rule.id}` : item.rule.id;
    const path = `${element.id}/${relative}` as TreatmentRulePath;
    if (seen.has(path)) result.push(diagnostic("catalog.duplicate-rule", `Treatment Rule Path '${path}' is duplicated.`, "Use one stable unique Rule Path.", element.id, path));
    seen.add(path);
    result.push(...selectorDiagnostics(element, item, path, selectorSubject));
    for (const [property, declaration] of Object.entries(item.rule.declarations)) {
      if (!(allowedProperties as readonly string[]).includes(property)) {
        result.push(diagnostic("catalog.property", `'${property}' is not Element-owned metadata for '${path}'.`, "Use one generic admitted Element longhand.", element.id, path, property));
      }
      if (!selectedValueIsAllowed(declaration.starter, declaration, tokens)) {
        result.push(diagnostic("catalog.value", `Starter '${path}/${property}' is not backed by its admitted control and effective Token registry.`, "Use an admitted existing Token, safe keyword, length, or explicit omission.", element.id, path, property));
      }
    }
    if (item.relationship) {
      if (!item.relationship.elements.every((id) => inventoryIds.has(id))) {
        result.push(diagnostic("catalog.relationship-element", `Relationship '${path}' references an unknown inventory Element.`, "Use existing participant IDs.", element.id, path));
      }
      if (!item.relationship.elements.includes((item.rule as { targetElement?: string }).targetElement ?? "")) {
        result.push(diagnostic("catalog.relationship-target", `Relationship '${path}' target is not a declared participant.`, "Choose one declared participant as target.", element.id, path));
      }
    }
    rules.push({ ...item, path, elementId: element.id });
  }
  if (!rules.length) result.push(diagnostic("catalog.empty-treatment", `${element.id} Treatment has no meaningful declaration Rule.`, "Author at least one Element-owned declaration or use Native Fallback.", element.id));
  if (element.capability === "non-rendered") result.push(diagnostic("catalog.non-rendered", `${element.id} is non-rendered and cannot own visual Treatment CSS.`, "Use Native Fallback without a Definition.", element.id));
  if (element.capability === "interactive" && stableVersion(element.version) && !rules.some((item) => item.rule.kind === "state" && item.rule.state === "focus-visible")) {
    result.push(diagnostic("catalog.focus", `${element.id} Active interactive Treatment lacks an authored focus-visible Rule.`, "Preserve native focus or author a safe visible focus Treatment with evidence.", element.id));
  }
  const references = new Set(rules.map((item) => item.path.slice(element.id.length + 1)));
  for (const specimen of definition.specimens) {
    if (!specimen.demonstrates.every((path) => references.has(path))) {
      result.push(diagnostic("catalog.specimen", `${element.id} specimen '${specimen.id}' references an unknown Rule Path.`, "Use an existing relative Rule Path.", element.id));
    }
  }
  return { diagnostics: result, rules };
};

export const buildElementCatalog = ({
  guidance,
  treatments,
  tokens,
}: {
  guidance: readonly unknown[];
  treatments: TreatmentModules;
  tokens: TokenRegistry;
}): ParseResult<ElementCatalog> => {
  const diagnostics: Diagnostic[] = [];
  const parsedGuidance: CatalogGuidance[] = [];
  const seen = new Set<string>();
  for (const raw of guidance) {
    const id = raw && typeof raw === "object" && "id" in raw && typeof raw.id === "string" ? raw.id : undefined;
    const source = raw && typeof raw === "object" ? Object.fromEntries(Object.entries(raw).filter(([key]) => key !== "id")) : raw;
    const parsed = elementContentSchema.safeParse(source);
    if (!id || !parsed.success) {
      diagnostics.push(diagnostic("catalog.guidance", `Element Guidance '${id ?? "unknown"}' is invalid.`, parsed.success ? "Add one stable Element ID." : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), id));
      continue;
    }
    if (seen.has(id)) diagnostics.push(diagnostic("catalog.duplicate-element", `Element '${id}' appears more than once.`, "Keep exactly one Guidance entry per inventory ID.", id));
    seen.add(id);
    parsedGuidance.push({ id, ...parsed.data });
  }
  for (const id of Object.keys(treatments)) if (!seen.has(id)) diagnostics.push(diagnostic("catalog.orphan-treatment", `Treatment '${id}' has no Element Guidance entry.`, "Add matching Guidance or remove the orphaned Treatment.", id));
  const inventoryIds = new Set(parsedGuidance.map((entry) => entry.id));
  const elements: CatalogElement[] = [];
  const ruleMap = new Map<string, CatalogRule>();
  for (const entry of parsedGuidance) {
    const rawDefinition = treatments[entry.id];
    const lifecycle: ElementLifecycleState = entry.version === "0.0.0" ? "Native" : draftVersion(entry.version) ? "Draft" : "Active";
    if (lifecycle === "Native" && rawDefinition) diagnostics.push(diagnostic("catalog.native-definition", `${entry.id} is Native 0.0.0 but has a Treatment Definition.`, "Remove the Definition or assign a reviewed non-Native Treatment Version.", entry.id));
    if (lifecycle !== "Native" && !rawDefinition) diagnostics.push(diagnostic("catalog.missing-treatment", `${entry.id} ${entry.version} requires exactly one Treatment Definition.`, "Add one intent-module Definition or return the entry to 0.0.0.", entry.id));
    if (lifecycle === "Active" && (!stableVersion(entry.version) || !entry.activationEvidence)) {
      diagnostics.push(diagnostic("catalog.activation", `${entry.id} stable Treatment lacks complete Activation evidence.`, "Complete every source-controlled hard gate before assigning a stable version.", entry.id));
    }
    let definition: TreatmentDefinition | undefined;
    let rules: CatalogRule[] = [];
    if (rawDefinition) {
      const parsed = treatmentDefinitionSchema.safeParse(rawDefinition);
      if (!parsed.success) diagnostics.push(diagnostic("catalog.definition", `${entry.id} Treatment Definition is invalid.`, parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), entry.id));
      else {
        definition = parsed.data;
        const validated = definitionDiagnostics(entry, definition, tokens, inventoryIds);
        diagnostics.push(...validated.diagnostics);
        rules = validated.rules;
        for (const rule of rules) ruleMap.set(rule.path, rule);
      }
    }
    elements.push({ ...entry, lifecycle, definition, rules });
  }
  if (diagnostics.length) return { success: false, diagnostics: deepFreeze(diagnostics) };
  const ordered = elements.sort((a, b) => intentOrder.indexOf(a.group) - intentOrder.indexOf(b.group) || a.order - b.order || a.id.localeCompare(b.id));
  const byId = new Map(ordered.map((element) => [element.id, element]));
  const catalog: ElementCatalog = {
    elements: ordered,
    get: (elementId) => byId.get(elementId),
    rule: (path) => ruleMap.get(path),
    group: (groupId) => ordered.filter((element) => element.group === groupId),
  };
  return { success: true, data: deepFreeze(catalog) as ElementCatalog, diagnostics: [] };
};
