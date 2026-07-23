import {
  deepFreeze,
  parseElementDefinition,
  parseElementOverrides,
  valueToCss,
  type Diagnostic,
  type ElementDefinition,
  type ElementOverrideStore,
  type OutputChannelName,
  type SelectedValue,
} from "../model/index.ts";
import { parseCssDeclarationList } from "../css-declarations/index.ts";

export type OutputChannel<T> = { available: true; value: T } | { available: false; diagnostics: readonly Diagnostic[] };
export type PrimitiveTokenType = "color" | "dimension" | "string";
export type PrimitiveToken = { id: string; cssName: string; value: string; type: PrimitiveTokenType; resolvedValue?: string };
export type PrimitiveSnapshot = {
  variables?: Readonly<Record<string, string>>;
  colors?: readonly { name: string; value: string; scale: readonly string[]; variable: string }[];
  semantics?: Readonly<Record<string, { role: string; reference: string; value: string; variable: string }>>;
  type?: { label: string; min: string; max: string; minRatio: string; maxRatio: string; baseIndex: string; minWidth: number; maxWidth: number; tokens?: readonly { token: string; min: number; max: number }[] } | null;
  radii?: { name: string; tokens: readonly { token: string; min: number; max: number }[]; minWidth: number; maxWidth: number } | null;
  spacing?: { name: string; tokens: readonly { token: string; min: number; max: number }[]; minWidth: number; maxWidth: number } | null;
};
export const resolvedColorSwatch = (tokenId: string, primitives: readonly PrimitiveToken[], seen = new Set<string>()): string => {
  if (seen.has(tokenId)) return "transparent";
  seen.add(tokenId);
  const token = primitives.find((item) => item.id === tokenId);
  if (!token) return "transparent";
  const candidate = token.resolvedValue ?? token.value;
  const reference = /^var\((--[a-z0-9-]+)\)$/i.exec(candidate)?.[1];
  if (!reference) return candidate;
  const referenced = primitives.find((item) => item.cssName === reference);
  return referenced ? resolvedColorSwatch(referenced.id, primitives, seen) : "transparent";
};
export type CompileFrameworkInput = {
  definitions: readonly ElementDefinition[];
  elementDiffs?: ElementOverrideStore;
  primitiveDefaults?: Readonly<Record<string, string>>;
  primitiveDiffs?: Readonly<Record<string, string>>;
  primitiveTokens?: readonly PrimitiveToken[];
  primitiveSnapshot?: PrimitiveSnapshot;
  identity: { id: string; name: string };
  sourceRevision: string;
  contextSchemaVersion: string;
  primitiveValid?: boolean;
  preferenceDiagnostics?: readonly Diagnostic[];
};
export type PreviewBundle = { css: string; scope: "[data-framework-preview]"; contentHash: string };
export type TextArtifact = { name: "tokens.css" | "elements.css" | "context.md"; mimeType: "text/css" | "text/markdown"; value: string };
export type PackagedArtifacts = { name: "framework.zip"; mimeType: "application/zip"; value: Uint8Array };
export type ResolvedDeclaration = { property: string; value: SelectedValue | { kind: "css"; value: string }; cssValue: string | null; important?: boolean; tokenId?: string; cssVariable?: string };
export type ResolvedRule = {
  id: string;
  sourceId: string;
  kind: "base" | "state" | "variant" | "relationship";
  selector: string;
  state?: string;
  variant?: string;
  relationshipId?: string;
  when?: string;
  semanticHtml?: string;
  declarations: readonly ResolvedDeclaration[];
};
export type ResolvedElement = {
  id: "a" | "button";
  title: string;
  group: "Actions";
  order: number;
  version: string;
  purpose: string;
  treatment: string;
  use: readonly string[];
  avoid: string;
  constraints: readonly string[];
  accessibility: readonly string[];
  semanticHtml: string;
  variants: readonly { name: string; when: string }[];
  defaultVariant?: string;
  rules: readonly ResolvedRule[];
};
export type ResolvedFramework = {
  identity: Readonly<{ id: string; name: string }>;
  primitives: readonly PrimitiveToken[];
  elements: readonly ResolvedElement[];
};
export type FrameworkCompilation = {
  resolved: Readonly<ResolvedFramework>;
  preview: OutputChannel<PreviewBundle>;
  artifacts: {
    tokens: OutputChannel<TextArtifact>;
    elements: OutputChannel<TextArtifact>;
    context: OutputChannel<TextArtifact>;
  };
  diagnostics: readonly Diagnostic[];
  identity: { frameworkVersion: string; sourceRevision: string; contextSchemaVersion: string; contentHash: string };
};
export type CompileDraftSpecimenInput = {
  definition: ElementDefinition;
  elementDiffs?: ElementOverrideStore;
  primitives: readonly PrimitiveToken[] | Readonly<Record<string, string>>;
};
export type DraftSpecimenCompilation = { css: string; diagnostics: readonly Diagnostic[] };

const intentOrder = ["Structure", "Typography", "Lists", "Actions", "Media", "Data", "Forms", "Disclosure"];
const kindOrder = ["base", "state", "variant"];
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};
const hash = (value: unknown) => {
  let result = 2166136261;
  for (const char of stable(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0).toString(16).padStart(8, "0");
};
const diagnostic = (
  code: string,
  message: string,
  repair: string,
  channels: readonly OutputChannelName[],
  details: Partial<Pick<Diagnostic, "elementId" | "ruleId" | "property" | "check">> = {},
): Diagnostic => ({ code, message, repair, channels, ...details });
const number = (value: number) => Number(value.toFixed(4));
const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "token";
const primitiveIdPattern = /^(?:semantic|color|typography|spacing|radius|variable)\.[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)*$/;
const cssNamePattern = /^--[a-z0-9][a-z0-9-]*$/;
const cssNumber = "[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)";
const variableValuePattern = /^var\(--[a-z0-9][a-z0-9-]*\)$/;
const colorValuePattern = /^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([0-9.%+,/\s-]+\)|transparent|currentcolor)$/i;
const simpleDimensionPattern = new RegExp(`^${cssNumber}(?:rem|em|px|vw|vh|%)$`);
const fluidDimensionPattern = new RegExp(`^clamp\\(${cssNumber}rem, calc\\(${cssNumber}rem \\+ ${cssNumber}vw\\), ${cssNumber}rem\\)$`);
const stringValuePattern = /^[a-z0-9][a-z0-9 .,/'"_-]*$/i;
const primitiveTypeFor = (value: string): PrimitiveTokenType => colorValuePattern.test(value)
  ? "color"
  : simpleDimensionPattern.test(value) || fluidDimensionPattern.test(value) ? "dimension" : "string";
const validPrimitiveValue = (token: PrimitiveToken) => {
  if (typeof token.value !== "string" || !token.value.length || token.value !== token.value.trim() || /[;{}\r\n]/.test(token.value)) return false;
  if (token.type === "color") {
    if (variableValuePattern.test(token.value)) return typeof token.resolvedValue === "string" && colorValuePattern.test(token.resolvedValue);
    return colorValuePattern.test(token.value) && (token.resolvedValue === undefined || colorValuePattern.test(token.resolvedValue));
  }
  if (token.type === "dimension") return simpleDimensionPattern.test(token.value) || fluidDimensionPattern.test(token.value);
  return token.type === "string" && (variableValuePattern.test(token.value) || stringValuePattern.test(token.value));
};
const fluidValue = (min: number, max: number, minWidth: number, maxWidth: number, forceClamp: boolean) => {
  const safeMax = Math.max(min, max);
  if (!forceClamp && Math.abs(safeMax - min) < 0.0001) return `${number(min)}rem`;
  const widthRange = Math.max(0.0625, maxWidth - minWidth);
  const slope = (safeMax - min) / widthRange;
  const intercept = min - slope * minWidth;
  return `clamp(${number(min)}rem, calc(${number(intercept)}rem + ${number(slope * 100)}vw), ${number(safeMax)}rem)`;
};
const typeTokens = (type: NonNullable<PrimitiveSnapshot["type"]>) => {
  if (type.tokens?.length) return type.tokens;
  const names = ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"];
  const anchor = Math.max(0, names.indexOf(type.baseIndex));
  const minBase = Number.parseFloat(type.min) || 1;
  const maxBase = Number.parseFloat(type.max) || 1.125;
  const minRatio = Number.parseFloat(type.minRatio) || 1.125;
  const maxRatio = Number.parseFloat(type.maxRatio) || 1.333;
  return names.map((token, index) => {
    const step = index - anchor;
    const min = minBase * Math.pow(minRatio, step);
    return { token, min, max: Math.max(min, maxBase * Math.pow(maxRatio, step)) };
  });
};

/** Normalize the existing Framework editor snapshot into one authored-order token registry. */
export const primitiveTokensFromSnapshot = (snapshot: PrimitiveSnapshot): readonly PrimitiveToken[] => {
  const tokens: PrimitiveToken[] = [];
  const generatedCssNames = new Set<string>();
  for (const color of snapshot.colors ?? []) {
    generatedCssNames.add(color.variable);
    for (const suffix of ["lightest", "lighter", "light", "dark", "darker", "darkest"]) generatedCssNames.add(`${color.variable}-${suffix}`);
  }
  for (const semantic of Object.values(snapshot.semantics ?? {})) generatedCssNames.add(semantic.variable);
  if (snapshot.type) for (const token of typeTokens(snapshot.type)) generatedCssNames.add(`--${slug(snapshot.type.label || "text")}-${token.token}`);
  for (const system of [snapshot.radii, snapshot.spacing]) if (system) for (const token of system.tokens) generatedCssNames.add(`--${slug(system.name)}-${token.token}`);
  const append = (token: PrimitiveToken) => tokens.push(token);
  for (const [cssName, value] of Object.entries(snapshot.variables ?? {})) {
    if (cssNamePattern.test(cssName) && !generatedCssNames.has(cssName)) append({ id: `variable.${cssName.slice(2)}`, cssName, value, type: primitiveTypeFor(value) });
  }
  for (const color of snapshot.colors ?? []) {
    const id = slug(color.name);
    const scale = color.scale;
    const shades: readonly [string, string, string][] = [
      ["", color.variable, color.value],
      ["lightest", `${color.variable}-lightest`, scale[0]],
      ["lighter", `${color.variable}-lighter`, scale[1]],
      ["light", `${color.variable}-light`, scale[2]],
      ["dark", `${color.variable}-dark`, scale[4]],
      ["darker", `${color.variable}-darker`, scale[5]],
      ["darkest", `${color.variable}-darkest`, scale[6]],
    ];
    for (const [shade, cssName, value] of shades) append({ id: `color.${id}${shade ? `.${shade}` : ""}`, cssName, value, type: "color" });
  }
  for (const role of ["primary", "action", "surface", "text", "border", "focus"]) {
    const semantic = snapshot.semantics?.[role];
    if (semantic) append({
      id: `semantic.${role}`,
      cssName: semantic.variable,
      value: semantic.reference.startsWith("--") ? `var(${semantic.reference})` : semantic.value,
      resolvedValue: semantic.value,
      type: "color",
    });
  }
  if (snapshot.type) {
    const name = slug(snapshot.type.label || "text");
    for (const token of typeTokens(snapshot.type)) append({
      id: `typography.${token.token}`,
      cssName: `--${name}-${token.token}`,
      value: fluidValue(token.min, token.max, snapshot.type.minWidth, snapshot.type.maxWidth, true),
      type: "dimension",
    });
  }
  const addFluidSystem = (family: "radius" | "spacing", system: PrimitiveSnapshot["radii"] | PrimitiveSnapshot["spacing"], forceClamp: boolean) => {
    if (!system) return;
    const name = slug(system.name);
    for (const token of system.tokens) append({
      id: `${family}.${token.token}`,
      cssName: `--${name}-${token.token}`,
      value: fluidValue(token.min, token.max, system.minWidth, system.maxWidth, forceClamp),
      type: "dimension",
    });
  };
  addFluidSystem("radius", snapshot.radii, false);
  addFluidSystem("spacing", snapshot.spacing, true);
  return deepFreeze(tokens);
};

const fallbackTokens = (defaults: Readonly<Record<string, string>>) => Object.entries(defaults).map(([id, value]) => ({
  id,
  cssName: `--${id.replaceAll(".", "-")}`,
  value,
  type: id.startsWith("color.") || id.startsWith("semantic.") ? "color" as const : primitiveTypeFor(value),
}));

const resolveTokens = (input: CompileFrameworkInput): readonly PrimitiveToken[] => {
  const source = input.primitiveSnapshot ? primitiveTokensFromSnapshot(input.primitiveSnapshot) : input.primitiveTokens ?? fallbackTokens(input.primitiveDefaults ?? {});
  const diffs = input.primitiveDiffs ?? {};
  return deepFreeze(source.map((token) => ({ ...token, value: diffs[token.id] ?? token.value })));
};

const orderedDefinitions = (definitions: readonly ElementDefinition[]) => [...definitions].sort((a, b) =>
  intentOrder.indexOf(a.group) - intentOrder.indexOf(b.group) || a.order - b.order || a.id.localeCompare(b.id));

const orderedRules = (definition: ElementDefinition) => {
  const ordinary = definition.definition.rules
    .map((rule, index) => ({ key: rule.id, rule, index }))
    .sort((a, b) => kindOrder.indexOf(a.rule.kind) - kindOrder.indexOf(b.rule.kind) || a.index - b.index)
    .map(({ key, rule }) => ({ key, rule, relationship: undefined }));
  const relationships = (definition.definition.relationships ?? []).flatMap((relationship) => relationship.rules.map((rule) => ({
    key: `${relationship.id}/${rule.id}`,
    rule,
    relationship,
  })));
  return [...ordinary, ...relationships];
};

const selected = (definition: ElementDefinition, store: ElementOverrideStore | undefined, ruleId: string, property: string, starter: SelectedValue) =>
  store?.entries[definition.id]?.rules[ruleId]?.[property] ?? starter;
const stableVersion = (version: string) => /^([1-9]\d*)\.\d+\.\d+$/.test(version);
const eligible = (definition: ElementDefinition) => stableVersion(definition.version)
  && definition.baseline.status === "widely-available"
  && definition.promoted
  && definition.accessibilityPassed;

const resolveElement = (definition: ElementDefinition, store: ElementOverrideStore | undefined, tokenVariables: ReadonlyMap<string, string>): ResolvedElement => ({
  id: definition.id,
  title: definition.title,
  group: definition.group,
  order: definition.order,
  version: definition.version,
  purpose: definition.purpose,
  treatment: definition.treatment,
  use: definition.use,
  avoid: definition.avoid,
  constraints: definition.constraints,
  accessibility: definition.accessibility,
  semanticHtml: definition.semanticHtml,
  variants: definition.variants,
  defaultVariant: definition.defaultVariant,
  rules: orderedRules(definition).map(({ key, rule, relationship }) => ({
    id: key,
    sourceId: rule.id,
    kind: relationship ? "relationship" : rule.kind,
    selector: rule.selector,
    state: rule.state,
    variant: rule.variant,
    relationshipId: relationship?.id,
    when: relationship?.when ?? rule.when,
    semanticHtml: relationship?.semanticHtml,
    declarations: store?.entries[definition.id]?.css && Object.hasOwn(store.entries[definition.id].css!, key)
      ? (() => {
        const parsed = parseCssDeclarationList(store.entries[definition.id].css![key]);
        return parsed.success ? parsed.declarations.map(({ property, value, important }) => ({ property, value: { kind: "css" as const, value }, cssValue: value, important })) : [];
      })()
      : Object.entries(rule.declarations).map(([property, declaration]) => {
      const value = selected(definition, store, key, property, declaration.starter);
      const tokenId = value.kind === "token" ? `${value.family}.${value.name}` : undefined;
      return { property, value, cssValue: valueToCss(value, tokenVariables), tokenId, cssVariable: tokenId ? tokenVariables.get(tokenId) : undefined };
      }),
  })),
});

const serializeTokenLayer = (tokens: readonly PrimitiveToken[], scope: ":root" | "[data-framework-preview]") => tokens.length
  ? `@layer tokens {\n  ${scope} {\n${tokens.map((token) => `    ${token.cssName}: ${token.value};`).join("\n")}\n  }\n}`
  : "@layer tokens {\n  /* No authored tokens. */\n}";
const serializeElementLayer = (elements: readonly ResolvedElement[], scope = "") => {
  const body = elements.flatMap((element) => element.rules.map((rule) => {
    const declarations = rule.declarations.filter((item) => item.cssValue !== null);
    if (!declarations.length) return "";
    return `  /* ${element.id}/${rule.id} */\n  ${scope}${rule.selector} {\n${declarations.map((item) => `    ${item.property}: ${item.cssValue}${item.important ? " !important" : ""};`).join("\n")}\n  }`;
  })).filter(Boolean).join("\n");
  return body ? `@layer elements {\n${body}\n}` : "@layer elements {\n  /* No active Element treatments. */\n}";
};
const serializeCssBody = (tokens: readonly PrimitiveToken[], elements: readonly ResolvedElement[], preview: boolean) => [
  "@layer tokens, elements, components;",
  serializeTokenLayer(tokens, preview ? "[data-framework-preview]" : ":root"),
  serializeElementLayer(elements, preview ? "[data-framework-preview] " : ""),
].filter(Boolean).join("\n\n") + "\n";

const mappingFor = (declaration: ResolvedDeclaration) => declaration.value.kind === "token"
  ? `${declaration.property} -> ${declaration.tokenId} -> var(${declaration.cssVariable})`
  : declaration.value.kind === "omit" ? `${declaration.property} -> omitted` : `${declaration.property} -> ${declaration.value.value}`;
const markdownFence = (content: string, language = "") => {
  const longestRun = Math.max(0, ...(content.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}${language}\n${content}${fence}`;
};
const serializeContext = (
  input: CompileFrameworkInput,
  elements: readonly ResolvedElement[],
  tokensCss: string,
  elementsCss: string,
  frameworkVersion: string,
  contentHash: string,
) => `---
frameworkId: ${input.identity.id}
frameworkName: ${input.identity.name}
frameworkVersion: ${frameworkVersion}
schemaVersion: 2
sourceRevision: ${input.sourceRevision}
contentHash: ${contentHash}
generatedBy: https://techies.tools
artifacts:
  - tokens.css
  - elements.css
  - context.md
---

<!-- Generated by https://techies.tools · ${input.identity.name} ${frameworkVersion} · ${contentHash} -->

# ${input.identity.name}

The exported Tokens and Element treatments are the Default Treatment baseline. Undeclared presentation and behavior remain browser-native; do not invent Framework CSS. Load \`tokens.css\` before \`elements.css\`, then load targeted consumer CSS only when explicitly requested.

## Actions

${elements.map((element) => `### ${element.title} (\`${element.id}\` ${element.version})

**Purpose:** ${element.purpose}

**Default Treatment:** ${element.treatment}

**Use:** ${element.use.join(" ")}

**Constraints:** ${element.constraints.join(" ")} Avoid: ${element.avoid}

**States:** ${element.rules.filter((rule) => rule.state).map((rule) => `${rule.state} (${rule.selector})`).join(", ") || "None."}

**Variants:** Default is ${element.defaultVariant ?? "the base Treatment"}. ${element.variants.map((variant) => `${variant.name}: ${variant.when}`).join(" ") || "No additional variants."}

**Relationships:** ${element.rules.filter((rule) => rule.relationshipId).map((rule) => `${rule.relationshipId}: ${rule.when} (${rule.selector}); semantic HTML: ${rule.semanticHtml}`).join(" ") || "None."}

**Accessibility:** ${element.accessibility.join(" ")}

**Property mappings:**
${markdownFence(element.rules.flatMap((rule) => rule.declarations.map((declaration) => `${rule.id}: ${mappingFor(declaration)}`)).join("\n"))}

**Semantic HTML:** \`${element.semanticHtml}\``).join("\n\n")}

## Accessibility advisories

No ignored accessibility advisories.

## Implementation Reference

### tokens.css

${markdownFence(tokensCss, "css")}

### elements.css

${markdownFence(elementsCss, "css")}
`;

const block = <T>(diagnostics: readonly Diagnostic[]): OutputChannel<T> => ({ available: false, diagnostics });
const artifactHeader = (
  input: CompileFrameworkInput,
  frameworkVersion: string,
  contentHash: string,
  artifact: "tokens.css" | "elements.css",
) => `/*${artifact === "elements.css" ? " Requires tokens.css loaded first.\n  " : ""} Generated by https://techies.tools
   Framework: ${input.identity.name}
   Framework ID: ${input.identity.id}
   Version: ${frameworkVersion}
   Content hash: ${contentHash}
   Source revision: ${input.sourceRevision}
   Artifact: ${artifact} */
`;
const textArtifact = (
  name: TextArtifact["name"],
  mimeType: TextArtifact["mimeType"],
  value: string,
): TextArtifact => ({ name, mimeType, value: value.replaceAll("\r\n", "\n").replace(/\n*$/, "\n") });

export const compileFramework = (input: CompileFrameworkInput): FrameworkCompilation => {
  const tokens = resolveTokens(input);
  const tokenVariables = new Map(tokens.map((token) => [token.id, token.cssName]));
  const tokenRegistry = new Map(tokens.map((token) => [token.id, token.type] as const));
  const definitions = orderedDefinitions(input.definitions);
  const parsedDefinitions: ElementDefinition[] = [];
  const authoredDiagnostics: Diagnostic[] = [];
  for (const definition of definitions) {
    const parsed = parseElementDefinition(definition, tokenRegistry);
    if (parsed.success) parsedDefinitions.push(parsed.data as ElementDefinition);
    else authoredDiagnostics.push(...parsed.diagnostics);
  }

  const parsedOverrides = input.elementDiffs ? parseElementOverrides(input.elementDiffs, parsedDefinitions, tokenRegistry) : undefined;
  const overrideDiagnostics = parsedOverrides && !parsedOverrides.success ? parsedOverrides.diagnostics : [];
  const effectiveDiffs = parsedOverrides?.success ? parsedOverrides.data as ElementOverrideStore : undefined;
  const preferenceDiagnostics = input.preferenceDiagnostics ?? [];
  const primitiveDiagnostics: Diagnostic[] = [];
  if (input.primitiveValid === false) primitiveDiagnostics.push(diagnostic("primitive.invalid", "Primitive editor validation failed.", "Repair Primitive preferences before Preview or export.", ["preview", "tokens", "elements", "context"], { check: "editor-validity" }));
  const seenIds = new Set<string>();
  const seenCssNames = new Set<string>();
  for (const token of tokens) {
    if (!primitiveIdPattern.test(token.id) || !cssNamePattern.test(token.cssName) || !validPrimitiveValue(token)) {
      primitiveDiagnostics.push(diagnostic("primitive.token", `Primitive '${token.id}' has an invalid ID, CSS variable, type, or value.`, "Use a stable family.name ID, unique --custom-property, matching color/dimension/string type, and a safe token value without raw CSS delimiters.", ["preview", "tokens", "elements", "context"], { check: token.id }));
    }
    if ((token.id.startsWith("semantic.") || token.id.startsWith("color.")) && token.type !== "color") {
      primitiveDiagnostics.push(diagnostic("primitive.family-type", `Primitive '${token.id}' belongs to a color family but has type '${token.type}'.`, "Use type 'color' with a valid color value, or move the token to its matching family.", ["preview", "tokens", "elements", "context"], { check: token.id }));
    }
    if (seenIds.has(token.id)) primitiveDiagnostics.push(diagnostic("primitive.duplicate-id", `Primitive ID '${token.id}' is duplicated.`, "Rename or remove the duplicate Primitive before Preview or export.", ["preview", "tokens", "elements", "context"], { check: token.id }));
    if (seenCssNames.has(token.cssName)) primitiveDiagnostics.push(diagnostic("primitive.duplicate-css-name", `Primitive CSS variable '${token.cssName}' is duplicated.`, "Give every Primitive one unique CSS variable name.", ["preview", "tokens", "elements", "context"], { check: token.cssName }));
    seenIds.add(token.id);
    seenCssNames.add(token.cssName);
  }
  for (const id of Object.keys(input.primitiveDiffs ?? {})) {
    if (!seenIds.has(id)) primitiveDiagnostics.push(diagnostic("primitive.diff-id", `Primitive difference '${id}' has no authored token.`, "Reset the stale Primitive difference or restore its authored token.", ["preview", "tokens", "elements", "context"], { check: id }));
  }
  const eligibilityDiagnostics = parsedDefinitions.flatMap((definition) => {
    if (!definition.promoted) return [];
    if (!stableVersion(definition.version)) return [diagnostic("element.promotion-version", `Promoted ${definition.id} has non-stable Treatment ${definition.version}.`, "Defer it or assign the explicitly approved stable semantic version.", ["elements", "context"], { elementId: definition.id })];
    if (definition.baseline.status !== "widely-available") return [diagnostic("element.baseline", `Promoted ${definition.id} is not MDN Baseline Widely available.`, "Defer it and record a recheck trigger.", ["elements", "context"], { elementId: definition.id })];
    if (!definition.accessibilityPassed) return [diagnostic("element.accessibility", `Promoted ${definition.id} lacks passing required accessibility evidence.`, "Repair the failed check and record fresh evidence before export.", ["elements", "context"], { elementId: definition.id, check: "required-accessibility" })];
    return [];
  });
  const invalidPromotedIds = new Set<string>(definitions.filter((definition) => definition.promoted && stableVersion(definition.version)).map((definition) => definition.id));
  const promotedAuthoredDiagnostics = authoredDiagnostics.filter((item) => !item.elementId || invalidPromotedIds.has(item.elementId));
  const promotedPreferenceDiagnostics = [...overrideDiagnostics, ...preferenceDiagnostics].filter((item) => !item.elementId || invalidPromotedIds.has(item.elementId));
  const blockingElementDiagnostics = [...promotedAuthoredDiagnostics, ...promotedPreferenceDiagnostics, ...eligibilityDiagnostics];

  const resolvedElements = parsedDefinitions.map((definition) => resolveElement(definition, effectiveDiffs, tokenVariables));
  const activeIds = new Set(parsedDefinitions.filter(eligible).map((definition) => definition.id));
  const activeElements = resolvedElements.filter((element) => activeIds.has(element.id));
  const resolved = deepFreeze({ identity: { ...input.identity }, primitives: tokens, elements: resolvedElements }) as Readonly<ResolvedFramework>;
  const identityContent = { identity: resolved.identity, primitives: resolved.primitives, elements: activeElements };
  const contentHash = hash(identityContent);
  const frameworkVersion = `1.0.${Number.parseInt(contentHash, 16)}`;
  const tokensBody = ["@layer tokens, elements, components;", serializeTokenLayer(tokens, ":root")].join("\n\n") + "\n";
  const elementsBody = ["@layer tokens, elements, components;", serializeElementLayer(activeElements)].join("\n\n") + "\n";
  const previewBody = serializeCssBody(tokens, activeElements, true);
  const tokensArtifact = textArtifact("tokens.css", "text/css", artifactHeader(input, frameworkVersion, contentHash, "tokens.css") + tokensBody);
  const elementsArtifact = textArtifact("elements.css", "text/css", artifactHeader(input, frameworkVersion, contentHash, "elements.css") + elementsBody);
  const contextArtifact = textArtifact("context.md", "text/markdown", serializeContext(input, activeElements, tokensArtifact.value, elementsArtifact.value, frameworkVersion, contentHash));
  const previewCss = artifactHeader(input, frameworkVersion, contentHash, "elements.css") + previewBody;
  const diagnostics = deepFreeze([...primitiveDiagnostics, ...authoredDiagnostics, ...overrideDiagnostics, ...preferenceDiagnostics, ...eligibilityDiagnostics]);
  const cssContextBlocked = primitiveDiagnostics.length > 0 || blockingElementDiagnostics.length > 0;

  return deepFreeze({
    resolved,
    preview: primitiveDiagnostics.length ? block(primitiveDiagnostics) : { available: true, value: { css: previewCss, scope: "[data-framework-preview]", contentHash } },
    artifacts: {
      tokens: primitiveDiagnostics.length ? block(primitiveDiagnostics) : { available: true, value: tokensArtifact },
      elements: cssContextBlocked ? block([...primitiveDiagnostics, ...blockingElementDiagnostics]) : { available: true, value: elementsArtifact },
      context: cssContextBlocked ? block([...primitiveDiagnostics, ...blockingElementDiagnostics]) : { available: true, value: contextArtifact },
    },
    diagnostics,
    identity: { frameworkVersion, sourceRevision: input.sourceRevision, contextSchemaVersion: input.contextSchemaVersion, contentHash },
  }) as FrameworkCompilation;
};

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();
const crc32 = (bytes: Uint8Array) => {
  let value = 0xffffffff;
  for (const byte of bytes) value = crc32Table[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};
const concatBytes = (chunks: readonly Uint8Array[]) => {
  const result = new Uint8Array(chunks.reduce((length, chunk) => length + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};
const zipHeader = (length: number) => {
  const bytes = new Uint8Array(length);
  return { bytes, view: new DataView(bytes.buffer) };
};

/** Package the exact cached artifact bytes without recompiling or adding timestamps. */
export const packageArtifacts = (artifacts: FrameworkCompilation["artifacts"]): PackagedArtifacts => {
  const ordered = [artifacts.tokens, artifacts.elements, artifacts.context];
  if (ordered.some((channel) => !channel.available)) throw new Error("All three Framework artifacts must be available before packaging.");
  const encoder = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let localOffset = 0;
  for (const channel of ordered) {
    if (!channel.available) continue;
    const name = encoder.encode(channel.value.name);
    const content = encoder.encode(channel.value.value);
    const checksum = crc32(content);
    const local = zipHeader(30);
    local.view.setUint32(0, 0x04034b50, true);
    local.view.setUint16(4, 20, true);
    local.view.setUint16(6, 0x0800, true);
    local.view.setUint16(8, 0, true);
    local.view.setUint16(10, 0, true);
    local.view.setUint16(12, 0x0021, true);
    local.view.setUint32(14, checksum, true);
    local.view.setUint32(18, content.length, true);
    local.view.setUint32(22, content.length, true);
    local.view.setUint16(26, name.length, true);
    local.view.setUint16(28, 0, true);
    localChunks.push(local.bytes, name, content);

    const central = zipHeader(46);
    central.view.setUint32(0, 0x02014b50, true);
    central.view.setUint16(4, 20, true);
    central.view.setUint16(6, 20, true);
    central.view.setUint16(8, 0x0800, true);
    central.view.setUint16(10, 0, true);
    central.view.setUint16(12, 0, true);
    central.view.setUint16(14, 0x0021, true);
    central.view.setUint32(16, checksum, true);
    central.view.setUint32(20, content.length, true);
    central.view.setUint32(24, content.length, true);
    central.view.setUint16(28, name.length, true);
    central.view.setUint16(30, 0, true);
    central.view.setUint16(32, 0, true);
    central.view.setUint16(34, 0, true);
    central.view.setUint16(36, 0, true);
    central.view.setUint32(38, 0, true);
    central.view.setUint32(42, localOffset, true);
    centralChunks.push(central.bytes, name);
    localOffset += local.bytes.length + name.length + content.length;
  }
  const centralDirectory = concatBytes(centralChunks);
  const end = zipHeader(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(4, 0, true);
  end.view.setUint16(6, 0, true);
  end.view.setUint16(8, ordered.length, true);
  end.view.setUint16(10, ordered.length, true);
  end.view.setUint32(12, centralDirectory.length, true);
  end.view.setUint32(16, localOffset, true);
  end.view.setUint16(20, 0, true);
  return { name: "framework.zip", mimeType: "application/zip", value: concatBytes([...localChunks, centralDirectory, end.bytes]) };
};

export const compileDraftSpecimen = (input: CompileDraftSpecimenInput): DraftSpecimenCompilation => {
  if (input.definition.promoted) return {
    css: "",
    diagnostics: [diagnostic("draft.promoted", `${input.definition.id} is promoted and cannot use the isolated Draft specimen channel.`, "Use ordinary compiled Preview for promoted Elements.", ["preview"], { elementId: input.definition.id })],
  };
  const primitives = Array.isArray(input.primitives) ? input.primitives : fallbackTokens(input.primitives as Readonly<Record<string, string>>);
  const registry = new Map(primitives.map((token) => [token.id, token.type] as const));
  const parsed = parseElementDefinition(input.definition, registry);
  if (!parsed.success) return { css: "", diagnostics: parsed.diagnostics };
  const tokenVariables = new Map(primitives.map((token) => [token.id, token.cssName]));
  const element = resolveElement(parsed.data as ElementDefinition, input.elementDiffs, tokenVariables);
  return { css: `@layer elements {\n${serializeElementLayer([element], `[data-framework-draft-specimen="${element.id}"] `).replace(/^@layer elements \{|\n}$/g, "")}\n}\n`, diagnostics: [] };
};
