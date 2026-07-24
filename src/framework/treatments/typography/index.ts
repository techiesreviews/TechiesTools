import type { Declaration, TreatmentDefinition, TokenFamily } from "../../model/index.ts";

const token = (
  label: string,
  family: TokenFamily,
  names: readonly string[],
  starter = names[0],
  allowOmit = false,
): Declaration => ({
  label,
  control: { kind: "token", families: [family], options: names.map((name) => ({ family, name })) },
  starter: { kind: "token", family, name: starter },
  ...(allowOmit ? { allowOmit: true as const } : {}),
});
const choice = (label: string, options: readonly string[], starter = options[0]): Declaration => ({
  label,
  control: { kind: "choice", options: options.map((value) => ({ value, label: value })) },
  starter: { kind: "choice", value: starter },
});
const length = (label: string, value: string, allowNegative = false): Declaration => ({
  label,
  control: { kind: "length", ...(allowNegative ? { allowNegative: true as const } : {}) },
  starter: { kind: "length", value },
});
const dimension = (label: string, family: "typography" | "spacing" | "radius", names: readonly string[], starter = names[0]) =>
  token(label, family, names, starter);
const family = (label: string, name: "family-body" | "family-heading" | "family-code") => token(label, "typography", [name], name);
const color = (label: string, names: readonly string[], starter = names[0]) => token(label, "semantic", names, starter);
const specimen = (label: string, semanticHtml: string) => [{ id: "default", label, semanticHtml, demonstrates: ["base"] }];
const definition = (id: string, declarations: Record<string, Declaration>, semanticHtml: string, label: string, contrastChecks?: TreatmentDefinition["contrastChecks"]) => ({
  schemaVersion: 1 as const,
  rules: [{ id: "base", kind: "base" as const, selector: `:where(${id})`, declarations }],
  ...(contrastChecks ? { contrastChecks } : {}),
  specimens: specimen(label, semanticHtml),
} satisfies TreatmentDefinition);

const heading = (id: `h${1 | 2 | 3 | 4 | 5 | 6}`, size: string, label: string) => definition(id, {
  "font-family": family("Font family", "family-heading"),
  "font-size": dimension("Font size", "typography", [size], size),
  "font-weight": choice("Font weight", ["700", "800"], "700"),
  "line-height": choice("Line height", ["1.1", "1.2"], "1.1"),
  "margin-block-start": dimension("Block start margin", "spacing", ["xl", "l"], "xl"),
  "margin-block-end": dimension("Block end margin", "spacing", ["s", "m"], "s"),
}, `<${id}>${label}</${id}>`, label);

const h1 = heading("h1", "4xl", "Heading 1");
const h2 = heading("h2", "3xl", "Heading 2");
const h3 = heading("h3", "2xl", "Heading 3");
const h4 = heading("h4", "xl", "Heading 4");
const h5 = heading("h5", "l", "Heading 5");
const h6 = heading("h6", "m", "Heading 6");

const p = definition("p", {
  "font-family": family("Font family", "family-body"),
  "font-size": dimension("Font size", "typography", ["m"], "m"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.6"),
  "max-inline-size": length("Readable measure", "65ch"),
  "margin-block-start": dimension("Block start margin", "spacing", ["s", "m"], "s"),
  "margin-block-end": dimension("Block end margin", "spacing", ["m", "l"], "m"),
}, "<p>One related paragraph of regular text.</p>", "Paragraph");

const strong = definition("strong", {
  "font-weight": choice("Font weight", ["700", "800"], "700"),
}, "<strong>Important text</strong>", "Strong importance");

const em = definition("em", {
  "font-style": choice("Font style", ["italic", "oblique"], "italic"),
}, "<em>Stressed emphasis</em>", "Stress emphasis");

const small = definition("small", {
  "font-size": dimension("Font size", "typography", ["s", "xs"], "s"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
}, "<small>Terms and supporting detail.</small>", "Side comment");

const mark = definition("mark", {
  color: color("Text color", ["surface", "text"], "surface"),
  "background-color": color("Background", ["action", "border", "primary"], "action"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["4xs"], "4xs"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["4xs"], "4xs"),
  "border-radius": dimension("Border radius", "radius", ["xs"], "xs"),
}, "<p>Search result with <mark>matching text</mark>.</p>", "Marked relevance", [{
  id: "mark-text",
  kind: "normal-text",
  subject: { ruleId: "base", property: "color", editable: true },
  comparison: { ruleId: "base", property: "background-color", editable: true },
}]);

const abbr = definition("abbr", {
  "text-decoration-line": choice("Decoration line", ["underline"], "underline"),
  "text-decoration-style": choice("Decoration style", ["dotted", "dashed"], "dotted"),
  "text-underline-offset": length("Underline offset", "0.15em"),
}, '<abbr title="Web Content Accessibility Guidelines">WCAG</abbr>', "Abbreviation");

const blockquote = definition("blockquote", {
  "font-family": family("Font family", "family-body"),
  "font-size": dimension("Font size", "typography", ["l", "m"], "l"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
  "border-inline-start-color": color("Quote rule color", ["action", "border"], "action"),
  "border-inline-start-style": choice("Quote rule style", ["solid", "dashed"], "solid"),
  "border-inline-start-width": length("Quote rule width", "0.25rem"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["m", "l"], "m"),
  "margin-block-start": dimension("Block start margin", "spacing", ["l"], "l"),
  "margin-block-end": dimension("Block end margin", "spacing", ["l"], "l"),
}, "<blockquote><p>Quoted material from another source.</p></blockquote>", "Block quotation");

const cite = definition("cite", {
  "font-style": choice("Font style", ["italic", "normal"], "italic"),
  "font-size": dimension("Font size", "typography", ["s", "m"], "s"),
}, "<cite>The Design of Everyday Things</cite>", "Citation title");

const code = definition("code", {
  "font-family": family("Code font", "family-code"),
  "font-size": dimension("Font size", "typography", ["s", "m"], "s"),
}, "<p>Run <code>npm test</code> before export.</p>", "Code");

const pre = definition("pre", {
  color: color("Text color", ["text"], "text"),
  "background-color": color("Background", ["surface"], "surface"),
  "font-family": family("Code font", "family-code"),
  "font-size": dimension("Font size", "typography", ["s", "m"], "s"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
  "white-space": choice("Whitespace", ["pre", "pre-wrap"], "pre"),
  "overflow-x": choice("Inline overflow", ["auto"], "auto"),
  "padding-block-start": dimension("Block start padding", "spacing", ["m"], "m"),
  "padding-block-end": dimension("Block end padding", "spacing", ["m"], "m"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["m"], "m"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["m"], "m"),
  "border-radius": dimension("Border radius", "radius", ["m"], "m"),
}, "<pre><code>const ready = true;</code></pre>", "Preformatted text", [{
  id: "pre-text",
  kind: "normal-text",
  subject: { ruleId: "base", property: "color", editable: true },
  comparison: { ruleId: "base", property: "background-color", editable: true },
}]);

const kbd = definition("kbd", {
  "font-family": family("Code font", "family-code"),
  "font-size": dimension("Font size", "typography", ["s", "xs"], "s"),
  "border-color": color("Border color", ["border"], "border"),
  "border-style": choice("Border style", ["solid"], "solid"),
  "border-width": length("Border width", "1px"),
  "border-radius": dimension("Border radius", "radius", ["s"], "s"),
  "padding-block-start": dimension("Block start padding", "spacing", ["4xs"], "4xs"),
  "padding-block-end": dimension("Block end padding", "spacing", ["4xs"], "4xs"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["3xs"], "3xs"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["3xs"], "3xs"),
}, "<p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd>.</p>", "Keyboard input");

const hr = definition("hr", {
  "border-block-start-color": color("Separator color", ["border", "text"], "border"),
  "border-block-start-style": choice("Separator style", ["solid", "dashed", "dotted"], "solid"),
  "border-block-start-width": length("Separator width", "1px"),
  "margin-block-start": dimension("Block start margin", "spacing", ["xl", "l"], "xl"),
  "margin-block-end": dimension("Block end margin", "spacing", ["xl", "l"], "xl"),
}, "<hr>", "Thematic break");

export const typographyTreatments = Object.freeze({
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  strong,
  em,
  small,
  mark,
  abbr,
  blockquote,
  cite,
  code,
  pre,
  kbd,
  hr,
});
