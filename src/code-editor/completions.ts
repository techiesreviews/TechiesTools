import type { CodeLanguage } from "./highlight.ts";
export type { CodeLanguage } from "./highlight.ts";

export type CompletionKind = "css-property" | "css-value" | "html-tag" | "html-attribute";

export interface CompletionRequest {
	language: CodeLanguage;
	source: string;
	offset: number;
	additionalProperties?: readonly string[];
	additionalValues?: readonly string[];
}

export interface CompletionTarget {
	start: number;
	end: number;
	query: string;
	kind: CompletionKind;
}

export interface CodeCompletion {
	label: string;
	insertText: string;
	detail: string;
	cursorBack?: number;
}

const hasOpenQuote = (source: string) => {
	let quote = "";
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (character === "\\") { index += 1; continue; }
		if ((character === '"' || character === "'") && (!quote || quote === character)) quote = quote ? "" : character;
	}
	return Boolean(quote);
};

const tokenEnd = (source: string, offset: number, suffix: RegExp) => offset + (suffix.exec(source.slice(offset))?.[0].length ?? 0);

const cssCursorContext = (source: string) => {
	let boundary = -1;
	let quote = "";
	let comment = false;
	let parentheses = 0;
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		const next = source[index + 1];
		if (comment) { if (character === "*" && next === "/") { comment = false; index += 1; } continue; }
		if (!quote && character === "/" && next === "*") { comment = true; index += 1; continue; }
		if (character === "\\") { index += 1; continue; }
		if ((character === '"' || character === "'") && (!quote || quote === character)) { quote = quote ? "" : character; continue; }
		if (quote) continue;
		if (character === "(") parentheses += 1;
		else if (character === ")") parentheses = Math.max(0, parentheses - 1);
		else if ((character === "\n" && parentheses === 0) || character === ";" || character === "{" || character === "}") boundary = index;
	}
	return { boundary, comment };
};

const cssProperties = [
	"align-items", "background", "block-size", "border", "border-color", "border-radius", "box-shadow",
	"color", "cursor", "display", "filter", "flex", "font", "font-family", "font-size", "font-weight", "gap",
	"grid-template-columns", "inline-size", "justify-content", "line-height", "margin", "mask-image", "max-inline-size",
	"min-block-size", "object-fit", "opacity", "overflow", "padding", "position", "text-align", "transition", "width",
] as const;

const cssValues = [
	"auto", "block", "flex", "grid", "inline-flex", "none", "relative", "absolute", "hidden", "visible",
	"var(--semantic-action)", "var(--semantic-border)", "var(--semantic-focus)", "var(--semantic-primary)",
	"var(--semantic-surface)", "var(--semantic-text)", "var(--font-body)", "var(--radius-m)", "var(--space-s)",
] as const;

const htmlTags = [
	"a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "br", "button",
	"canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn",
	"dialog", "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer",
	"form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "img", "input", "label", "legend", "li", "main",
	"map", "mark", "menu", "meter", "nav", "noscript", "ol", "optgroup", "option", "output", "p", "picture", "pre",
	"progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "source",
	"span", "strong", "sub", "sup",
	"summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track",
	"u", "ul", "var", "video", "wbr",
] as const;

const htmlAttributes = [
	"accept", "action", "alt", "aria-describedby", "aria-expanded", "aria-hidden", "aria-label", "aria-labelledby",
	"autocomplete", "autofocus", "checked", "class", "cols", "colspan", "controls", "data-", "disabled", "for", "height",
	"href", "id", "loading", "max", "maxlength", "method", "min", "multiple", "name", "pattern", "placeholder",
	"poster", "readonly", "required", "role", "rows", "rowspan", "selected", "src", "srcset", "step", "tabindex",
	"target", "title", "type", "value", "width",
] as const;

export const completionTarget = ({ language, source, offset }: CompletionRequest): CompletionTarget | null => {
	const before = source.slice(0, offset);
	if (language === "css") {
		const context = cssCursorContext(before);
		if (context.comment) return null;
		const segmentStart = context.boundary;
		const segment = before.slice(segmentStart + 1);
		const colon = segment.indexOf(":");
		if (colon >= 0) {
			if (hasOpenQuote(segment.slice(colon + 1))) return null;
			const value = /(?:var\(--[a-z0-9-]*|--[a-z0-9-]*|[a-z][a-z0-9-]*)$/i.exec(segment.slice(colon + 1));
			if (!value) return null;
			return { start:offset - value[0].length, end:tokenEnd(source, offset, /[a-z0-9-]*\)?/i), query:value[0], kind:"css-value" };
		}
		const property = /(?:--[a-z0-9-]*|-?[a-z][a-z0-9-]*)$/i.exec(segment);
		if (!property) return null;
		return { start:offset - property[0].length, end:tokenEnd(source, offset, /[a-z0-9-]*/i), query:property[0], kind:"css-property" };
	}

	const opening = before.lastIndexOf("<");
	if (opening < 0 || before.lastIndexOf(">") > opening) return null;
	if (before.lastIndexOf("<!--") > before.lastIndexOf("-->")) return null;
	const inside = before.slice(opening + 1);
	if (hasOpenQuote(inside)) return null;
	if (/^\/?[a-z0-9-]*$/i.test(inside)) {
		const query = inside.replace(/^\//, "");
		return { start:offset - query.length, end:tokenEnd(source, offset, /[a-z0-9-]*/i), query, kind:"html-tag" };
	}
	const attribute = /\s([a-z][a-z0-9-]*)$/i.exec(inside);
	if (!attribute) return null;
	return { start:offset - attribute[1].length, end:tokenEnd(source, offset, /[a-z0-9-]*/i), query:attribute[1], kind:"html-attribute" };
};

export const codeCompletions = (request: CompletionRequest): CodeCompletion[] => {
	const target = completionTarget(request);
	if (!target || !target.query) return [];
	const query = target.query.toLowerCase();
	if (target.kind === "css-property") {
		const keepsExistingValue = /^\s*:/.test(request.source.slice(target.end));
		return [...new Set([...cssProperties, ...(request.additionalProperties ?? [])])]
		.filter((property) => property.startsWith(query))
		.map((property) => keepsExistingValue
			? { label:property, insertText:property, detail:"CSS property" }
			: { label:property, insertText:`${property}: ;`, detail:"CSS property", cursorBack:1 });
	}
	if (target.kind === "css-value") return [...new Set([...cssValues, ...(request.additionalValues ?? [])])]
		.filter((value) => value.toLowerCase().startsWith(query) || value.toLowerCase().includes(query.replace(/^var\(/, "")))
		.map((value) => ({ label:value, insertText:value, detail:value.startsWith("var(") ? "Framework token" : "CSS value" }));
	if (target.kind === "html-tag") return htmlTags
		.filter((tag) => tag.startsWith(query))
		.map((tag) => ({ label:`<${tag}>`, insertText:tag, detail:"HTML element" }));
	return htmlAttributes
		.filter((attribute) => attribute.startsWith(query))
		.map((attribute) => attribute === "data-"
			? { label:"data-*", insertText:"data-", detail:"Data attribute" }
			: { label:attribute, insertText:`${attribute}=\"\"`, detail:"HTML attribute", cursorBack:1 });
};
