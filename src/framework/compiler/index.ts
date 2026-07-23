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
import type { CatalogElement, ElementCatalog } from "../catalog/index.ts";
import { parseCssDeclarationList } from "../css-declarations/index.ts";
import { parseRuleDeclarations } from "../element-authoring/index.ts";
import { evaluateContrastChecks, type ContrastAdvisory, type ContrastCheck } from "../accessibility/index.ts";
export { packageArtifacts } from "./package-artifacts.ts";

export type OutputChannel<T> = { available: true; value: T } | { available: false; diagnostics: readonly Diagnostic[] };
export type PrimitiveTokenType = "color" | "dimension" | "string";
export type PrimitiveToken = { id: string; cssName: string; value: string; type: PrimitiveTokenType; resolvedValue?: string };
export type PrimitiveSnapshot = {
  variables?: Readonly<Record<string, string>>;
  colors?: readonly { name: string; value: string; scale: readonly string[]; variable: string }[];
  semantics?: Readonly<Record<string, { role: string; reference: string; value: string; variable: string }>>;
  type?: {
    label: string;
    min: string;
    max: string;
    minRatio: string;
    maxRatio: string;
    baseIndex: string;
    minWidth: number;
    maxWidth: number;
    tokens?: readonly { token: string; min: number; max: number }[];
    family?: string;
    codeFamily?: string;
    bodyWeights?: readonly number[];
    codeWeights?: readonly number[];
    googleFonts?: boolean;
  } | null;
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
  catalog: ElementCatalog;
  elementDiffs?: ElementOverrideStore;
  primitiveDefaults?: Readonly<Record<string, string>>;
  primitiveDiffs?: Readonly<Record<string, string>>;
  primitiveTokens?: readonly PrimitiveToken[];
  primitiveSnapshot?: PrimitiveSnapshot;
  identity: { id: string; name: string };
  sourceRevision: string;
  primitiveValid?: boolean;
  preferenceDiagnostics?: readonly Diagnostic[];
  contextDiagnostics?: readonly Diagnostic[];
};
export type PreviewBundle = { css: string; scope: "[data-framework-preview]"; contentHash: string };
export type TextArtifact = {
  name: "tokens.css" | "elements.css" | "context.md";
  mimeType: "text/css;charset=utf-8" | "text/markdown;charset=utf-8";
  contentHash: string;
  dependencies: readonly ("tokens.css" | "elements.css")[];
  value: string;
};
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
  id: string;
  title: string;
  group: CatalogElement["group"];
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
  accessibilityAdvisories: readonly ContrastAdvisory[];
  identity: { frameworkVersion: string; sourceRevision: string; contextSchemaVersion: string; contentHash: string };
};
export type CompileDraftSpecimenInput = {
  element: CatalogElement;
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
const stringValuePattern = /^[a-z0-9'"][a-z0-9 .,/'"_-]*$/i;
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

const safeFontFamily = (value: string | undefined, fallback: string) => {
  const candidate = value?.trim() || fallback;
  return /^[A-Za-z][A-Za-z0-9 ]{0,60}$/.test(candidate) ? candidate : fallback;
};
const safeWeights = (values: readonly number[] | undefined, fallback: readonly number[]) => [...new Set(values ?? fallback)]
  .filter((value) => Number.isInteger(value) && value >= 100 && value <= 900 && value % 100 === 0)
  .sort((left, right) => left - right);
const quotedFamily = (family: string, fallback: string) => `'${family.replaceAll("'", "")}', ${fallback}`;
const googleFontsImport = (type: PrimitiveSnapshot["type"]) => {
  if (!type?.googleFonts) return "";
  const body = safeFontFamily(type.family, "Inter");
  const code = safeFontFamily(type.codeFamily, "Roboto Mono");
  const specs = new Map<string, readonly number[]>([
    [body, safeWeights(type.bodyWeights, [400, 500, 600, 700, 800])],
    [code, safeWeights(type.codeWeights, [400, 500, 600, 700])],
  ]);
  const families = [...specs].map(([family, weights]) =>
    `family=${family.replaceAll(" ", "+")}:wght@${weights.join(";")}`);
  return `@import url("https://fonts.googleapis.com/css2?${families.join("&")}&display=swap");`;
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
  if (snapshot.type) {
    generatedCssNames.add("--font-body");
    generatedCssNames.add("--font-code");
    for (const token of typeTokens(snapshot.type)) generatedCssNames.add(`--${slug(snapshot.type.label || "text")}-${token.token}`);
  }
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
    const bodyFamily = safeFontFamily(snapshot.type.family, "Inter");
    const codeFamily = safeFontFamily(snapshot.type.codeFamily, "Roboto Mono");
    append({ id: "typography.family-body", cssName: "--font-body", value: quotedFamily(bodyFamily, "system-ui, sans-serif"), type: "string" });
    append({ id: "typography.family-code", cssName: "--font-code", value: quotedFamily(codeFamily, "ui-monospace, monospace"), type: "string" });
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
  store?.entries[definition.id]?.rules[`${definition.id}/${ruleId}`]?.[property] ?? starter;
const stableVersion = (version: string) => /^([1-9]\d*)\.\d+\.\d+$/.test(version);
const selectedTokenFromId = (tokenId: string): SelectedValue | undefined => {
  const dot = tokenId.indexOf(".");
  if (dot < 1) return undefined;
  const family = tokenId.slice(0, dot);
  return ["semantic", "color", "typography", "spacing", "radius"].includes(family)
    ? { kind: "token", family: family as "semantic" | "color" | "typography" | "spacing" | "radius", name: tokenId.slice(dot + 1) }
    : undefined;
};
const resolveElement = (definition: ElementDefinition, store: ElementOverrideStore | undefined, tokenVariables: ReadonlyMap<string, string>): ResolvedElement => {
  const tokenIdsByVariable = new Map([...tokenVariables].map(([id, cssName]) => [cssName, id]));
  return ({
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
    declarations: store?.entries[definition.id]?.css && Object.hasOwn(store.entries[definition.id].css!, `${definition.id}/${key}`)
      ? (() => {
        const parsed = parseCssDeclarationList(store.entries[definition.id].css![`${definition.id}/${key}`]);
        return parsed.success ? parsed.declarations.map(({ property, value, important }) => {
          const cssVariable = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1];
          const tokenId = cssVariable ? tokenIdsByVariable.get(cssVariable) : undefined;
          const selectedValue = tokenId ? selectedTokenFromId(tokenId) : undefined;
          return { property, value: selectedValue ?? { kind: "css" as const, value }, cssValue: value, important, tokenId, cssVariable };
        }) : [];
      })()
      : Object.entries(rule.declarations).map(([property, declaration]) => {
      const value = selected(definition, store, key, property, declaration.starter);
      const tokenId = value.kind === "token" ? `${value.family}.${value.name}` : undefined;
      return { property, value, cssValue: valueToCss(value, tokenVariables), tokenId, cssVariable: tokenId ? tokenVariables.get(tokenId) : undefined };
      }),
  })),
  });
};

const serializeTokenLayer = (tokens: readonly PrimitiveToken[], scope: ":root" | "[data-framework-preview]") => tokens.length
  ? `@layer tokens {\n  ${scope} {\n${tokens.map((token) => `    ${token.cssName}: ${token.value};`).join("\n")}\n  }\n}`
  : "@layer tokens {\n  /* No authored tokens. */\n}";
const serializeElementLayer = (elements: readonly ResolvedElement[], scope = "") => {
  const body = elements.flatMap((element) => element.rules.map((rule) => {
    const declarations = rule.declarations.filter((item) => item.cssValue !== null);
    if (!declarations.length) return "";
    return `  /* ${element.id}/${rule.id} */\n  ${scope}${rule.selector} {\n${declarations.map((item) => `    ${item.property}: ${item.cssValue}${item.important ? " !important" : ""};`).join("\n")}\n  }`;
  })).filter(Boolean).join("\n");
  return body ? `@layer elements {\n${body}\n}` : "";
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
const advisoryLine = (item: Diagnostic) => {
  const location = [item.elementId ? `Element: ${item.elementId}` : "", item.ruleId ? `state/rule: ${item.ruleId}` : "", item.check ? `check: ${item.check}` : ""].filter(Boolean).join("; ");
  return `- **${item.code}**${location ? ` (${location})` : ""}: ${item.message} Repair: ${item.repair}`;
};
const yamlScalar = (value: string) => JSON.stringify(value);
const markdownHeading = (value: string) => value.replace(/([\\`*_[\]<>#])/g, "\\$1");
const cssCommentValue = (value: string) => value.replace(/\*\//g, "* /").replace(/[\r\n\u0000-\u001f\u007f]+/g, " ");
const serializeContext = (
  input: CompileFrameworkInput,
  elements: readonly ResolvedElement[],
  nativeGuidance: readonly { id: string; title: string; group: string; when: string; semanticHtml: string }[],
  tokensCss: string,
  elementsCss: string,
  frameworkVersion: string,
  contentHash: string,
  advisories: readonly Diagnostic[],
) => `---
frameworkId: ${yamlScalar(input.identity.id)}
frameworkName: ${yamlScalar(input.identity.name)}
frameworkVersion: ${frameworkVersion}
schemaVersion: 2
sourceRevision: ${yamlScalar(input.sourceRevision)}
contentHash: ${contentHash}
generatedBy: https://techies.tools
artifacts:
  tokens: tokens.css
  elements: elements.css
  context: context.md
loadOrder:
  - tokens.css
  - elements.css
---

<!-- Generated by https://techies.tools · Version ${frameworkVersion} · Hash ${contentHash} -->

# ${markdownHeading(input.identity.name)}

The exported Tokens and Element treatments are the Default Treatment baseline. Undeclared presentation and behavior remain browser-native; do not invent Framework CSS. Load \`tokens.css\` before \`elements.css\`, then load targeted consumer CSS only when explicitly requested.

${elements.length ? `## Element Treatments

${elements.map((element) => `### ${element.group} / ${element.title} (\`${element.id}\` ${element.version})

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

` : ""}${nativeGuidance.length ? `## Native Element Decisions

${nativeGuidance.map((item) => `### ${item.group} / ${item.title} (\`${item.id}\` 0.0.0)

**When to use:** ${item.when}

**Semantic HTML:** \`${item.semanticHtml}\`
`).join("\n")}

` : ""}${advisories.some((item) => item.portability !== "app-only") ? `## Compiler advisories

${advisories.filter((item) => item.portability !== "app-only").map(advisoryLine).join("\n")}

` : ""}## Implementation Reference

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
  artifact: "tokens.css" | "elements.css" | "preview.css",
) => `/*${artifact === "elements.css" ? " Requires: tokens.css loaded first.\n  " : ""} Generated by https://techies.tools
   Framework: ${cssCommentValue(input.identity.name)}
   Framework ID: ${cssCommentValue(input.identity.id)}
   Version: ${frameworkVersion}
   Content hash: ${contentHash}
   Source revision: ${cssCommentValue(input.sourceRevision)}
   Artifact: ${artifact}
   Edit Framework preferences in https://techies.tools.
   Direct CSS edits are not round-trippable. */
`;
const textArtifact = (
  name: TextArtifact["name"],
  mimeType: TextArtifact["mimeType"],
  contentHash: string,
  dependencies: TextArtifact["dependencies"],
  value: string,
): TextArtifact => ({ name, mimeType, contentHash, dependencies, value: value.replaceAll("\r\n", "\n").replace(/\n*$/, "\n") });

export const compileFramework = (input: CompileFrameworkInput): FrameworkCompilation => {
  const tokens = resolveTokens(input);
  const tokenVariables = new Map(tokens.map((token) => [token.id, token.cssName]));
  const tokenRegistry = new Map(tokens.map((token) => [token.id, token.type] as const));
  const definitions = orderedDefinitions(input.catalog.elements.flatMap((element) => {
    if (!element.definition) return [];
    const { lifecycle: _lifecycle, rules: _rules, ...guidance } = element;
    return [{ ...guidance, definition: element.definition } as ElementDefinition];
  }));
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
  const safeEffectiveDiffs = effectiveDiffs ? structuredClone(effectiveDiffs) : undefined;
  const cssOverrideDiagnostics: Diagnostic[] = [];
  for (const [elementId, entry] of Object.entries(safeEffectiveDiffs?.entries ?? {})) {
    for (const [rulePath, source] of Object.entries(entry.css ?? {})) {
      const parsed = parseRuleDeclarations({ catalog: input.catalog, rulePath, source, tokens });
      if (parsed.success) continue;
      cssOverrideDiagnostics.push(...parsed.diagnostics);
      delete entry.css?.[rulePath];
    }
    if (entry.css && !Object.keys(entry.css).length) delete entry.css;
    if (!Object.keys(entry.rules).length && !entry.css) delete safeEffectiveDiffs?.entries[elementId];
  }
  const preferenceDiagnostics = input.preferenceDiagnostics ?? [];
  const contextDiagnostics = input.contextDiagnostics ?? [];
  const inputAdvisoryDiagnostics = [...preferenceDiagnostics, ...contextDiagnostics].filter((item) => item.severity === "warning");
  const identityDiagnostics: Diagnostic[] = [];
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(input.identity.id)) {
    identityDiagnostics.push(diagnostic("identity.id", `Framework ID '${input.identity.id}' is not a portable slug.`, "Use lowercase letters and numbers separated by single hyphens.", ["preview", "tokens", "elements", "context"], { check: "framework-id" }));
  }
  if (!input.identity.name.trim() || input.identity.name !== input.identity.name.trim() || /[\u0000-\u001f\u007f]/.test(input.identity.name)) {
    identityDiagnostics.push(diagnostic("identity.name", "Framework name must be non-empty, single-line text without leading or trailing whitespace.", "Enter a stable single-line display name and remove control or surrounding whitespace.", ["preview", "tokens", "elements", "context"], { check: "framework-name" }));
  }
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
    if (!stableVersion(definition.version)) return [];
    if (definition.baseline.status !== "widely-available") return [diagnostic("element.activation-baseline", `Active ${definition.id} is not MDN Baseline Widely available.`, "Return it to Draft or record reviewed Baseline evidence.", ["elements", "context"], { elementId: definition.id })];
    if (!definition.activationEvidence) return [diagnostic("element.activation-evidence", `Active ${definition.id} lacks complete Activation Evidence.`, "Complete every source-controlled hard gate or return it to Draft.", ["elements", "context"], { elementId: definition.id, check: "activation-evidence" })];
    return [];
  });
  const activeIdsForDiagnostics = new Set<string>(definitions.filter((definition) => stableVersion(definition.version)).map((definition) => definition.id));
  const activeAuthoredDiagnostics = authoredDiagnostics.filter((item) => !item.elementId || activeIdsForDiagnostics.has(item.elementId));
  const activePreferenceDiagnostics = [...overrideDiagnostics, ...cssOverrideDiagnostics, ...preferenceDiagnostics]
    .filter((item) => item.severity !== "warning")
    .filter((item) => !item.elementId || activeIdsForDiagnostics.has(item.elementId));
  const blockingElementDiagnostics = [...activeAuthoredDiagnostics, ...activePreferenceDiagnostics, ...eligibilityDiagnostics];
  const blockingContextDiagnostics = contextDiagnostics.filter((item) => item.severity !== "warning");

  const resolvedElements = parsedDefinitions.map((definition) => resolveElement(definition, safeEffectiveDiffs, tokenVariables));
  const activeIds = new Set(input.catalog.elements.filter((element) => element.lifecycle === "Active").map((element) => element.id));
  const activeElements = resolvedElements.filter((element) => activeIds.has(element.id));
  const nativeGuidance = input.catalog.elements.flatMap((element) =>
    element.lifecycle === "Native" && element.contextGuidance
      ? [{ id: element.id, title: element.title, group: element.group, when: element.contextGuidance, semanticHtml: element.semanticHtml }]
      : []);
  const resolved = deepFreeze({ identity: { ...input.identity }, primitives: tokens, elements: resolvedElements }) as Readonly<ResolvedFramework>;
  const contrastChecks: ContrastCheck[] = input.catalog.elements.flatMap((element) =>
    element.lifecycle === "Active" ? (element.definition?.contrastChecks ?? []).map((check) => {
      const location = (item: typeof check.subject) => {
        const rulePath = `${element.id}/${item.ruleId}`;
        const declaration = element.rules.find((rule) => rule.path === rulePath)?.rule.declarations[item.property];
        const compatibleTokenIds = declaration?.control.kind === "token"
          ? declaration.control.options.map((option) => `${option.family}.${option.name}`)
          : [];
        return { rulePath, property: item.property, editable: item.editable, compatibleTokenIds };
      };
      return {
        id: check.id,
        elementId: element.id,
        kind: check.kind,
        subject: location(check.subject),
        comparison: location(check.comparison),
      };
    }) : []);
  const accessibilityAdvisories = evaluateContrastChecks({ framework: resolved, checks: contrastChecks });
  const accessibilityDiagnostics: Diagnostic[] = accessibilityAdvisories.map((advisory) => ({
    code: "accessibility.contrast",
    message: advisory.message,
    repair: "Review the existing-token improvements before export.",
    channels: ["preview", "elements", "context"],
    elementId: advisory.elementId,
    check: advisory.id,
    severity: "warning",
    portability: "app-only",
  }));
  const advisoryDiagnostics = [...inputAdvisoryDiagnostics, ...accessibilityDiagnostics];
  const fontImport = googleFontsImport(input.primitiveSnapshot?.type);
  const identityContent = { identity: resolved.identity, primitives: resolved.primitives, elements: activeElements, nativeGuidance, fontImport };
  const contentHash = hash(identityContent);
  const frameworkVersion = `1.0.${Number.parseInt(contentHash, 16)}`;
  const tokensBody = [fontImport, "@layer tokens, elements, components;", serializeTokenLayer(tokens, ":root")].filter(Boolean).join("\n\n") + "\n";
  const elementsBody = [
    "@layer tokens, elements, components;",
    serializeElementLayer(activeElements) || "/* No Active Treatments; Native Fallback applies. */",
  ].join("\n\n") + "\n";
  const previewBody = [fontImport, serializeCssBody(tokens, activeElements, true)].filter(Boolean).join("\n\n");
  const tokensArtifact = textArtifact("tokens.css", "text/css;charset=utf-8", contentHash, [], artifactHeader(input, frameworkVersion, contentHash, "tokens.css") + tokensBody);
  const elementsArtifact = textArtifact("elements.css", "text/css;charset=utf-8", contentHash, ["tokens.css"], artifactHeader(input, frameworkVersion, contentHash, "elements.css") + elementsBody);
  const contextArtifact = textArtifact("context.md", "text/markdown;charset=utf-8", contentHash, [], serializeContext(input, activeElements, nativeGuidance, tokensArtifact.value, elementsArtifact.value, frameworkVersion, contentHash, advisoryDiagnostics));
  const previewCss = artifactHeader(input, frameworkVersion, contentHash, "preview.css") + previewBody;
  const diagnostics = deepFreeze([...identityDiagnostics, ...primitiveDiagnostics, ...authoredDiagnostics, ...overrideDiagnostics, ...cssOverrideDiagnostics, ...preferenceDiagnostics, ...eligibilityDiagnostics, ...contextDiagnostics, ...accessibilityDiagnostics]);
  const primitivesBlocked = identityDiagnostics.length > 0 || primitiveDiagnostics.length > 0;
  const elementsAndContextBlocked = primitivesBlocked || blockingElementDiagnostics.length > 0;
  const contextBlocked = elementsAndContextBlocked || blockingContextDiagnostics.length > 0;

  return deepFreeze({
    resolved,
    preview: primitivesBlocked ? block([...identityDiagnostics, ...primitiveDiagnostics]) : { available: true, value: { css: previewCss, scope: "[data-framework-preview]", contentHash } },
    artifacts: {
      tokens: primitivesBlocked ? block([...identityDiagnostics, ...primitiveDiagnostics]) : { available: true, value: tokensArtifact },
      elements: elementsAndContextBlocked ? block([...identityDiagnostics, ...primitiveDiagnostics, ...blockingElementDiagnostics]) : { available: true, value: elementsArtifact },
      context: contextBlocked ? block([...identityDiagnostics, ...primitiveDiagnostics, ...blockingElementDiagnostics, ...blockingContextDiagnostics]) : { available: true, value: contextArtifact },
    },
    diagnostics,
    accessibilityAdvisories,
    identity: { frameworkVersion, sourceRevision: input.sourceRevision, contextSchemaVersion: "2", contentHash },
  }) as FrameworkCompilation;
};

export const compileDraftSpecimen = (input: CompileDraftSpecimenInput): DraftSpecimenCompilation => {
  if (input.element.lifecycle !== "Draft" || !input.element.definition) return {
    css: "",
    diagnostics: [diagnostic("draft.lifecycle", `${input.element.id} is not a Draft Treatment.`, "Use isolated specimens only for 0.x.x Draft Treatments.", ["preview"], { elementId: input.element.id })],
  };
  const primitives = Array.isArray(input.primitives) ? input.primitives : fallbackTokens(input.primitives as Readonly<Record<string, string>>);
  const registry = new Map(primitives.map((token) => [token.id, token.type] as const));
  const { lifecycle: _lifecycle, rules: _rules, ...guidance } = input.element;
  const parsed = parseElementDefinition({ ...guidance, definition: input.element.definition }, registry);
  if (!parsed.success) return { css: "", diagnostics: parsed.diagnostics };
  const tokenVariables = new Map(primitives.map((token) => [token.id, token.cssName]));
  const element = resolveElement(parsed.data as ElementDefinition, input.elementDiffs, tokenVariables);
  return { css: `@layer elements {\n${serializeElementLayer([element], `[data-framework-draft-specimen="${element.id}"] `).replace(/^@layer elements \{|\n}$/g, "")}\n}\n`, diagnostics: [] };
};
