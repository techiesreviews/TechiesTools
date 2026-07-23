import type { Declaration, TreatmentDefinition, TokenFamily } from "../../model/index.ts";

type TextEntrySource = Readonly<{
  id: "input" | "textarea" | "input-text" | "input-email" | "input-tel" | "input-url" | "input-search" | "input-password";
  subject: string;
  label: string;
  semanticHtml: string;
  minBlockSize: string;
}>;

const token = (
  label: string,
  family: TokenFamily,
  names: readonly string[],
  starter = names[0],
): Declaration => ({
  label,
  control: { kind: "token", families: [family], options: names.map((name) => ({ family, name })) },
  starter: { kind: "token", family, name: starter },
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
const color = (label: string, names: readonly string[], starter = names[0]) => token(label, "semantic", names, starter);

const baseDeclarations = (minBlockSize: string): Record<string, Declaration> => ({
  color: color("Text color", ["text", "action", "primary"], "text"),
  "background-color": color("Background", ["surface"], "surface"),
  "font-family": token("Font family", "typography", ["family-body"]),
  "font-size": dimension("Font size", "typography", ["m", "s"], "m"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
  "border-color": color("Border color", ["border", "text", "action", "primary"], "border"),
  "border-style": choice("Border style", ["solid", "dashed", "dotted"], "solid"),
  "border-width": length("Border width", "1px"),
  "border-radius": dimension("Border radius", "radius", ["s", "m"], "s"),
  "padding-block-start": dimension("Block start padding", "spacing", ["3xs", "2xs"], "3xs"),
  "padding-block-end": dimension("Block end padding", "spacing", ["3xs", "2xs"], "3xs"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["xs", "s"], "xs"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["xs", "s"], "xs"),
  "min-block-size": length("Minimum block size", minBlockSize),
  "max-inline-size": length("Maximum inline size", "30rem"),
});
const focusDeclarations = (): Record<string, Declaration> => ({
  "outline-color": color("Focus color", ["focus", "text", "action"], "focus"),
  "outline-style": choice("Focus style", ["solid", "dashed", "dotted"], "solid"),
  "outline-width": length("Focus width", "2px"),
  "outline-offset": length("Focus offset", "-2px", true),
});

const createTextEntryDefinition = (source: TextEntrySource): TreatmentDefinition => ({
  schemaVersion: 1,
  selectorSubject: source.id.startsWith("input-") ? "input" : source.id,
  rules: [
    {
      id: "base",
      kind: "base",
      selector: `:where(${source.subject}:not(:disabled):not(:read-only):not(:invalid))`,
      declarations: baseDeclarations(source.minBlockSize),
    },
    {
      id: "focus-visible",
      kind: "state",
      state: "focus-visible",
      selector: `:where(${source.subject}:not(:disabled):not(:read-only):not(:invalid):focus-visible)`,
      declarations: focusDeclarations(),
    },
  ],
  contrastChecks: [
    {
      id: `${source.id}-text`,
      kind: "normal-text",
      subject: { ruleId: "base", property: "color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: `${source.id}-boundary`,
      kind: "non-text-ui",
      subject: { ruleId: "base", property: "border-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: `${source.id}-focus-inner`,
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: `${source.id}-focus-outer`,
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "border-color", editable: false },
    },
  ],
  specimens: [{ id: "default", label: source.label, semanticHtml: source.semanticHtml, demonstrates: ["base", "focus-visible"] }],
});

const sources = [
  {
    id: "input",
    subject: "input:not([type])",
    label: "Default text input",
    semanticHtml: '<label for="default-name">Name</label><input id="default-name" name="name" autocomplete="name">',
    minBlockSize: "2.75rem",
  },
  {
    id: "textarea",
    subject: "textarea",
    label: "Multi-line text",
    semanticHtml: '<label for="message">Message</label><textarea id="message" name="message" rows="5"></textarea>',
    minBlockSize: "8rem",
  },
  {
    id: "input-text",
    subject: 'input[type="text"]',
    label: "Text input",
    semanticHtml: '<label for="profile-name">Name</label><input id="profile-name" name="name" type="text" autocomplete="name">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-email",
    subject: 'input[type="email"]',
    label: "Email input",
    semanticHtml: '<label for="account-email">Email address</label><input id="account-email" name="email" type="email" autocomplete="email">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-tel",
    subject: 'input[type="tel"]',
    label: "Telephone input",
    semanticHtml: '<label for="phone">Telephone number</label><input id="phone" name="phone" type="tel" autocomplete="tel">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-url",
    subject: 'input[type="url"]',
    label: "URL input",
    semanticHtml: '<label for="website">Website</label><input id="website" name="website" type="url" autocomplete="url">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-search",
    subject: 'input[type="search"]',
    label: "Search input",
    semanticHtml: '<search><form><label for="site-query">Search</label><input id="site-query" name="q" type="search" autocomplete="off"></form></search>',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-password",
    subject: 'input[type="password"]',
    label: "Password input",
    semanticHtml: '<label for="current-password">Password</label><input id="current-password" name="password" type="password" autocomplete="current-password">',
    minBlockSize: "2.75rem",
  },
] as const satisfies readonly TextEntrySource[];

export const formsTextEntryTreatments = Object.freeze(Object.fromEntries(
  sources.map((source) => [source.id, createTextEntryDefinition(source)]),
)) as Readonly<Record<TextEntrySource["id"], TreatmentDefinition>>;
