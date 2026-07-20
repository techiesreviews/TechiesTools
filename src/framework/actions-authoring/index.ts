import {
  deepFreeze,
  ruleFor,
  selectedValueIsAllowed,
  type Declaration,
  type Diagnostic,
  type ElementDefinition,
  type ParseResult,
  type SelectedValue,
  type TokenRegistry,
} from "../model/index.ts";
import { parseCssDeclarationList, type ParsedCssDeclaration } from "../css-declarations/index.ts";
import { lexer } from "css-tree/dist/csstree.esm";

export type TreatmentToken = {
  id: string;
  cssName: string;
  value: string;
  type: "color" | "dimension" | "string";
};

export type RuleDeclarationEdit = {
  elementId: ElementDefinition["id"];
  ruleId: string;
  source: string;
  declarations: readonly ParsedCssDeclaration[];
  values: Readonly<Record<string, SelectedValue>>;
};

export type AuthoringDiagnostic = Diagnostic & { checklist: readonly string[] };

export type PropertyCompletion = {
  kind: "property";
  label: string;
  insertText: string;
  detail: string;
};

export type TokenCompletion = {
  kind: "token";
  label: string;
  insertText: string;
  detail: string;
  resolvedValue: string;
  swatch?: string;
  tokenId: string;
  group: "scope" | "available";
};

export type ChoiceCompletion = {
  kind: "choice";
  label: string;
  insertText: string;
  detail: string;
};

export type RuleDeclarationCompletion = PropertyCompletion | TokenCompletion | ChoiceCompletion;

type RuleInput = {
  definition: ElementDefinition;
  ruleId: string;
  tokens: readonly TreatmentToken[];
};

type ParseInput = RuleInput & { source: string };
type SerializeInput = RuleInput & { values?: Readonly<Record<string, SelectedValue>> };
type CompletionInput = ParseInput & { offset: number };

const checklist = deepFreeze([
  "Write CSS declarations only; the selector and braces are locked.",
  "Put a colon after the property.",
  "End each line with a semicolon.",
  "Remove at-rules and external-resource functions such as url() or image-set().",
]);
const layoutRiskProperties = /^(?:display|position|float|clear|overflow(?:-[xy])?|contain|container(?:-name|-type)?|columns?|column-.+|flex(?:-.+)?|grid(?:-.+)?|place-.+|align-.+|justify-.+|order|inset|inset-.+|top|right|bottom|left|width|height|min-.+|max-.+)$/;

const diagnostic = (
  code: string,
  message: string,
  repair: string,
  definition: ElementDefinition,
  ruleId: string,
  property?: string,
  severity: "error" | "warning" = "error",
): AuthoringDiagnostic => ({
  code,
  message,
  repair,
  channels: ["preview", "css", "context"],
  elementId: definition.id,
  ruleId,
  property,
  severity,
  checklist,
});

const registryFor = (tokens: readonly TreatmentToken[]): TokenRegistry => new Map(tokens.map((token) => [token.id, token.type]));

const tokenValue = (token: TreatmentToken): SelectedValue | undefined => {
  const dot = token.id.indexOf(".");
  if (dot < 1 || dot === token.id.length - 1) return undefined;
  const family = token.id.slice(0, dot);
  if (!(["semantic", "color", "typography", "spacing", "radius"] as const).includes(family as never)) return undefined;
  return { kind: "token", family: family as "semantic" | "color" | "typography" | "spacing" | "radius", name: token.id.slice(dot + 1) };
};

const parseValue = (
  raw: string,
  declaration: Declaration,
  tokensByCssName: ReadonlyMap<string, TreatmentToken>,
  registry: TokenRegistry,
): SelectedValue | undefined => {
  if (declaration.control.kind === "token") {
    const match = /^var\((--[a-z0-9-]+)\)$/.exec(raw);
    if (!match) return undefined;
    const token = tokensByCssName.get(match[1]);
    const value = token && tokenValue(token);
    return value && selectedValueIsAllowed(value, declaration, registry) ? value : undefined;
  }
  const value: SelectedValue = declaration.control.kind === "choice"
    ? { kind: "choice", value: raw }
    : { kind: "length", value: raw };
  return selectedValueIsAllowed(value, declaration, registry) ? value : undefined;
};

/** Parse declaration-only source. Selectors stay owned by the reviewed definition. */
export const parseRuleDeclarations = (input: ParseInput): ParseResult<RuleDeclarationEdit> => {
  const rule = ruleFor(input.definition, input.ruleId);
  if (!rule) return {
    success: false,
    diagnostics: [diagnostic("authoring.rule", "This rule is not available.", "Choose a listed rule.", input.definition, input.ruleId)],
  };

  const parsed = parseCssDeclarationList(input.source);
  if (!parsed.success) return {
    success: false,
    diagnostics: deepFreeze(parsed.issues.map((issue) => diagnostic(
      issue.kind === "external-resource" ? "authoring.external-resource" : issue.kind === "grammar" ? "authoring.value" : "authoring.syntax",
      issue.message,
      issue.kind === "external-resource" ? "Remove external-resource functions or src-like declarations; use local tokens and generated CSS values." : "Fix the declaration syntax. The last valid Preview remains applied.",
      input.definition,
      input.ruleId,
      issue.property,
    ))),
  };

  const tokensByCssName = new Map<string, TreatmentToken>();
  for (const token of input.tokens) {
    if (!/^--[a-z0-9-]+$/.test(token.cssName) || tokensByCssName.has(token.cssName)) continue;
    tokensByCssName.set(token.cssName, token);
  }
  const registry = registryFor(input.tokens);
  const values: Record<string, SelectedValue> = {};
  const diagnostics: AuthoringDiagnostic[] = [];
  for (const { property, value, important } of parsed.declarations) {
    const declaration = rule.declarations[property];
    const selected = declaration && !important ? parseValue(value, declaration, tokensByCssName, registry) : undefined;
    if (selected) values[property] = selected;
    if (layoutRiskProperties.test(property)) diagnostics.push(diagnostic(
      "authoring.layout-risk",
      `Layout property '${property}' can change component structure and responsive behavior.`,
      "Review the affected Element at supported viewport sizes. The declaration is applied.",
      input.definition,
      input.ruleId,
      property,
      "warning",
    ));
  }
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    if (declaration.allowOmit && !parsed.declarations.some((item) => item.property === property)) values[property] = { kind: "omit" };
  }

  return { success: true, data: deepFreeze({ elementId: input.definition.id, ruleId: input.ruleId, source: parsed.source, declarations: parsed.declarations, values }), diagnostics: deepFreeze(diagnostics) };
};

const valueToSource = (value: SelectedValue, tokensById: ReadonlyMap<string, TreatmentToken>): string | undefined => {
  if (value.kind === "omit") return undefined;
  if (value.kind === "choice" || value.kind === "length") return value.value;
  const token = tokensById.get(`${value.family}.${value.name}`);
  return token && /^--[a-z0-9-]+$/.test(token.cssName) ? `var(${token.cssName})` : undefined;
};

/** Serialize effective values in authored property order. Omitted declarations disappear. */
export const serializeRuleDeclarations = (input: SerializeInput): ParseResult<string> => {
  const rule = ruleFor(input.definition, input.ruleId);
  if (!rule) return {
    success: false,
    diagnostics: [diagnostic("authoring.rule", "This rule is not available.", "Choose a listed rule.", input.definition, input.ruleId)],
  };
  const tokensById = new Map(input.tokens.map((token) => [token.id, token]));
  const registry = registryFor(input.tokens);
  const diagnostics: AuthoringDiagnostic[] = [];
  const lines: string[] = [];
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    const value = input.values?.[property] ?? declaration.starter;
    if (!selectedValueIsAllowed(value, declaration, registry)) {
      diagnostics.push(diagnostic("authoring.value", `The value for '${property}' is not available.`, "Choose a listed value.", input.definition, input.ruleId, property));
      continue;
    }
    const source = valueToSource(value, tokensById);
    if (value.kind !== "omit" && !source) {
      diagnostics.push(diagnostic("authoring.token", `The token for '${property}' is not available.`, "Choose a current listed token.", input.definition, input.ruleId, property));
      continue;
    }
    if (source) lines.push(`${property}: ${source};`);
  }
  return diagnostics.length
    ? { success: false, diagnostics: deepFreeze(diagnostics) }
    : { success: true, data: lines.join("\n"), diagnostics: [] };
};

const resolveToken = (token: TreatmentToken, byCssName: ReadonlyMap<string, TreatmentToken>, visited = new Set<string>()): string => {
  if (visited.has(token.id)) return token.value;
  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(token.value)?.[1];
  const next = reference && byCssName.get(reference);
  if (!next) return token.value;
  visited.add(token.id);
  return resolveToken(next, byCssName, visited);
};

const propertyCatalog = Object.keys((lexer as unknown as { properties: Record<string, unknown> }).properties)
  .filter((property) => property !== "--*" && /^[a-z][a-z0-9-]*$/.test(property));
const commonPropertyOrder = [
  "background", "background-color", "background-image", "background-position", "background-size", "background-repeat", "background-attachment", "background-origin", "background-clip", "background-blend-mode", "background-position-x", "background-position-y",
  "color", "border", "border-color", "border-width", "border-style", "border-radius", "padding", "padding-block", "padding-inline", "margin", "margin-block", "margin-inline", "display", "position", "width", "height", "gap", "font", "font-size", "line-height", "text-decoration", "outline", "opacity", "transform", "transition",
] as const;
const compatibleTokenType = (property: string): TreatmentToken["type"] | undefined => {
  if (/(?:^|-)color$|^(?:background|border|outline|fill|stroke|caret-color|accent-color|text-shadow|box-shadow)$/.test(property)) return "color";
  if (/^(?:padding|margin|gap|row-gap|column-gap|width|height|min-|max-|inset|top$|right$|bottom$|left$|border-radius|border-width|outline-width|outline-offset|font-size|line-height)/.test(property)) return "dimension";
  return undefined;
};
const borderStyleKeywords = ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"] as const;
const valueKeywordCatalog = [
  { property: /^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-style)?$/, keywords: borderStyleKeywords },
] as const;
const keywordsFor = (property: string) => valueKeywordCatalog.find((entry) => entry.property.test(property))?.keywords ?? [];

const tokenCompletions = (property: string, prefix: string, declaration: Declaration | undefined, tokens: readonly TreatmentToken[]) => {
  const byCssName = new Map(tokens.map((token) => [token.cssName, token]));
  const scopeIds = declaration?.control.kind === "token" ? declaration.control.options.map((option) => `${option.family}.${option.name}`) : [];
  const query = prefix.slice(2);
  const available = tokens.filter((token) => token.cssName.slice(2).includes(query));
  const scope = scopeIds.flatMap((id) => {
    const token = available.find((item) => item.id === id);
    return token ? [token] : [];
  });
  const expectedType = compatibleTokenType(property);
  const compatible = available.filter((token) => !scopeIds.includes(token.id) && token.type === expectedType).sort((left, right) => left.id.localeCompare(right.id));
  const rest = available.filter((token) => !scopeIds.includes(token.id) && token.type !== expectedType).sort((left, right) => left.id.localeCompare(right.id));
  return deepFreeze([...scope, ...compatible, ...rest].map((token) => {
    const resolvedValue = resolveToken(token, byCssName);
    return {
      kind: "token" as const,
      label: token.cssName,
      insertText: `var(${token.cssName})`,
      detail: resolvedValue,
      resolvedValue,
      ...(token.type === "color" ? { swatch: resolvedValue } : {}),
      tokenId: token.id,
      group: scopeIds.includes(token.id) ? "scope" as const : "available" as const,
    };
  }));
};

/** Complete the editable declaration source. Selector text is never part of this API. */
export const completeRuleDeclaration = (input: CompletionInput): readonly RuleDeclarationCompletion[] => {
  const rule = ruleFor(input.definition, input.ruleId);
  if (!rule) return [];
  const before = input.source.slice(0, Math.max(0, Math.min(input.offset, input.source.length)));
  const segmentStart = Math.max(before.lastIndexOf(";"), before.lastIndexOf("\n"));
  const segment = before.slice(segmentStart + 1);
  const colon = segment.indexOf(":");
  if (colon === -1) {
    const prefix = segment.trim();
    if (!/^(?:--[a-z0-9-]*|-?[a-z][a-z0-9-]*)?$/.test(prefix)) return [];
    const currentSegmentIndex = before.split(/[;\n]/).length - 1;
    const alreadyDeclared = new Set(input.source.split(/[;\n]/).flatMap((item, index) => {
      if (index === currentSegmentIndex) return [];
      const match = /^\s*((?:--[a-z0-9-]+|-?[a-z][a-z0-9-]*))\s*:/.exec(item);
      return match ? [match[1]] : [];
    }));
    if (prefix.startsWith("--")) return [];
    const reviewed = new Map(Object.entries(rule.declarations).map(([property, declaration], index) => [property, { declaration, index }]));
    const candidates = propertyCatalog.filter((property) => property.startsWith(prefix) && !alreadyDeclared.has(property));
    const familyRoot = prefix ? candidates.find((property) => commonPropertyOrder.includes(property as typeof commonPropertyOrder[number]) && candidates.some((candidate) => candidate.startsWith(`${property}-`))) : undefined;
    return deepFreeze(candidates.sort((left, right) => {
      const rank = (property: string) => property === familyRoot ? 0
        : reviewed.has(property) ? 100 + reviewed.get(property)!.index
          : commonPropertyOrder.includes(property as typeof commonPropertyOrder[number]) ? 1000 + commonPropertyOrder.indexOf(property as typeof commonPropertyOrder[number])
            : 10000;
      return rank(left) - rank(right) || left.localeCompare(right);
    }).map((property) => ({
      kind: "property" as const,
      label: property,
      insertText: `${property}: `,
      detail: reviewed.get(property)?.declaration.label ?? "CSS property",
    })));
  }

  const property = segment.slice(0, colon).trim();
  const declaration = rule.declarations[property];
  const valuePrefix = segment.slice(colon + 1).trim();
  const tokenPrefix = /--[a-z0-9-]*$/.exec(valuePrefix)?.[0];
  if (tokenPrefix) return tokenCompletions(property, tokenPrefix, declaration, input.tokens);
  const keywordPrefix = /-?[a-z][a-z0-9-]*$/.exec(valuePrefix)?.[0] ?? "";
  const keywords = keywordsFor(property);
  if (keywords.length && keywordPrefix) return deepFreeze(keywords
    .filter((keyword) => keyword.startsWith(keywordPrefix))
    .map((keyword) => ({ kind: "choice" as const, label: keyword, insertText: keyword, detail: "Border style keyword" })));
  if (declaration?.control.kind === "choice" && !valuePrefix.startsWith("--")) return deepFreeze(declaration.control.options
    .filter((option) => option.value.startsWith(valuePrefix))
    .map((option) => ({ kind: "choice" as const, label: option.value, insertText: option.value, detail: option.label })));
  return [];
};
