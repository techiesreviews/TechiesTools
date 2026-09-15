import { parse, walk } from "css-tree/dist/csstree.esm";

export interface CssColorCandidate {
  start: number;
  end: number;
  value: string;
}

type VariableLookup = (name: string) => string | undefined;

const matchingParenthesis = (source: string, opening: number) => {
  let depth = 0;
  for (let index = opening; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")" && --depth === 0) return index;
  }
  return -1;
};

const variableParts = (source: string) => {
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")") depth -= 1;
    else if (source[index] === "," && depth === 0) return [source.slice(0, index).trim(), source.slice(index + 1).trim()] as const;
  }
  return [source.trim(), undefined] as const;
};

const resolveVariables = (source: string, lookup: VariableLookup, resolving = new Set<string>()): string | null => {
  let result = "";
  let cursor = 0;
  const normalized = source.toLowerCase();
  while (cursor < source.length) {
    const opening = normalized.indexOf("var(", cursor);
    if (opening < 0) return `${result}${source.slice(cursor)}`;
    result += source.slice(cursor, opening);
    const closing = matchingParenthesis(source, opening + 3);
    if (closing < 0) return null;
    const [name, fallback] = variableParts(source.slice(opening + 4, closing));
    if (!/^--[a-z0-9_-]+$/i.test(name)) return null;
    const raw = lookup(name);
    const replacement = raw && !resolving.has(name)
      ? resolveVariables(raw, lookup, new Set([...resolving, name]))
      : fallback ? resolveVariables(fallback, lookup, resolving) : null;
    if (!replacement) return null;
    result += replacement;
    cursor = closing + 1;
  }
  return result;
};

/** Resolves local and inherited custom properties without inventing a swatch for unknown or cyclic values. */
export const resolveCssColorValue = (
  value: string,
  lookup: VariableLookup,
  supportsColor: (value: string) => boolean,
  currentColor?: string,
) => {
  const resolved = resolveVariables(value, lookup)?.trim();
  if (!resolved || /^(?:inherit|initial|unset|revert|revert-layer)$/i.test(resolved)) return null;
  const withCurrentColor = /\bcurrentcolor\b/i.test(resolved)
    ? currentColor ? resolved.replace(/\bcurrentcolor\b/gi, currentColor) : null
    : resolved;
  return withCurrentColor && supportsColor(withCurrentColor) ? withCurrentColor : null;
};

/** Returns declaration values and source ranges from a complete or declaration-only CSS source. */
export const cssColorCandidates = (source: string): readonly CssColorCandidate[] => {
  const candidates: CssColorCandidate[] = [];
  const collect = (ast: any) => walk(ast, (node: any) => {
    if (node.type !== "Declaration" || !node.value?.loc) return;
    const raw = source.slice(node.value.loc.start.offset, node.value.loc.end.offset);
    const value = raw.trim();
    if (!value) return;
    const start = node.value.loc.start.offset + raw.length - raw.trimStart().length;
    const end = node.value.loc.end.offset - raw.length + raw.trimEnd().length;
    candidates.push({ start, end, value });
  });
  try { collect(parse(source, { context:"stylesheet", positions:true })); }
  catch {
    try { collect(parse(source, { context:"declarationList", positions:true })); }
    catch { return []; }
  }
  return candidates;
};

const markerTargetAt = (overlay: HTMLElement, offset: number) => {
  const lines = Array.from(overlay.querySelectorAll<HTMLElement>(".code-editor-source-line"));
  let lineStart = 0;
  for (const line of lines) {
    const lineSource = (line.textContent ?? "").replace("\u200b", "");
    const lineEnd = lineStart + lineSource.length;
    if (offset >= lineStart && offset < lineEnd) {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let consumed = lineStart;
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const end = consumed + node.data.length;
        if (offset >= consumed && offset < end) return node.parentElement;
        consumed = end;
      }
      return line;
    }
    lineStart = lineEnd + 1;
  }
  return null;
};

const createMarker = (fill: string, value: string) => {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.classList.add("code-editor-color-marker");
  icon.setAttribute("data-color-value", value);
  icon.setAttribute("viewBox", "0 0 8 8");
  icon.setAttribute("aria-hidden", "true");
  const marker = document.createElementNS(namespace, "rect");
  marker.setAttribute("width", "8");
  marker.setAttribute("height", "8");
  marker.setAttribute("rx", "1.5");
  marker.setAttribute("fill", fill);
  icon.append(marker);
  return icon;
};

/** Adds absolute, non-layout-affecting color markers to the rendered CSS overlay. */
export const decorateCssColors = (overlay: HTMLElement, source: string, context: Element) => {
  const styles = getComputedStyle(context);
  const lookup: VariableLookup = (name) => styles.getPropertyValue(name).trim() || undefined;
  cssColorCandidates(source).forEach((candidate) => {
    const color = resolveCssColorValue(candidate.value, lookup, (value) => CSS.supports("color", value), styles.color);
    if (!color) return;
    const target = markerTargetAt(overlay, candidate.start);
    if (!target) return;
    target.classList.add("code-editor-color-marker-target");
    target.prepend(createMarker(color, candidate.value));
  });
};
