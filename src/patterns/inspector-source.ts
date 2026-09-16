import { generate, parse, walk } from "css-tree/dist/csstree.esm";
import type { Rule, SelectorList, StyleSheet } from "css-tree";

export interface ScopedSelectorMatch { selector: string; scope?: string; }

export interface SourceRange { start: number; end: number; }

/** Resolve one CSSOM nesting selector for matching while retaining its authored source form. */
export const resolveNestedSelector = (selector: string, parentSelector?: string) => {
  if (!parentSelector) return selector;
  const parent = `:is(${parentSelector})`;
  return selector.includes("&") ? selector.replaceAll("&", parent) : `${parent} ${selector}`;
};

const sourceRangeIndent = (source: string, range: SourceRange | null) => {
  if (!range) return "";
  const lineStart = source.lastIndexOf("\n", Math.max(0, range.start - 1)) + 1;
  const prefix = source.slice(lineStart, range.start);
  return /^\s*$/.test(prefix) ? prefix : "";
};

/** Present a nested source range with indentation rebased to the selected fragment. */
export const sourceRangeFragment = (source: string, range: SourceRange | null) => {
  if (!range) return "";
  const indent = sourceRangeIndent(source, range);
  return source.slice(range.start, range.end).split("\n")
    .map((line, index) => index > 0 && indent && line.startsWith(indent) ? line.slice(indent.length) : line)
    .join("\n");
};

/** Replace a projected source fragment without losing the surrounding document. */
export const replaceSourceRange = (source: string, range: SourceRange | null, replacement: string) => {
  if (!range) return source;
  const indent = sourceRangeIndent(source, range);
  const restored = indent ? replacement.replaceAll("\n", `\n${indent}`) : replacement;
  return `${source.slice(0, range.start)}${restored}${source.slice(range.end)}`;
};

/** Locate an authored element by DOM preorder without rewriting the source. */
export const htmlElementRange = (source: string, elementIndex: number): SourceRange | null => {
  let index = -1;
  let target: (SourceRange & { tag:string; selfClosing:boolean }) | null = null;
  let targetDepth = 0;
  for (let cursor = 0; cursor < source.length; cursor += 1) {
    if (source[cursor] !== "<") continue;
    if (source.startsWith("<!--", cursor)) {
      const commentEnd = source.indexOf("-->", cursor + 4);
      if (commentEnd < 0) return null;
      cursor = commentEnd + 2;
      continue;
    }
    const closing = source[cursor + 1] === "/";
    const nameStart = cursor + (closing ? 2 : 1);
    const tag = source.slice(nameStart).match(/^[a-z][\w:-]*/i)?.[0]?.toLowerCase();
    if (!tag) continue;
    let quote = "";
    for (let end = cursor + 1; end < source.length; end += 1) {
      const character = source[end];
      if ((character === '"' || character === "'") && (!quote || quote === character)) quote = quote ? "" : character;
      if (character !== ">" || quote) continue;
      if (!closing) {
        index += 1;
        const selfClosing = source.slice(cursor, end).trimEnd().endsWith("/") || /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag);
        if (target && tag === target.tag && !selfClosing) targetDepth += 1;
        if (index === elementIndex) {
          target = { start:cursor, end:end + 1, tag, selfClosing };
          if (selfClosing) return target;
        }
      } else if (target && tag === target.tag) {
        if (targetDepth > 0) targetDepth -= 1;
        else return { start:target.start, end:end + 1 };
      }
      cursor = end;
      break;
    }
  }
  return target;
};

/** Locate the first matching authored rule emitted by the live stylesheet. */
export const cssRuleRange = (source: string, selectors: readonly (string | ScopedSelectorMatch)[]): SourceRange | null => {
  const canonicalSelector = (selector: string) => {
    try { return generate(parse(selector, { context:"selectorList" }) as SelectorList); }
    catch { return selector.trim().replace(/\s+/g, " "); }
  };
  const candidates = selectors.map((item) => typeof item === "string" ? { selector: canonicalSelector(item) } : {
    selector: canonicalSelector(item.selector), scope: item.scope ? canonicalSelector(item.scope) : undefined,
  });
  try {
    const stylesheet = parse(source, { positions:true }) as StyleSheet;
    let match: SourceRange | null = null;
    const scopes: { start: number; end: number; selector: string }[] = [];
    walk(stylesheet, (node: any) => {
      if (node.type === "Atrule" && node.name === "scope" && node.loc && node.prelude?.children?.first?.root) {
        scopes.push({ start: node.loc.start.offset, end: node.loc.end.offset, selector: generate(node.prelude.children.first.root) });
      }
    });
    walk(stylesheet, {
      visit:"Rule",
      enter(node) {
        const rule = node as Rule;
        if (match || !rule.loc) return;
        const owner = scopes.filter(scope => scope.start < rule.loc!.start.offset && scope.end > rule.loc!.end.offset).at(-1);
        if (!candidates.some(candidate => candidate.selector === generate(rule.prelude)
          && (!candidate.scope || candidate.scope === owner?.selector))) return;
        match = { start:rule.loc.start.offset, end:rule.loc.end.offset };
      },
    });
    if (match) return match;
  } catch {
    // Fall through to the tolerant string lookup for temporarily invalid drafts.
  }
  for (const item of selectors) {
    if (typeof item !== "string" && item.scope) continue;
    const selector = typeof item === "string" ? item : item.selector;
    let start = source.indexOf(selector);
    while (start >= 0) {
      const after = source.slice(start + selector.length).match(/^\s*\{/);
      if (after) {
        const opening = start + selector.length + after[0].length - 1;
        let quote = "";
        for (let cursor = opening + 1; cursor < source.length; cursor += 1) {
          const character = source[cursor];
          if ((character === '"' || character === "'") && (!quote || quote === character)) quote = quote ? "" : character;
          if (character === "}" && !quote) return { start, end:cursor + 1 };
        }
      }
      start = source.indexOf(selector, start + selector.length);
    }
  }
  return null;
};
