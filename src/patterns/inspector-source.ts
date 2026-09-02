export interface SourceRange { start: number; end: number; }

/** Locate an authored opening tag by DOM preorder without rewriting the source. */
export const htmlOpeningTagRange = (source: string, elementIndex: number): SourceRange | null => {
  let index = -1;
  for (let cursor = 0; cursor < source.length; cursor += 1) {
    if (source[cursor] !== "<") continue;
    if (source.startsWith("<!--", cursor)) {
      const commentEnd = source.indexOf("-->", cursor + 4);
      if (commentEnd < 0) return null;
      cursor = commentEnd + 2;
      continue;
    }
    if (!/[a-z]/i.test(source[cursor + 1] ?? "")) continue;
    let quote = "";
    for (let end = cursor + 1; end < source.length; end += 1) {
      const character = source[end];
      if ((character === '"' || character === "'") && (!quote || quote === character)) quote = quote ? "" : character;
      if (character !== ">" || quote) continue;
      index += 1;
      if (index === elementIndex) return { start: cursor, end: end + 1 };
      cursor = end;
      break;
    }
  }
  return null;
};

/** Locate the first matching authored selector emitted by the live stylesheet. */
export const cssSelectorRange = (source: string, selectors: readonly string[]): SourceRange | null => {
  for (const selector of selectors) {
    let start = source.indexOf(selector);
    while (start >= 0) {
      const after = source.slice(start + selector.length).match(/^\s*\{/);
      if (after) return { start, end: start + selector.length };
      start = source.indexOf(selector, start + selector.length);
    }
  }
  return null;
};
