import { z } from "zod";
import { parseCssDeclarationList } from "../css-declarations/index.ts";

export const tokenFamilies = ["semantic", "color", "typography", "spacing", "radius"] as const;
export const allowedProperties = [
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "border-color",
  "border-style",
  "border-width",
  "border-radius",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "outline-color",
  "outline-width",
  "outline-style",
  "outline-offset",
  "padding-block-start",
  "padding-block-end",
  "padding-inline-start",
  "padding-inline-end",
  "margin-block-start",
  "margin-block-end",
  "margin-inline-start",
  "margin-inline-end",
  "text-decoration-line",
  "text-decoration-style",
  "text-underline-offset",
  "max-inline-size",
  "min-block-size",
  "white-space",
  "overflow-x",
  "overflow-wrap",
] as const;
export const ruleKinds = ["base", "state", "variant"] as const;
export const states = ["hover", "focus-visible", "active", "disabled"] as const;
export const baselineStatuses = ["widely-available", "newly-available", "limited-availability", "unknown/not-applicable"] as const;
export const capabilityProfiles = ["text", "interactive", "structure", "list", "form-control", "form-option", "media", "data", "disclosure", "dialog", "non-rendered"] as const;

export type OutputChannelName = "preview" | "tokens" | "elements" | "context";
export type TokenFamily = (typeof tokenFamilies)[number];
export type TokenRegistry = ReadonlyMap<string, "color" | "dimension" | "string">;
export type TokenValue = { kind: "token"; family: TokenFamily; name: string };
export type ChoiceValue = { kind: "choice"; value: string };
export type LengthValue = { kind: "length"; value: string };
export type OmitValue = { kind: "omit" };
export type SelectedValue = TokenValue | ChoiceValue | LengthValue | OmitValue;
export type Diagnostic = {
  code: string;
  message: string;
  repair: string;
  channels: readonly OutputChannelName[];
  elementId?: string;
  ruleId?: string;
  property?: string;
  check?: string;
  severity?: "error" | "warning";
  portability?: "portable" | "app-only";
};
export type ParseResult<T> =
  | { success: true; data: Readonly<T>; diagnostics: readonly Diagnostic[] }
  | { success: false; diagnostics: readonly Diagnostic[] };
export type ElementOverrideEntry = { version: string; rules: Record<string, Record<string, SelectedValue>>; css?: Record<string, string> };
export type ElementOverrideStore = { schemaVersion: 2; entries: Record<string, ElementOverrideEntry> };
export type PrimitiveOverrideStore = { schemaVersion: 1; values: Record<string, string> };
export type MigrationResult = { store: ElementOverrideStore; diagnostics: readonly Diagnostic[] };

const stableId = z.string().regex(/^[a-z][a-z0-9-]*$/);
const tokenName = z.string().regex(/^(?:[a-z]|[0-9]+[a-z])[a-z0-9-]*(?:\.[a-z0-9-]+)*$/);
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const versionParts = (value: string) => {
  const match = semverPattern.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] as const : undefined;
};
const compatibleStoredVersion = (stored: string, current: string) => {
  if (stored === current) return true;
  const from = versionParts(stored);
  const to = versionParts(current);
  if (!from || !to || from[0] === 0 || from[0] !== to[0]) return false;
  return from[1] < to[1] || (from[1] === to[1] && from[2] <= to[2]);
};
const safeChoicePattern = /^(?:underline|none|auto|normal|italic|oblique|pre|pre-wrap|break-word|anywhere|dotted|dashed|solid|double|groove|ridge|inset|outset|[1-9]00|(?:0|1|2)(?:\.\d+)?)$/;
const lineWidthKeywords = ["thin", "medium", "thick"] as const;
const lengthUnits = "(?:px|em|rem|ex|rex|cap|rcap|ch|rch|ic|ric|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|svi|svb|svmin|svmax|lvw|lvh|lvi|lvb|lvmin|lvmax|dvw|dvh|dvi|dvb|dvmin|dvmax|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|q|in|pc|pt)";
const unsignedLengthPattern = new RegExp(`^(?:0|(?:\\d+(?:\\.\\d+)?|\\.\\d+)${lengthUnits})$`, "i");
const signedLengthPattern = new RegExp(`^(?:0|-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)${lengthUnits})$`, "i");

const tokenOptionSchema = z.object({ family: z.enum(tokenFamilies), name: tokenName }).strict();
const tokenValueSchema = tokenOptionSchema.extend({ kind: z.literal("token") }).strict();
const choiceValueSchema = z.object({ kind: z.literal("choice"), value: z.string().min(1).max(80) }).strict();
const lengthValueSchema = z.object({ kind: z.literal("length"), value: z.string().min(1).max(80) }).strict();
const omitValueSchema = z.object({ kind: z.literal("omit") }).strict();
export const selectedValueSchema = z.discriminatedUnion("kind", [tokenValueSchema, choiceValueSchema, lengthValueSchema, omitValueSchema]);
const controlSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("token"), families: z.array(z.enum(tokenFamilies)).min(1), options: z.array(tokenOptionSchema).min(1) }).strict(),
  z.object({
    kind: z.literal("choice"),
    options: z.array(z.object({ value: z.string().min(1).max(80), label: z.string().min(1) }).strict()).min(1),
  }).strict(),
  z.object({ kind: z.literal("length"), allowNegative: z.literal(true).optional(), keywords: z.array(z.enum(lineWidthKeywords)).min(1).optional() }).strict(),
]);
const declarationSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  control: controlSchema,
  starter: selectedValueSchema,
  allowOmit: z.literal(true).optional(),
}).strict();
const ruleSchema = z.object({
  id: stableId,
  kind: z.enum(ruleKinds),
  selector: z.string().min(1),
  state: z.enum(states).optional(),
  variant: stableId.optional(),
  when: z.string().min(1).optional(),
  declarations: z.record(z.string(), declarationSchema).refine((value) => Object.keys(value).length > 0),
}).strict();
const relationshipRuleSchema = ruleSchema.extend({ targetElement: stableId }).strict();
const relationshipSchema = z.object({
  id: stableId,
  elements: z.array(stableId).min(2),
  when: z.string().min(1),
  semanticHtml: z.string().min(1),
  rules: z.array(relationshipRuleSchema).min(1),
}).strict();
export const treatmentDefinitionSchema = z.object({
  schemaVersion: z.literal(1),
  selectorSubject: stableId.optional(),
  rules: z.array(ruleSchema).min(1),
  relationships: z.array(relationshipSchema).optional(),
  contrastChecks: z.array(z.object({
    id: stableId,
    kind: z.enum(["normal-text", "large-text", "non-text-ui"]),
    subject: z.object({ ruleId: z.string().min(1), property: z.enum(["color", "background-color", "border-color", "outline-color"]), editable: z.boolean() }).strict(),
    comparison: z.object({ ruleId: z.string().min(1), property: z.enum(["color", "background-color", "border-color", "outline-color"]), editable: z.boolean() }).strict(),
  }).strict()).optional(),
  specimens: z.array(z.object({
    id: stableId,
    label: z.string().min(1),
    semanticHtml: z.string().min(1),
    demonstrates: z.array(z.string().min(1)).min(1),
    relationship: stableId.optional(),
  }).strict()).min(1),
}).strict();

const baselineSchema = z.object({
  status: z.enum(baselineStatuses),
  source: z.literal("mdn"),
  sourceUrl: z.string().url(),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().min(1).optional(),
}).strict().superRefine((baseline, context) => {
  if (baseline.status === "unknown/not-applicable" && !baseline.note) {
    context.addIssue({ code: "custom", path: ["note"], message: "Unknown MDN Baseline entries require a note." });
  }
});

const activationCheckSchema = z.object({
  status: z.literal("pass"),
  reference: z.string().min(1),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict();

export const activationEvidenceSchema = z.object({
  definition: activationCheckSchema,
  baseline: activationCheckSchema,
  nativeBehavior: activationCheckSchema,
  keyboard: activationCheckSchema,
  focus: activationCheckSchema,
  parity: activationCheckSchema,
}).strict();

const elementContentObjectSchema = z.object({
  title: z.string().min(1),
  group: z.enum(["Structure", "Typography", "Lists", "Actions", "Media", "Data", "Forms", "Disclosure"]),
  tags: z.array(z.string()).min(1),
  capability: z.enum(capabilityProfiles),
  kind: z.enum(["type", "actions", "form", "table", "figure", "disclosure", "dialog", "native"]),
  purpose: z.string().min(1),
  treatment: z.string().min(1),
  contextGuidance: z.string().min(1).optional(),
  use: z.array(z.string()).min(1),
  avoid: z.string().min(1),
  constraints: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  variants: z.array(z.object({ name: stableId, when: z.string().min(1) }).strict()).default([]),
  defaultVariant: stableId.optional(),
  semanticHtml: z.string().default(""),
  activationEvidence: activationEvidenceSchema.optional(),
  version: z.string().regex(semverPattern, "Element Treatment version must be valid SemVer."),
  baseline: baselineSchema,
  deprecated: z.boolean(),
  deprecationReason: z.string().min(1).optional(),
  deprecationReplacement: z.string().min(1).optional(),
  order: z.number().int().positive(),
  sourceUrl: z.string().url(),
}).strict();

type RefinableElement = Pick<z.infer<typeof elementContentObjectSchema>, "activationEvidence" | "baseline" | "deprecated" | "deprecationReason" | "deprecationReplacement" | "version" | "constraints" | "accessibility" | "semanticHtml" | "variants" | "defaultVariant">;
const refineElement = (entry: RefinableElement, context: z.RefinementCtx) => {
  if (entry.deprecated && !entry.deprecationReason) context.addIssue({ code: "custom", path: ["deprecationReason"], message: "Deprecated entries require a reason." });
  if (entry.deprecated && !entry.deprecationReplacement) context.addIssue({ code: "custom", path: ["deprecationReplacement"], message: "Deprecated entries require a replacement." });
  if (/^[1-9]\d*\./.test(entry.version)) {
    if (entry.baseline.status !== "widely-available") context.addIssue({ code: "custom", path: ["baseline", "status"], message: "Stable Treatments require MDN Baseline Widely available." });
    if (!entry.activationEvidence) context.addIssue({ code: "custom", path: ["activationEvidence"], message: "Stable Treatments require complete source-controlled Activation evidence." });
    if (!entry.constraints.length) context.addIssue({ code: "custom", path: ["constraints"], message: "Stable entries require content constraints." });
    if (!entry.accessibility.length) context.addIssue({ code: "custom", path: ["accessibility"], message: "Stable entries require accessibility behavior." });
    if (!entry.semanticHtml.trim()) context.addIssue({ code: "custom", path: ["semanticHtml"], message: "Stable entries require semantic HTML." });
  }
  if (entry.version === "0.0.0" && entry.activationEvidence) context.addIssue({ code: "custom", path: ["activationEvidence"], message: "Native entries cannot carry Activation evidence." });
  if (entry.variants.length && !entry.defaultVariant) context.addIssue({ code: "custom", path: ["defaultVariant"], message: "Entries with variants require a defaultVariant." });
};

export const elementContentSchema = elementContentObjectSchema.superRefine(refineElement);

export const elementDefinitionSchema = elementContentObjectSchema.extend({
  id: stableId,
  definition: treatmentDefinitionSchema,
}).strict().superRefine(refineElement);

export type ElementContent = z.infer<typeof elementContentSchema>;
export type ElementDefinition = z.output<typeof elementDefinitionSchema>;
export type TreatmentDefinition = z.infer<typeof treatmentDefinitionSchema>;
export type Declaration = z.infer<typeof declarationSchema>;
export type TreatmentRule = z.infer<typeof ruleSchema>;
export type RelationshipRule = z.infer<typeof relationshipRuleSchema>;

const diagnostic = (
  code: string,
  message: string,
  repair: string,
  elementId?: string,
  ruleId?: string,
  property?: string,
  channels: readonly OutputChannelName[] = ["elements", "context"],
): Diagnostic => ({ code, message, repair, channels, elementId, ruleId, property });

const unique = (items: readonly { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;
const rawCss = /[;{}]|!important|\b(url|var|calc|attr)\s*\(|\b(initial|inherit|unset|revert|revert-layer)\b/i;
const valueKey = (value: SelectedValue) => value.kind === "token" ? `token:${value.family}.${value.name}` : value.kind === "choice" ? `choice:${value.value}` : value.kind === "length" ? `length:${value.value}` : "omit";

export const selectedValueIsAllowed = (value: unknown, declaration: Declaration, registry?: TokenRegistry): value is SelectedValue => {
  const parsed = selectedValueSchema.safeParse(value);
  if (!parsed.success) return false;
  const selected = parsed.data as SelectedValue;
  if (selected.kind === "omit") return declaration.allowOmit === true;
  if (selected.kind === "token") {
    return declaration.control.kind === "token"
      && declaration.control.families.includes(selected.family)
      && (!registry || registry.has(`${selected.family}.${selected.name}`));
  }
  if (selected.kind === "length") return declaration.control.kind === "length"
    && ((declaration.control.allowNegative ? signedLengthPattern : unsignedLengthPattern).test(selected.value)
      || declaration.control.keywords?.includes(selected.value as typeof lineWidthKeywords[number]) === true)
    && !rawCss.test(selected.value);
  return declaration.control.kind === "choice"
    && declaration.control.options.some((option) => option.value === selected.value)
    && safeChoicePattern.test(selected.value)
    && !rawCss.test(selected.value);
};

export type FlatRule = {
  key: string;
  rule: TreatmentRule | RelationshipRule;
  relationship?: NonNullable<TreatmentDefinition["relationships"]>[number];
};

const tokenTypeForProperty = (property: string): "color" | "dimension" | "string" => {
  if (["color", "background-color", "border-color", "border-inline-start-color", "border-block-start-color", "outline-color"].includes(property)) return "color";
  if (property === "font-family") return "string";
  return "dimension";
};

export const authoredRules = (definition: ElementDefinition): readonly FlatRule[] => [
  ...definition.definition.rules.map((rule) => ({ key: rule.id, rule })),
  ...(definition.definition.relationships ?? []).flatMap((relationship) => relationship.rules.map((rule) => ({ key: `${relationship.id}/${rule.id}`, rule, relationship }))),
];

export const parseElementDefinition = (input: unknown, tokenRegistry?: TokenRegistry): ParseResult<ElementDefinition> => {
  const parsed = elementDefinitionSchema.safeParse(input);
  const inputId = typeof input === "object" && input && "id" in input && typeof input.id === "string" ? input.id : undefined;
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "definition"}: ${issue.message}`).join("; ");
    return { success: false, diagnostics: [diagnostic("definition.schema", `Authored Treatment Definition does not match the canonical Element schema. ${issues}`, "Repair the authored field reported by the content validator.", inputId)] };
  }
  const value = parsed.data;
  const diagnostics: Diagnostic[] = [];
  const flat = authoredRules(value);
  if (!unique(value.definition.rules) || !unique(value.definition.relationships ?? []) || !unique(value.definition.specimens) || new Set(flat.map((item) => item.key)).size !== flat.length) {
    diagnostics.push(diagnostic("definition.duplicate-id", "Rule, relationship, and specimen IDs must be unique in their authored scope.", "Use stable unique IDs.", value.id));
  }
  for (const item of flat) {
    for (const [property, declaration] of Object.entries(item.rule.declarations)) {
      if (!(allowedProperties as readonly string[]).includes(property)) {
        diagnostics.push(diagnostic("definition.property", `Property '${property}' is not admitted Element-owned metadata.`, "Use a safe admitted longhand property.", value.id, item.key, property));
      }
      if (!selectedValueIsAllowed(declaration.starter, declaration, tokenRegistry)) {
        diagnostics.push(diagnostic("definition.token", `Starter for '${item.key}/${property}' references an unavailable or unsafe value.`, "Choose an offered value backed by the effective token registry.", value.id, item.key, property));
      }
      if (tokenRegistry && declaration.control.kind === "token") {
        const expectedType = tokenTypeForProperty(property);
        for (const option of declaration.control.options) {
          const tokenId = `${option.family}.${option.name}`;
          if (tokenRegistry.get(tokenId) !== expectedType) {
            diagnostics.push(diagnostic("definition.token-type", `Token '${tokenId}' cannot be used for '${property}'.`, `Use an existing ${expectedType} Token admitted by this property.`, value.id, item.key, property));
          }
        }
      }
    }
    if (item.relationship) {
      const relationshipRule = item.rule as RelationshipRule;
      if (!item.relationship.elements.includes(value.id) || !item.relationship.elements.includes(relationshipRule.targetElement)) {
        diagnostics.push(diagnostic("definition.relationship", "Relationship owner or target is not a declared participant.", "Declare both owner and target in the relationship element list.", value.id, item.key));
      }
    }
  }
  for (const rule of value.definition.rules.filter((item) => item.kind === "variant")) {
    if (!value.variants.some((variant) => variant.name === rule.variant) || !rule.when) {
      diagnostics.push(diagnostic("definition.variant", "Variant rule must name an Element Guidance variant and explain when it applies.", "Use the approved variant name and its contextual when guidance.", value.id, rule.id));
    }
  }
  const references = new Set(flat.map((item) => item.key));
  for (const specimen of value.definition.specimens) {
    if (!specimen.demonstrates.every((reference) => references.has(reference)) || (specimen.relationship && !value.definition.relationships?.some((relationship) => relationship.id === specimen.relationship))) {
      diagnostics.push(diagnostic("definition.specimen", "Specimen references an unknown rule or relationship.", "Reference an authored stable rule path.", value.id));
    }
  }
  return diagnostics.length ? { success: false, diagnostics } : { success: true, data: deepFreeze(value), diagnostics: [] };
};

export const parsePrimitiveOverrides = (input: unknown): ParseResult<PrimitiveOverrideStore> => {
  const primitiveId = z.string().regex(/^(?:semantic|color|typography|spacing|radius|variable)\.[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)*$/);
  const parsed = z.object({
    schemaVersion: z.literal(1),
    values: z.record(primitiveId, z.string().min(1).max(240).refine((value) => !/[;{}\r\n]/.test(value))),
  }).strict().safeParse(input);
  return parsed.success
    ? { success: true, data: deepFreeze(parsed.data), diagnostics: [] }
    : { success: false, diagnostics: [diagnostic("primitive-store.invalid", "Primitive override store is invalid.", "Reset invalid Primitive preferences.", undefined, undefined, undefined, ["preview", "tokens", "elements", "context"])] };
};

const rawOverrideSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  entries: z.record(z.string(), z.object({
    version: z.string(),
    rules: z.record(z.string(), z.record(z.string(), z.unknown())),
    css: z.record(z.string(), z.string().max(20000)).optional(),
  }).strict()),
}).strict();

/** Validate for compilation. Any invalid path fails the input; no partial CSS is returned. */
export const parseElementOverrides = (input: unknown, definitions: readonly ElementDefinition[] = [], tokenRegistry?: TokenRegistry): ParseResult<ElementOverrideStore> => {
  const migrated = migrateStoredOverrides(input, definitions, tokenRegistry);
  return migrated.diagnostics.length
    ? { success: false, diagnostics: migrated.diagnostics }
    : { success: true, data: deepFreeze(migrated.store), diagnostics: [] };
};

/** Quarantine invalid paths while retaining unrelated, still-valid user differences. */
export const migrateStoredOverrides = (input: unknown, definitions: readonly ElementDefinition[] = [], tokenRegistry?: TokenRegistry): MigrationResult => {
  if (input == null) return { store: { schemaVersion: 2, entries: {} }, diagnostics: [] };
  const parsed = rawOverrideSchema.safeParse(input);
  if (!parsed.success) return {
    store: { schemaVersion: 2, entries: {} },
    diagnostics: [diagnostic("element-store.invalid", "Saved Element preferences have an invalid store shape.", "Reset Element preferences; no saved CSS was applied.")],
  };
  const store: ElementOverrideStore = { schemaVersion: 2, entries: {} };
  const diagnostics: Diagnostic[] = [];
  for (const [elementId, rawEntry] of Object.entries(parsed.data.entries)) {
    const definition = definitions.find((item) => item.id === elementId);
    if (!definition) {
      diagnostics.push(diagnostic("element-store.element", `Saved Element '${elementId}' is unknown.`, "Remove the quarantined Element preference.", elementId));
      continue;
    }
    if (!compatibleStoredVersion(rawEntry.version, definition.version)) {
      diagnostics.push(diagnostic("element-store.version", `Saved ${elementId} preference targets Treatment ${rawEntry.version}, not ${definition.version}.`, "Review or reset this Element before export.", elementId));
      continue;
    }
    const entry: ElementOverrideEntry = { version: definition.version, rules: {} };
    const rulesByKey = new Map(authoredRules(definition).map((item) => [`${definition.id}/${item.key}`, item]));
    for (const [storedRuleId, rawValues] of Object.entries(rawEntry.rules)) {
      const rulePath = parsed.data.schemaVersion === 1 ? `${elementId}/${storedRuleId}` : storedRuleId;
      const authored = rulesByKey.get(rulePath);
      const rule = authored?.rule;
      if (!rule) {
        diagnostics.push(diagnostic("element-store.rule", `Saved Treatment Rule Path '${rulePath}' is unknown.`, "Reset the affected Element preference.", elementId, rulePath));
        continue;
      }
      const values: Record<string, SelectedValue> = {};
      for (const [property, rawValue] of Object.entries(rawValues)) {
        const declaration = rule.declarations[property];
        if (!declaration || !selectedValueIsAllowed(rawValue, declaration, tokenRegistry)) {
          diagnostics.push(diagnostic("element-store.value", `Saved ${rulePath}/${property} is no longer an offered value.`, "Choose a listed value or reset this control.", elementId, rulePath, property));
          continue;
        }
        if (differsFromStarter(definition, authored.key, property, rawValue)) values[property] = rawValue;
      }
      if (Object.keys(values).length) entry.rules[rulePath] = values;
    }
    for (const [storedRuleId, source] of Object.entries(rawEntry.css ?? {})) {
      const rulePath = parsed.data.schemaVersion === 1 ? `${elementId}/${storedRuleId}` : storedRuleId;
      if (!rulesByKey.has(rulePath)) {
        diagnostics.push(diagnostic("element-store.rule", `Saved CSS Treatment Rule Path '${rulePath}' is unknown.`, "Reset the affected Element preference.", elementId, rulePath));
        continue;
      }
      const parsedSource = parseCssDeclarationList(source);
      if (!parsedSource.success) {
        diagnostics.push(diagnostic("element-store.css", `Saved CSS for ${rulePath} is invalid or unsafe.`, "Fix or reset the affected declaration draft.", elementId, rulePath));
        continue;
      }
      // Validate the declaration list, but retain the authored bytes. Compiler
      // output is normalized separately; editor persistence must never rewrite
      // a valid source string during a reload.
      (entry.css ??= {})[rulePath] = source;
    }
    if (Object.keys(entry.rules).length) store.entries[elementId] = entry;
    else if (entry.css && Object.keys(entry.css).length) store.entries[elementId] = entry;
  }
  return { store: deepFreeze(store), diagnostics: deepFreeze(diagnostics) };
};

export const ruleFor = (definition: ElementDefinition, ruleId: string) => authoredRules(definition).find((item) => item.key === ruleId)?.rule;
export const starterFor = (definition: ElementDefinition, ruleId: string, property: string) => ruleFor(definition, ruleId)?.declarations[property]?.starter;
export const differsFromStarter = (definition: ElementDefinition, ruleId: string, property: string, value: SelectedValue) => JSON.stringify(starterFor(definition, ruleId, property)) !== JSON.stringify(value);
export const valueToCss = (value: SelectedValue, tokenVariables?: ReadonlyMap<string, string>) => {
  if (value.kind === "omit") return null;
  if (value.kind === "choice") return safeChoicePattern.test(value.value) && !rawCss.test(value.value) ? value.value : null;
  if (value.kind === "length") return (signedLengthPattern.test(value.value) || lineWidthKeywords.includes(value.value as typeof lineWidthKeywords[number])) && !rawCss.test(value.value) ? value.value : null;
  const id = `${value.family}.${value.name}`;
  const cssName = tokenVariables?.get(id) ?? `--${value.family}-${value.name}`;
  return /^--[a-z0-9-]+$/.test(cssName) ? `var(${cssName})` : null;
};

export const selectedValueKey = valueKey;
export const matchingSerializedSelectedValue = (options: readonly string[], selected: unknown): string | undefined => {
  const parsedSelected = selectedValueSchema.safeParse(selected);
  if (!parsedSelected.success) return undefined;
  const selectedKey = valueKey(parsedSelected.data as SelectedValue);
  return options.find((serialized) => {
    try {
      const parsedOption = selectedValueSchema.safeParse(JSON.parse(serialized));
      return parsedOption.success && valueKey(parsedOption.data as SelectedValue) === selectedKey;
    } catch {
      return false;
    }
  });
};

export const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
};
