const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const blockElements = new Set(["address", "article", "aside", "blockquote", "body", "caption", "colgroup", "dd", "details", "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "legend", "li", "main", "menu", "nav", "ol", "optgroup", "option", "p", "pre", "search", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"]);

const tagEnd = (source: string, start: number) => {
  let quote = "";
  for (let cursor = start + 1; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    if ((character === '"' || character === "'") && (!quote || quote === character)) quote = quote ? "" : character;
    if (character === ">" && !quote) return cursor;
  }
  return -1;
};

const tagEffect = (tag: string) => {
  if (/^<!|^<\?/.test(tag)) return 0;
  const closing = /^<\//.test(tag);
  const name = /^<\/?\s*([a-z][\w:-]*)/i.exec(tag)?.[1]?.toLowerCase();
  if (!name || voidElements.has(name) || /\/\s*>$/.test(tag)) return 0;
  return closing ? -1 : 1;
};

const lineTagEffects = (line: string) => {
  const effects: number[] = [];
  for (let cursor = 0; cursor < line.length; cursor += 1) {
    if (line[cursor] !== "<") continue;
    if (line.startsWith("<!--", cursor)) {
      const commentEnd = line.indexOf("-->", cursor + 4);
      if (commentEnd < 0) break;
      cursor = commentEnd + 2;
      continue;
    }
    const end = tagEnd(line, cursor);
    if (end < 0) break;
    effects.push(tagEffect(line.slice(cursor, end + 1)));
    cursor = end;
  }
  return effects;
};

const protectRawHtml = (source: string) => {
  const raw: { placeholder: string; value: string }[] = [];
  let placeholderPrefix = "x-code-raw";
  while (source.toLowerCase().includes(`<${placeholderPrefix}`)) placeholderPrefix += "-safe";
  const protectComment = (element: string) => {
    const placeholder = `<${placeholderPrefix}-${raw.length}></${placeholderPrefix}-${raw.length}>`;
    raw.push({ placeholder, value:element });
    return placeholder;
  };
  const protectedComments = source.replace(/<!--[\s\S]*?-->/g, protectComment);
  const protectedSource = protectedComments.replace(/<(pre|textarea)\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/\1\s*>/gi, (element) => {
    const openingEnd = tagEnd(element, 0);
    const closingStart = element.search(/<\/(?:pre|textarea)\s*>$/i);
    if (openingEnd < 0 || closingStart < 0) return element;
    let placeholder = `CODE_FORMAT_RAW_${raw.length}`;
    while (source.includes(placeholder)) placeholder += "_SAFE";
    raw.push({ placeholder, value:element.slice(openingEnd + 1, closingStart) });
    return `${element.slice(0, openingEnd + 1)}${placeholder}${element.slice(closingStart)}`;
  });
  return { protectedSource, raw };
};

type HtmlBoundary = { closingBlock: boolean; openingBlock: boolean };

const htmlBoundary = (tag: string): HtmlBoundary => {
  const closing = /^<\//.test(tag);
  const name = /^<\/?\s*([a-z][\w:-]*)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
  const block = blockElements.has(name) || name.startsWith("x-code-raw-");
  return { closingBlock:closing && block, openingBlock:!closing && block };
};

const splitCompactHtml = (source: string) => {
  let result = "";
  let cursor = 0;
  let previous: HtmlBoundary | null = null;
  let pendingWhitespace = "";
  while (cursor < source.length) {
    const opening = source.indexOf("<", cursor);
    if (opening < 0) { result += pendingWhitespace + source.slice(cursor); break; }
    const text = source.slice(cursor, opening);
    if (text && /^\s+$/.test(text) && previous) pendingWhitespace += text;
    else if (text) { result += pendingWhitespace + text; pendingWhitespace = ""; previous = null; }

    const end = source.startsWith("<!--", opening)
      ? source.indexOf("-->", opening + 4) + 2
      : tagEnd(source, opening);
    if (end < opening) { result += pendingWhitespace + source.slice(opening); break; }
    const tag = source.slice(opening, end + 1);
    const current = htmlBoundary(tag);
    if (previous) result += pendingWhitespace.includes("\n") || current.openingBlock || previous.closingBlock ? "\n" : pendingWhitespace ? " " : "";
    else result += pendingWhitespace;
    result += tag;
    pendingWhitespace = "";
    previous = current;
    cursor = end + 1;
  }
  return result;
};

/** Normalize authored HTML indentation without adding whitespace inside phrasing content. */
export const formatHtml = (source: string) => {
  const { protectedSource, raw } = protectRawHtml(source);
  const lines: string[] = [];
  let depth = 0;
  let continuedTag: { effect: number } | null = null;

  splitCompactHtml(protectedSource).trim().replaceAll("\r\n", "\n").split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      if (lines.at(-1) !== "") lines.push("");
      return;
    }

    if (continuedTag) {
      const terminal = /^\/?\s*>/.test(line);
      lines.push(`${"\t".repeat(depth + (terminal ? 0 : 1))}${line}`);
      const end = tagEnd(line, -1);
      if (end >= 0) {
        depth = Math.max(0, depth + continuedTag.effect);
        continuedTag = null;
        depth = Math.max(0, depth + lineTagEffects(line.slice(end + 1)).reduce((total, effect) => total + effect, 0));
      }
      return;
    }

    const effects = lineTagEffects(line);
    const leadingClosures = effects.findIndex((effect) => effect >= 0);
    const closingIndent = leadingClosures < 0 ? effects.filter((effect) => effect < 0).length : leadingClosures;
    lines.push(`${"\t".repeat(Math.max(0, depth - closingIndent))}${line}`);
    depth = Math.max(0, depth + effects.reduce((total, effect) => total + effect, 0));

    const opening = line.lastIndexOf("<");
    if (opening > line.lastIndexOf(">") && !line.startsWith("<!--", opening)) {
      const partial = line.slice(opening);
      continuedTag = { effect:tagEffect(`${partial}>`) };
    }
  });

  while (lines.at(-1) === "") lines.pop();
  return raw.reduceRight((result, replacement) => result.replace(replacement.placeholder, replacement.value), lines.join("\n"));
};

const formatCssValue = (source: string) => {
  let result = "";
  let quote = "";
  for (let cursor = 0; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    result += character;
    if (quote) {
      if (character === "\\" && cursor + 1 < source.length) { cursor += 1; result += source[cursor]; }
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "\\" && cursor + 1 < source.length) {
      result += source[cursor + 1];
      cursor += 1;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === "," && source[cursor + 1] && !/\s/.test(source[cursor + 1])) result += " ";
    if (character === ")" && /[-a-z0-9.]/i.test(source[cursor + 1] ?? "")) result += " ";
  }
  return result;
};

const declaration = (source: string) => {
  const match = /^((?:--[a-z0-9-]+|-?[a-z][a-z0-9-]*))\s*:\s*(.*)$/i.exec(source);
  return match ? `${match[1]}: ${formatCssValue(match[2])}` : source;
};

/** Expand CSS blocks and declarations with one tab per nesting level. */
export const formatCss = (source: string) => {
  const lines: string[] = [];
  let buffer = "";
  let cursor = 0;
  let depth = 0;
  let quote = "";
  let parentheses = 0;
  let valueBraces = 0;

  const append = (value: string) => { buffer += value; };
  const push = (value: string, level = depth) => lines.push(`${"\t".repeat(Math.max(0, level))}${value}`);
  const flush = (semicolon = false) => {
    const value = buffer.trim();
    buffer = "";
    if (value) push(`${declaration(value)}${semicolon ? ";" : ""}`);
  };

  while (cursor < source.length) {
    const character = source[cursor];
    if (quote) {
      append(character);
      if (character === "\\" && cursor + 1 < source.length) { cursor += 1; append(source[cursor]); }
      else if (character === quote) quote = "";
      cursor += 1;
      continue;
    }
    if (source.startsWith("/*", cursor)) {
      const end = source.indexOf("*/", cursor + 2);
      const next = end < 0 ? source.length : end + 2;
      const comment = source.slice(cursor, next).replace(/\s+/g, " ");
      if (buffer.trim()) append(comment);
      else push(comment);
      cursor = next;
      continue;
    }
    if (character === "\\" && cursor + 1 < source.length) {
      append(character + source[cursor + 1]);
      cursor += 2;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; append(character); cursor += 1; continue; }
    if (character === "(") { parentheses += 1; append(character); cursor += 1; continue; }
    if (character === ")") { parentheses = Math.max(0, parentheses - 1); append(character); cursor += 1; continue; }
    if (parentheses === 0 && character === "{") {
      if (valueBraces > 0 || /^\s*--[a-z0-9-]+\s*:/i.test(buffer)) {
        valueBraces += 1;
        append(character);
        cursor += 1;
        continue;
      }
      const prelude = buffer.trim();
      buffer = "";
      if (prelude) push(`${prelude} {`);
      depth += 1;
      cursor += 1;
      continue;
    }
    if (parentheses === 0 && valueBraces === 0 && character === ";") { flush(true); cursor += 1; continue; }
    if (parentheses === 0 && character === "}") {
      if (valueBraces > 0) {
        valueBraces -= 1;
        append(character);
        cursor += 1;
        continue;
      }
      flush();
      depth = Math.max(0, depth - 1);
      push("}");
      cursor += 1;
      if (depth === 0 && source.slice(cursor).trim() && lines.at(-1) !== "") lines.push("");
      continue;
    }
    if (/\s/.test(character)) {
      if (buffer && !buffer.endsWith(" ")) append(" ");
      cursor += 1;
      continue;
    }
    append(character);
    cursor += 1;
  }
  flush();
  while (lines.at(-1) === "") lines.pop();
  return lines.join("\n");
};
