import {
  deepFreeze,
  selectedValueIsAllowed,
  type Declaration,
  type Diagnostic,
  type ElementDefinition,
  type ParseResult,
  type SelectedValue,
  type TokenRegistry,
} from "../model/index.ts";
import type { ElementCatalog } from "../catalog/index.ts";
import { parseCssDeclarationList, type ParsedCssDeclaration } from "../css-declarations/index.ts";

export type TreatmentToken = {
  id: string;
  cssName: string;
  value: string;
  type: "color" | "dimension" | "string";
};

export type RuleDeclarationEdit = {
  elementId: string;
  rulePath: string;
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
  catalog: ElementCatalog;
  rulePath: string;
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
const diagnostic = (
  code: string,
  message: string,
  repair: string,
  elementId: string,
  rulePath: string,
  property?: string,
  severity: "error" | "warning" = "error",
): AuthoringDiagnostic => ({
  code,
  message,
  repair,
  channels: ["preview", "elements", "context"],
  elementId,
  ruleId: rulePath,
  property,
  severity,
  checklist,
});

const registryFor = (tokens: readonly TreatmentToken[]): TokenRegistry => new Map(tokens.map((token) => [token.id, token.type]));

const resolveRuleInput = (input: RuleInput) => {
  const catalogRule = input.catalog.rule(input.rulePath);
  const element = catalogRule && input.catalog.get(catalogRule.elementId);
  const definition = element?.definition ? { ...element, definition: element.definition } as ElementDefinition : undefined;
  return { catalogRule, definition, elementId: element?.id ?? input.rulePath.split("/")[0] ?? "" };
};

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
  const resolved = resolveRuleInput(input);
  const rule = resolved.catalogRule?.rule;
  if (!rule || !resolved.definition) return {
    success: false,
    diagnostics: [diagnostic("authoring.rule", "This rule is not available.", "Choose a listed Treatment Rule Path.", resolved.elementId, input.rulePath)],
  };

  const parsed = parseCssDeclarationList(input.source);
  if (!parsed.success) return {
    success: false,
    diagnostics: deepFreeze(parsed.issues.map((issue) => diagnostic(
      issue.kind === "external-resource" ? "authoring.external-resource" : issue.kind === "grammar" ? "authoring.value" : "authoring.syntax",
      issue.message,
      issue.kind === "external-resource" ? "Remove external-resource functions or src-like declarations; use local tokens and generated CSS values." : "Fix the declaration syntax. The last valid Preview remains applied.",
      resolved.elementId,
      input.rulePath,
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
  const seen = new Set<string>();
  for (const { property, value, important } of parsed.declarations) {
    const declaration = rule.declarations[property];
    const selected = declaration && !important ? parseValue(value, declaration, tokensByCssName, registry) : undefined;
    if (seen.has(property)) diagnostics.push(diagnostic("authoring.duplicate-property", `Property '${property}' appears more than once.`, "Keep one unambiguous declaration for each authored property.", resolved.elementId, input.rulePath, property));
    else if (!declaration) diagnostics.push(diagnostic("authoring.property", `Property '${property}' is not owned by this Treatment Rule.`, "Use only properties offered by the current Treatment Definition.", resolved.elementId, input.rulePath, property));
    else if (important) diagnostics.push(diagnostic("authoring.important", `Property '${property}' cannot use !important.`, "Remove !important; the immutable low-specificity selector and layer order own precedence.", resolved.elementId, input.rulePath, property));
    else if (!selected) diagnostics.push(diagnostic("authoring.value", `Value '${value}' is not admitted for '${property}'.`, "Choose an existing offered Token, keyword, or safe length.", resolved.elementId, input.rulePath, property));
    else values[property] = selected;
    seen.add(property);
  }
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    if (declaration.allowOmit && !parsed.declarations.some((item) => item.property === property)) values[property] = { kind: "omit" };
    else if (!declaration.allowOmit && !parsed.declarations.some((item) => item.property === property)) diagnostics.push(diagnostic(
      "authoring.missing",
      `Required property '${property}' is missing.`,
      "Restore the authored property or reset this Treatment Rule.",
      resolved.elementId,
      input.rulePath,
      property,
    ));
  }

  return diagnostics.length
    ? { success: false, diagnostics: deepFreeze(diagnostics) }
    : { success: true, data: deepFreeze({ elementId: resolved.definition.id, rulePath: input.rulePath, source: parsed.source, declarations: parsed.declarations, values }), diagnostics: [] };
};

const valueToSource = (value: SelectedValue, tokensById: ReadonlyMap<string, TreatmentToken>): string | undefined => {
  if (value.kind === "omit") return undefined;
  if (value.kind === "choice" || value.kind === "length") return value.value;
  const token = tokensById.get(`${value.family}.${value.name}`);
  return token && /^--[a-z0-9-]+$/.test(token.cssName) ? `var(${token.cssName})` : undefined;
};

/** Serialize effective values in authored property order. Omitted declarations disappear. */
export const serializeRuleDeclarations = (input: SerializeInput): ParseResult<string> => {
  const resolved = resolveRuleInput(input);
  const rule = resolved.catalogRule?.rule;
  if (!rule || !resolved.definition) return {
    success: false,
    diagnostics: [diagnostic("authoring.rule", "This rule is not available.", "Choose a listed Treatment Rule Path.", resolved.elementId, input.rulePath)],
  };
  const tokensById = new Map(input.tokens.map((token) => [token.id, token]));
  const registry = registryFor(input.tokens);
  const diagnostics: AuthoringDiagnostic[] = [];
  const lines: string[] = [];
  for (const [property, declaration] of Object.entries(rule.declarations)) {
    const value = input.values?.[property] ?? declaration.starter;
    if (!selectedValueIsAllowed(value, declaration, registry)) {
      diagnostics.push(diagnostic("authoring.value", `The value for '${property}' is not available.`, "Choose a listed value.", resolved.elementId, input.rulePath, property));
      continue;
    }
    const source = valueToSource(value, tokensById);
    if (value.kind !== "omit" && !source) {
      diagnostics.push(diagnostic("authoring.token", `The token for '${property}' is not available.`, "Choose a current listed token.", resolved.elementId, input.rulePath, property));
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

const borderStyleKeywords = ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"] as const;
const valueKeywordCatalog = [
  { property: /^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-style)?$/, keywords: borderStyleKeywords },
] as const;
const keywordsFor = (property: string) => valueKeywordCatalog.find((entry) => entry.property.test(property))?.keywords ?? [];

const tokenCompletions = (prefix: string, declaration: Declaration | undefined, tokens: readonly TreatmentToken[]) => {
  const byCssName = new Map(tokens.map((token) => [token.cssName, token]));
  const scopeIds = declaration?.control.kind === "token" ? declaration.control.options.map((option) => `${option.family}.${option.name}`) : [];
  const query = prefix.slice(2);
  const available = tokens.filter((token) => token.cssName.slice(2).includes(query));
  const scope = scopeIds.flatMap((id) => {
    const token = available.find((item) => item.id === id);
    return token ? [token] : [];
  });
  return deepFreeze(scope.map((token) => {
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
  const rule = resolveRuleInput(input).catalogRule?.rule;
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
    const candidates = [...reviewed.keys()].filter((property) => property.startsWith(prefix) && !alreadyDeclared.has(property));
    return deepFreeze(candidates.sort((left, right) => reviewed.get(left)!.index - reviewed.get(right)!.index).map((property) => ({
      kind: "property" as const,
      label: property,
      insertText: `${property}: `,
      detail: reviewed.get(property)!.declaration.label,
    })));
  }

  const property = segment.slice(0, colon).trim();
  const declaration = rule.declarations[property];
  const valuePrefix = segment.slice(colon + 1).trim();
  const tokenPrefix = /--[a-z0-9-]*$/.exec(valuePrefix)?.[0];
  if (tokenPrefix) return tokenCompletions(tokenPrefix, declaration, input.tokens);
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
