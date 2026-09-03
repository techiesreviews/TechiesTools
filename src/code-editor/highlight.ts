export type CodeLanguage = "html" | "css";

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

type TokenKind = "attribute" | "comment" | "function" | "keyword" | "number" | "property" | "punctuation" | "selector" | "string" | "tag" | "value" | "variable";

const token = (kind: TokenKind, value: string) => `<span class="code-token code-token--${kind}">${escapeHtml(value)}</span>`;

type HighlightPart = { kind?: TokenKind; value: string };

const addPart = (parts: HighlightPart[], value: string, kind?: TokenKind) => {
  if (!value) return;
  const previous = parts.at(-1);
  if (previous && previous.kind === kind) previous.value += value;
  else parts.push({ kind, value });
};

const htmlParts = (source: string) => {
  const parts: HighlightPart[] = [];
  let cursor = 0;
  let inTag = false;
  let expectsValue = false;
  while (cursor < source.length) {
    if (!inTag && source.startsWith("<!--", cursor)) {
      const end = source.indexOf("-->", cursor + 4);
      const next = end < 0 ? source.length : end + 3;
      addPart(parts, source.slice(cursor, next), "comment");
      cursor = next;
      continue;
    }
    if (!inTag && source[cursor] === "<") {
      const opening = source.startsWith("</", cursor) ? "</" : "<";
      addPart(parts, opening, "punctuation");
      cursor += opening.length;
      const name = /^[!?]?[a-z][\w:-]*/i.exec(source.slice(cursor))?.[0];
      if (name) { addPart(parts, name, "tag"); cursor += name.length; }
      inTag = true;
      expectsValue = false;
      continue;
    }
    if (!inTag) {
      const next = source.indexOf("<", cursor);
      const end = next < 0 ? source.length : next;
      addPart(parts, source.slice(cursor, end));
      cursor = end;
      continue;
    }
    if (source.startsWith("/>", cursor) || source[cursor] === ">") {
      const closing = source.startsWith("/>", cursor) ? "/>" : ">";
      addPart(parts, closing, "punctuation");
      cursor += closing.length;
      inTag = false;
      expectsValue = false;
      continue;
    }
    const whitespace = /^\s+/.exec(source.slice(cursor))?.[0];
    if (whitespace) { addPart(parts, whitespace); cursor += whitespace.length; continue; }
    if (source[cursor] === "=") {
      addPart(parts, "=", "punctuation");
      cursor += 1;
      expectsValue = true;
      continue;
    }
    if (expectsValue) {
      const quote = source[cursor];
      if (quote === '"' || quote === "'") {
        const end = source.indexOf(quote, cursor + 1);
        const next = end < 0 ? source.length : end + 1;
        addPart(parts, source.slice(cursor, next), "string");
        cursor = next;
      } else {
        const value = /^[^\s>]+/.exec(source.slice(cursor))?.[0] ?? source[cursor];
        addPart(parts, value, "string");
        cursor += value.length;
      }
      expectsValue = false;
      continue;
    }
    const attribute = /^[^\s=/>]+/.exec(source.slice(cursor))?.[0];
    if (attribute) { addPart(parts, attribute, "attribute"); cursor += attribute.length; continue; }
    addPart(parts, source[cursor], "punctuation");
    cursor += 1;
  }
  return parts;
};

const cssValueParts = (value: string, parts: HighlightPart[]) => {
  let cursor = 0;
  while (cursor < value.length) {
    const rest = value.slice(cursor);
    const whitespace = /^\s+/.exec(rest)?.[0];
    if (whitespace) { addPart(parts, whitespace); cursor += whitespace.length; continue; }
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/", 2);
      const comment = end < 0 ? rest : rest.slice(0, end + 2);
      addPart(parts, comment, "comment"); cursor += comment.length; continue;
    }
    const string = /^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.exec(rest)?.[0];
    if (string) { addPart(parts, string, "string"); cursor += string.length; continue; }
    const variable = /^--[a-z0-9_-]+/i.exec(rest)?.[0];
    if (variable) { addPart(parts, variable, "variable"); cursor += variable.length; continue; }
    const number = /^(?:\d*\.\d+|\d+\.?\d*)(?:[a-z%]+)?/i.exec(rest)?.[0];
    if (number) { addPart(parts, number, "number"); cursor += number.length; continue; }
    const identifier = /^-?[a-z][a-z0-9-]*/i.exec(rest)?.[0];
    if (identifier) {
      const kind = rest[identifier.length] === "(" ? "function" : "keyword";
      addPart(parts, identifier, kind); cursor += identifier.length; continue;
    }
    addPart(parts, rest[0], "punctuation");
    cursor += 1;
  }
};

const cssParts = (source: string) => {
  const parts: HighlightPart[] = [];
  type BlockMode = "rules" | "declarations";
  const contextProbe = source.replace(/^(?:\s|\/\*[\s\S]*?\*\/)+/, "");
  const startsWithDeclaration = /^(?:--[a-z0-9-]+|-?[a-z][a-z0-9-]*)\s*:/i.test(contextProbe);
  let mode: BlockMode = startsWithDeclaration ? "declarations" : "rules";
  const parentModes: BlockMode[] = [];
  let cursor = 0;

  const valueEnd = (start: number) => {
    let index = start;
    let quote = "";
    let parentheses = 0;
    while (index < source.length) {
      if (quote) {
        if (source[index] === "\\") index += 2;
        else if (source[index] === quote) { quote = ""; index += 1; }
        else index += 1;
        continue;
      }
      if (source.startsWith("/*", index)) {
        const end = source.indexOf("*/", index + 2);
        index = end < 0 ? source.length : end + 2;
        continue;
      }
      if (source[index] === '"' || source[index] === "'") { quote = source[index]; index += 1; continue; }
      if (source[index] === "(") parentheses += 1;
      else if (source[index] === ")") parentheses = Math.max(0, parentheses - 1);
      else if (parentheses === 0 && (source[index] === ";" || source[index] === "}")) break;
      index += 1;
    }
    return index;
  };

  while (cursor < source.length) {
    if (source.startsWith("/*", cursor)) {
      const end = source.indexOf("*/", cursor + 2);
      const next = end < 0 ? source.length : end + 2;
      addPart(parts, source.slice(cursor, next), "comment");
      cursor = next;
      continue;
    }

    const whitespace = /^\s+/.exec(source.slice(cursor))?.[0];
    if (whitespace) { addPart(parts, whitespace); cursor += whitespace.length; continue; }

    if (source[cursor] === "}") {
      addPart(parts, "}", "punctuation");
      cursor += 1;
      mode = parentModes.pop() ?? "rules";
      continue;
    }

    if (mode === "rules") {
      const opening = source.indexOf("{", cursor);
      const end = opening < 0 ? source.length : opening;
      const selector = source.slice(cursor, end);
      const isAtRule = selector.startsWith("@");
      const selectorText = selector.trimEnd();
      addPart(parts, selectorText, isAtRule ? "keyword" : "selector");
      addPart(parts, selector.slice(selectorText.length));
      cursor = end;
      if (opening >= 0) {
        addPart(parts, "{", "punctuation");
        cursor += 1;
        parentModes.push(mode);
        mode = isAtRule && !/^@(font-face|page|property|counter-style)\b/i.test(selector)
          ? "rules"
          : "declarations";
      }
      continue;
    }

    const declaration = /^((?:--[a-z0-9-]+|-?[a-z][a-z0-9-]*))(\s*)(:)/i.exec(source.slice(cursor));
    if (declaration) {
      const [, property, spacing, colon] = declaration;
      addPart(parts, property, "property");
      addPart(parts, spacing);
      addPart(parts, colon, "punctuation");
      cursor += declaration[0].length;
      const end = valueEnd(cursor);
      cssValueParts(source.slice(cursor, end), parts);
      cursor = end;
      if (source[cursor] === ";") {
        addPart(parts, ";", "punctuation");
        cursor += 1;
      }
      continue;
    }

    addPart(parts, source[cursor], "punctuation");
    cursor += 1;
  }
  return parts;
};

const renderLines = (parts: HighlightPart[]) => {
  const lines = [""];
  parts.forEach(({ kind, value }) => value.split("\n").forEach((part, index) => {
    if (index) lines.push("");
    if (part) lines[lines.length - 1] += kind ? token(kind, part) : escapeHtml(part);
  }));
  return lines.map((line) => `<span class="code-editor-source-line">${line || "&#8203;"}</span>`).join("");
};

export const highlightCode = (source: string, language: CodeLanguage) => renderLines(language === "html" ? htmlParts(source) : cssParts(source));

export const codeLineNumbers = (source: string) => Array.from({ length: Math.max(1, source.split("\n").length) }, (_, index) => String(index + 1)).join("\n");
