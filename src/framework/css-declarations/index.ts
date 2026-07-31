import { generate, parse, walk } from "css-tree/dist/csstree.esm";
import type { Declaration, DeclarationList } from "css-tree";

export type ParsedCssDeclaration = {
  property: string;
  value: string;
  important: boolean;
};

export type DeclarationParseIssue = {
  kind: "syntax" | "external-resource";
  message: string;
  property?: string;
};

export type DeclarationParseResult =
  | { success: true; source: string; declarations: readonly ParsedCssDeclaration[] }
  | { success: false; issues: readonly DeclarationParseIssue[] };

/** Return the declaration that wins within one rule: last important, else last normal. */
export const effectiveDeclarationIndex = (
  declarations: readonly Readonly<{ property: string; important?: boolean }>[],
  property: string,
): number => {
  let normal = -1;
  let important = -1;
  const customProperty = property.startsWith("--");
  declarations.forEach((declaration, index) => {
    const matches = customProperty || declaration.property.startsWith("--")
      ? declaration.property === property
      : declaration.property.toLowerCase() === property.toLowerCase();
    if (!matches) return;
    if (declaration.important) important = index;
    else normal = index;
  });
  return important >= 0 ? important : normal;
};

const externalFunction = /^(?:url|image-set|-webkit-image-set|cross-fade|element)$/i;
const srcLikeProperty = /^(?:src)$/i;

const hasExternalResource = (declaration: Declaration, value: string) => {
  if (srcLikeProperty.test(declaration.property)) return true;
  if (/\b(?:url|image-set|-webkit-image-set)\s*\(/i.test(value)) return true;
  let external = false;
  walk(declaration.value, (node) => {
    if (node.type === "Url" || (node.type === "Function" && externalFunction.test(node.name))) external = true;
  });
  return external;
};

/** Parse only a locked declaration list. Selectors, braces, and at-rules cannot survive this context. */
export const parseCssDeclarationList = (source: string): DeclarationParseResult => {
  const parseErrors: Error[] = [];
  let ast: DeclarationList;
  try {
    ast = parse(source, {
      context: "declarationList",
      positions: true,
      parseValue: true,
      parseCustomProperty: true,
      onParseError: (error) => parseErrors.push(error),
    }) as DeclarationList;
  } catch (error) {
    return { success: false, issues: [{ kind: "syntax", message: error instanceof Error ? error.message : "Invalid CSS declaration syntax." }] };
  }
  if (parseErrors.length) return { success: false, issues: parseErrors.map((error) => ({ kind: "syntax" as const, message: error.message })) };

  const declarations: ParsedCssDeclaration[] = [];
  const issues: DeclarationParseIssue[] = [];
  ast.children.forEach((node) => {
    if (node.type !== "Declaration") {
      issues.push({ kind: "syntax", message: "Only CSS declarations are allowed inside the locked rule." });
      return;
    }
    const value = generate(node.value, { mode: "spec" });
    if (hasExternalResource(node, value)) {
      issues.push({ kind: "external-resource", property: node.property, message: `External-resource CSS is blocked for '${node.property}'.` });
      return;
    }
    declarations.push({ property: node.property, value, important: Boolean(node.important) });
  });
  if (issues.length) return { success: false, issues };
  return {
    success: true,
    declarations,
    source: declarations.map(({ property, value, important }) => `${property}: ${value}${important ? " !important" : ""};`).join("\n"),
  };
};
