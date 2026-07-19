import { z } from "zod";
import { parseCssDeclarationList } from "../css-declarations/index.ts";

export const tokenFamilies = ["semantic", "color", "typography", "spacing", "radius"] as const;
export const allowedProperties = [
  "color",
  "background-color",
  "font-size",
  "border-color",
  "border-style",
  "border-width",
  "border-radius",
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
] as const;
export const ruleKinds = ["base", "state", "variant"] as const;
export const states = ["hover", "focus-visible", "active", "disabled"] as const;
export const baselineStatuses = ["widely-available", "newly-available", "limited-availability", "unknown/not-applicable"] as const;

export type OutputChannelName = "preview" | "css" | "dtcg" | "context";
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
};
export type ParseResult<T> =
  | { success: true; data: Readonly<T>; diagnostics: readonly Diagnostic[] }
  | { success: false; diagnostics: readonly Diagnostic[] };
export type ElementOverrideEntry = { version: string; rules: Record<string, Record<string, SelectedValue>>; css?: Record<string, string> };
export type ElementOverrideStore = { schemaVersion: 1; entries: Record<string, ElementOverrideEntry> };
export type PrimitiveOverrideStore = { schemaVersion: 1; values: Record<string, string> };
export type MigrationResult = { store: ElementOverrideStore; diagnostics: readonly Diagnostic[] };

const stableId = z.string().regex(/^[a-z][a-z0-9-]*$/);
const tokenName = z.string().regex(/^(?:[a-z]|[0-9]+[a-z])[a-z0-9-]*(?:\.[a-z0-9-]+)*$/);
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const safeChoicePattern = /^(?:underline|none|auto|dotted|dashed|solid|double|groove|ridge|inset|outset)$/;
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
  rules: z.array(ruleSchema).min(1),
  relationships: z.array(relationshipSchema).optional(),
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

const elementContentObjectSchema = z.object({
  title: z.string().min(1),
  group: z.enum(["Structure", "Typography", "Lists", "Actions", "Media", "Data", "Forms", "Disclosure"]),
  tags: z.array(z.string()).min(1),
  kind: z.enum(["type", "actions", "form", "table", "figure", "disclosure", "dialog", "native"]),
  purpose: z.string().min(1),
  treatment: z.string().min(1),
  use: z.array(z.string()).min(1),
  avoid: z.string().min(1),
  constraints: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  variants: z.array(z.object({ name: stableId, when: z.string().min(1) }).strict()).default([]),
  defaultVariant: stableId.optional(),
  semanticHtml: z.string().default(""),
  treatmentDefinition: treatmentDefinitionSchema.optional(),
  promoted: z.boolean().default(false),
  accessibilityPassed: z.boolean().default(false),
  version: z.string().regex(semverPattern, "Element Treatment version must be valid SemVer."),
  baseline: baselineSchema,
  deprecated: z.boolean(),
  deprecationReason: z.string().min(1).optional(),
  deprecationReplacement: z.string().min(1).optional(),
  order: z.number().int().positive(),
  sourceUrl: z.string().url(),
}).strict();

type RefinableElement = Pick<z.infer<typeof elementContentObjectSchema>, "deprecated" | "deprecationReason" | "deprecationReplacement" | "version" | "constraints" | "accessibility" | "semanticHtml" | "variants" | "defaultVariant">;
const refineElement = (entry: RefinableElement, context: z.RefinementCtx) => {
  if (entry.deprecated && !entry.deprecationReason) context.addIssue({ code: "custom", path: ["deprecationReason"], message: "Deprecated entries require a reason." });
  if (entry.deprecated && !entry.deprecationReplacement) context.addIssue({ code: "custom", path: ["deprecationReplacement"], message: "Deprecated entries require a replacement." });
  if (/^[1-9]\d*\./.test(entry.version)) {
    if (!entry.constraints.length) context.addIssue({ code: "custom", path: ["constraints"], message: "Stable entries require content constraints." });
    if (!entry.accessibility.length) context.addIssue({ code: "custom", path: ["accessibility"], message: "Stable entries require accessibility behavior." });
    if (!entry.semanticHtml.trim()) context.addIssue({ code: "custom", path: ["semanticHtml"], message: "Stable entries require semantic HTML." });
  }
  if (entry.variants.length && !entry.defaultVariant) context.addIssue({ code: "custom", path: ["defaultVariant"], message: "Entries with variants require a defaultVariant." });
};

export const elementContentSchema = elementContentObjectSchema.superRefine(refineElement);

export const elementDefinitionSchema = elementContentObjectSchema.omit({ treatmentDefinition: true }).extend({
  id: z.enum(["a", "button"]),
  definition: treatmentDefinitionSchema,
  group: z.literal("Actions"),
}).strict().superRefine(refineElement);

export type ElementContent = z.infer<typeof elementContentSchema>;
export type ElementDefinition = z.output<typeof elementDefinitionSchema>;
export type TreatmentDefinition = z.infer<typeof treatmentDefinitionSchema>;
export type Declaration = z.infer<typeof declarationSchema>;
export type TreatmentRule = z.infer<typeof ruleSchema>;
export type RelationshipRule = z.infer<typeof relationshipRuleSchema>;

type ReviewedRule = {
  selector: string;
  kind: "base" | "state" | "variant";
  state?: (typeof states)[number];
  variant?: string;
  properties: Readonly<Record<string, readonly string[]>>;
  tokenFamilies?: Readonly<Record<string, readonly TokenFamily[]>>;
  omissions?: readonly string[];
};

/** Exact reviewed Actions contract. Keys for relationship rules use relationship/rule IDs. */
export const actionTreatmentAllowlists = {
  a: {
    base: { selector: ":where(a[href])", kind: "base", properties: { color: ["token:semantic.text"], "text-decoration-line": ["choice:underline", "choice:none"] }, tokenFamilies: { color: ["semantic", "color"] } },
    hover: { selector: ":where(a[href]:hover)", kind: "state", state: "hover", properties: { color: ["token:semantic.text"] }, tokenFamilies: { color: ["semantic", "color"] } },
    "focus-visible": { selector: ":where(a[href]:focus-visible)", kind: "state", state: "focus-visible", properties: { "outline-color": ["token:semantic.focus"], "outline-style": ["choice:auto", "choice:dotted", "choice:dashed", "choice:solid", "choice:double", "choice:groove", "choice:ridge", "choice:inset", "choice:outset"], "outline-width": ["length:nonnegative:thin,medium,thick"], "outline-offset": ["length:signed"] }, tokenFamilies: { "outline-color": ["semantic", "color"] } },
    active: { selector: ":where(a[href]:active)", kind: "state", state: "active", properties: { color: ["token:semantic.text"] }, tokenFamilies: { color: ["semantic", "color"] } },
    quiet: { selector: ':where(a[href][data-variant="quiet"])', kind: "variant", variant: "quiet", properties: { "text-decoration-line": ["choice:none"] } },
    "link-in-navigation/current": { selector: ':where(nav a[aria-current="page"])', kind: "base", properties: { "text-decoration-line": ["choice:underline"] } },
  },
  button: {
    base: { selector: ":where(button:not([disabled]))", kind: "base", properties: { color: ["token:semantic.surface", "token:semantic.text"], "background-color": ["token:semantic.action", "token:semantic.primary"], "font-size": ["token:typography.m"], "border-color": ["token:semantic.border"], "border-style": ["choice:solid", "choice:dashed", "choice:dotted", "choice:double", "choice:groove", "choice:ridge", "choice:inset", "choice:outset"], "border-width": ["length:nonnegative:thin,medium,thick"], "border-radius": ["token:radius.m"], "margin-block-start": ["token:spacing.s"], "margin-block-end": ["token:spacing.s"], "margin-inline-start": ["token:spacing.s"], "margin-inline-end": ["token:spacing.s"], "padding-block-start": ["token:spacing.3xs"], "padding-block-end": ["token:spacing.3xs"], "padding-inline-start": ["token:spacing.s"], "padding-inline-end": ["token:spacing.s"] }, tokenFamilies: { color: ["semantic", "color"], "background-color": ["semantic", "color"], "font-size": ["typography"], "border-color": ["semantic", "color"], "border-radius": ["radius"], "margin-block-start": ["spacing"], "margin-block-end": ["spacing"], "margin-inline-start": ["spacing"], "margin-inline-end": ["spacing"], "padding-block-start": ["spacing"], "padding-block-end": ["spacing"], "padding-inline-start": ["spacing"], "padding-inline-end": ["spacing"] }, omissions: ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"] },
    hover: { selector: ":where(button:not([disabled]):hover)", kind: "state", state: "hover", properties: { "background-color": ["token:semantic.primary", "token:semantic.action"] }, tokenFamilies: { "background-color": ["semantic", "color"] } },
    "focus-visible": { selector: ":where(button:focus-visible)", kind: "state", state: "focus-visible", properties: { "outline-color": ["token:semantic.focus"], "outline-style": ["choice:auto", "choice:dotted", "choice:dashed", "choice:solid", "choice:double", "choice:groove", "choice:ridge", "choice:inset", "choice:outset"], "outline-width": ["length:nonnegative:thin,medium,thick"], "outline-offset": ["length:signed"] }, tokenFamilies: { "outline-color": ["semantic", "color"] } },
    active: { selector: ":where(button:not([disabled]):active)", kind: "state", state: "active", properties: { "background-color": ["token:semantic.action"] }, tokenFamilies: { "background-color": ["semantic", "color"] } },
    disabled: { selector: ":where(button:disabled)", kind: "state", state: "disabled", properties: { color: ["token:semantic.text"] }, tokenFamilies: { color: ["semantic", "color"] } },
    secondary: { selector: ':where(button[data-variant="secondary"])', kind: "variant", variant: "secondary", properties: { color: ["token:semantic.text"], "background-color": ["token:semantic.surface"] }, tokenFamilies: { color: ["semantic", "color"], "background-color": ["semantic", "color"] } },
  },
} as const satisfies Readonly<Record<"a" | "button", Readonly<Record<string, ReviewedRule>>>>;

const diagnostic = (
  code: string,
  message: string,
  repair: string,
  elementId?: string,
  ruleId?: string,
  property?: string,
  channels: readonly OutputChannelName[] = ["css", "context"],
): Diagnostic => ({ code, message, repair, channels, elementId, ruleId, property });

const unique = (items: readonly { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;
const rawCss = /[;{}]|!important|\b(url|var|calc|attr)\s*\(|\b(initial|inherit|unset|revert|revert-layer)\b/i;
const valueKey = (value: SelectedValue) => value.kind === "token" ? `token:${value.family}.${value.name}` : value.kind === "choice" ? `choice:${value.value}` : value.kind === "length" ? `length:${value.value}` : "omit";
const optionKeys = (declaration: Declaration) => declaration.control.kind === "token"
  ? declaration.control.options.map((option) => `token:${option.family}.${option.name}`)
  : declaration.control.kind === "choice" ? declaration.control.options.map((option) => `choice:${option.value}`)
  : [`length:${declaration.control.allowNegative ? "signed" : "nonnegative"}${declaration.control.keywords ? `:${declaration.control.keywords.join(",")}` : ""}`];

export const selectedValueIsAllowed = (value: unknown, declaration: Declaration, registry?: TokenRegistry): value is SelectedValue => {
  const parsed = selectedValueSchema.safeParse(value);
  if (!parsed.success) return false;
  const selected = parsed.data as SelectedValue;
  if (selected.kind === "omit") return declaration.allowOmit === true;
  if (selected.kind === "token") {
    const expectedType = selected.family === "semantic" || selected.family === "color" ? "color" : "dimension";
    return declaration.control.kind === "token"
      && declaration.control.families.includes(selected.family)
      && (!registry || (registry.has(`${selected.family}.${selected.name}`)
        && registry.get(`${selected.family}.${selected.name}`) === expectedType));
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

export const authoredRules = (definition: ElementDefinition): readonly FlatRule[] => [
  ...definition.definition.rules.map((rule) => ({ key: rule.id, rule })),
  ...(definition.definition.relationships ?? []).flatMap((relationship) => relationship.rules.map((rule) => ({ key: `${relationship.id}/${rule.id}`, rule, relationship }))),
];

const exactRuleDiagnostic = (definition: ElementDefinition, key: string, rule: TreatmentRule | RelationshipRule): Diagnostic[] => {
  const approved = (actionTreatmentAllowlists[definition.id] as Readonly<Record<string, ReviewedRule>>)[key];
  if (!approved) return [diagnostic("definition.rule", `Rule '${key}' is not reviewed for ${definition.id}.`, "Remove it or review it through an Actions Promotion decision.", definition.id, key)];
  const result: Diagnostic[] = [];
  if (rule.selector !== approved.selector || rule.kind !== approved.kind || rule.state !== approved.state || rule.variant !== approved.variant) {
    result.push(diagnostic("definition.selector", `Selector or state contract for '${key}' differs from the reviewed ${definition.id} allowlist.`, `Use exact selector '${approved.selector}' and its reviewed kind/state/variant.`, definition.id, key));
  }
  const actualProperties = Object.keys(rule.declarations);
  const approvedProperties = Object.keys(approved.properties);
  if (actualProperties.length !== approvedProperties.length || actualProperties.some((property, index) => property !== approvedProperties[index])) {
    result.push(diagnostic("definition.property", `Properties for '${key}' differ from the reviewed authored order and allowlist.`, `Use exactly: ${approvedProperties.join(", ")}.`, definition.id, key));
  }
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    if (!(allowedProperties as readonly string[]).includes(property) || !approved.properties[property]) {
      result.push(diagnostic("definition.property", `Property '${property}' is not allowed for '${key}'.`, "Use only reviewed longhand properties.", definition.id, key, property));
      continue;
    }
    const actualOptions = optionKeys(declaration);
    const expectedOptions = approved.properties[property];
    if (actualOptions.length !== expectedOptions.length || actualOptions.some((option, index) => option !== expectedOptions[index])) {
      result.push(diagnostic("definition.options", `Options for '${key}/${property}' differ from the reviewed allowlist.`, `Use exactly: ${expectedOptions.join(", ")}.`, definition.id, key, property));
    }
    if (declaration.control.kind === "token") {
      const expectedFamilies = approved.tokenFamilies?.[property] ?? [];
      const actualFamilies = declaration.control.families;
      if (actualFamilies.length !== expectedFamilies.length || actualFamilies.some((family, index) => family !== expectedFamilies[index])) {
        result.push(diagnostic("definition.token-families", `Token families for '${key}/${property}' differ from the reviewed allowlist.`, `Use exactly: ${expectedFamilies.join(", ")}.`, definition.id, key, property));
      }
    }
    const omissionReviewed = approved.omissions?.includes(property) === true;
    if ((declaration.allowOmit === true) !== omissionReviewed) {
      result.push(diagnostic("definition.omission", `Omission policy for '${key}/${property}' differs from the reviewed allowlist.`, omissionReviewed ? "Restore reviewed omission for this property." : "Remove allowOmit or obtain an explicit Actions Promotion decision for omission.", definition.id, key, property));
    }
    if (!selectedValueIsAllowed(declaration.starter, declaration) || (!declaration.allowOmit && valueKey(declaration.starter) === "omit")) {
      result.push(diagnostic("definition.value", `Starter for '${key}/${property}' is not a reviewed option.`, "Use an exact offered value or reviewed omission.", definition.id, key, property));
    }
  }
  return result;
};

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
  const approvedKeys = Object.keys(actionTreatmentAllowlists[value.id]);
  const actualKeys = flat.map((item) => item.key);
  if (value.promoted && (actualKeys.length !== approvedKeys.length || actualKeys.some((key) => !approvedKeys.includes(key)))) {
    diagnostics.push(diagnostic("definition.completeness", `Promoted ${value.id} must contain its complete reviewed rule set.`, `Use exactly: ${approvedKeys.join(", ")}.`, value.id));
  }
  for (const item of flat) {
    diagnostics.push(...exactRuleDiagnostic(value, item.key, item.rule));
    for (const [property, declaration] of Object.entries(item.rule.declarations)) {
      if (!selectedValueIsAllowed(declaration.starter, declaration, tokenRegistry)) {
        diagnostics.push(diagnostic("definition.token", `Starter for '${item.key}/${property}' references an unavailable or unsafe value.`, "Choose an offered value backed by the effective token registry.", value.id, item.key, property));
      }
    }
    if (item.relationship) {
      const relationshipRule = item.rule as RelationshipRule;
      if (value.id !== "a" || item.relationship.id !== "link-in-navigation" || item.relationship.elements.join(",") !== "a,nav" || relationshipRule.targetElement !== "a") {
        diagnostics.push(diagnostic("definition.relationship", "Relationship ownership, elements, or target differs from the reviewed Actions contract.", "Use link-in-navigation owned by a, involving a and nav, targeting a.", value.id, item.key));
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
    : { success: false, diagnostics: [diagnostic("primitive-store.invalid", "Primitive override store is invalid.", "Reset invalid Primitive preferences.", undefined, undefined, undefined, ["preview", "css", "dtcg", "context"])] };
};

const rawOverrideSchema = z.object({
  schemaVersion: z.literal(1),
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
  if (input == null) return { store: { schemaVersion: 1, entries: {} }, diagnostics: [] };
  const parsed = rawOverrideSchema.safeParse(input);
  if (!parsed.success) return {
    store: { schemaVersion: 1, entries: {} },
    diagnostics: [diagnostic("element-store.invalid", "Saved Element preferences have an invalid store shape.", "Reset Element preferences; no saved CSS was applied.")],
  };
  const store: ElementOverrideStore = { schemaVersion: 1, entries: {} };
  const diagnostics: Diagnostic[] = [];
  for (const [elementId, rawEntry] of Object.entries(parsed.data.entries)) {
    const definition = definitions.find((item) => item.id === elementId);
    if (!definition) {
      diagnostics.push(diagnostic("element-store.element", `Saved Element '${elementId}' is unknown.`, "Remove the quarantined Element preference.", elementId));
      continue;
    }
    if (rawEntry.version !== definition.version || !semverPattern.test(rawEntry.version)) {
      diagnostics.push(diagnostic("element-store.version", `Saved ${elementId} preference targets Treatment ${rawEntry.version}, not ${definition.version}.`, "Review or reset this Element before export.", elementId));
      continue;
    }
    const entry: ElementOverrideEntry = { version: definition.version, rules: {} };
    const rulesByKey = new Map(authoredRules(definition).map((item) => [item.key, item.rule]));
    for (const [ruleId, rawValues] of Object.entries(rawEntry.rules)) {
      const rule = rulesByKey.get(ruleId);
      if (!rule) {
        diagnostics.push(diagnostic("element-store.rule", `Saved rule '${ruleId}' is unknown for ${elementId}.`, "Reset the affected Element preference.", elementId, ruleId));
        continue;
      }
      const values: Record<string, SelectedValue> = {};
      for (const [property, rawValue] of Object.entries(rawValues)) {
        const declaration = rule.declarations[property];
        if (!declaration || !selectedValueIsAllowed(rawValue, declaration, tokenRegistry)) {
          diagnostics.push(diagnostic("element-store.value", `Saved ${elementId}/${ruleId}/${property} is no longer an offered value.`, "Choose a listed value or reset this control.", elementId, ruleId, property));
          continue;
        }
        if (differsFromStarter(definition, ruleId, property, rawValue)) values[property] = rawValue;
      }
      if (Object.keys(values).length) entry.rules[ruleId] = values;
    }
    for (const [ruleId, source] of Object.entries(rawEntry.css ?? {})) {
      if (!rulesByKey.has(ruleId)) {
        diagnostics.push(diagnostic("element-store.rule", `Saved CSS rule '${ruleId}' is unknown for ${elementId}.`, "Reset the affected Element preference.", elementId, ruleId));
        continue;
      }
      const parsedSource = parseCssDeclarationList(source);
      if (!parsedSource.success) {
        diagnostics.push(diagnostic("element-store.css", `Saved CSS for ${elementId}/${ruleId} is invalid or unsafe.`, "Fix or reset the affected declaration draft.", elementId, ruleId));
        continue;
      }
      // Validate the declaration list, but retain the authored bytes. Compiler
      // output is normalized separately; editor persistence must never rewrite
      // a valid source string during a reload.
      (entry.css ??= {})[ruleId] = source;
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
