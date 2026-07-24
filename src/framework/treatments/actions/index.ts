import { defineTreatment } from "../../catalog/index.ts";
import type { Declaration, TreatmentDefinition } from "../../model/index.ts";

const token = (
  label: string,
  families: readonly ("semantic" | "color" | "typography" | "spacing" | "radius")[],
  options: readonly { family: "semantic" | "color" | "typography" | "spacing" | "radius"; name: string }[],
  starter: { family: "semantic" | "color" | "typography" | "spacing" | "radius"; name: string },
  allowOmit = false,
): Declaration => ({
  label,
  control: { kind: "token", families: [...families], options: options.map((item) => ({ ...item })) },
  starter: allowOmit ? { kind: "omit" } : { kind: "token", ...starter },
  ...(allowOmit ? { allowOmit: true as const } : {}),
});
const choice = (label: string, options: readonly string[], starter = options[0]): Declaration => ({
  label,
  control: { kind: "choice", options: options.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })) },
  starter: { kind: "choice", value: starter },
});
const length = (label: string, value: string, allowNegative = false): Declaration => ({
  label,
  control: { kind: "length", ...(allowNegative ? { allowNegative: true as const } : {}), ...(!allowNegative ? { keywords: ["thin", "medium", "thick"] as const } : {}) },
  starter: { kind: "length", value },
});
const color = (label: string, name: string, options = [name]) => token(
  label,
  ["semantic", "color"],
  options.map((option) => ({ family: "semantic" as const, name: option })),
  { family: "semantic", name },
);
const focusDeclarations = (offset = "2px") => ({
  "outline-color": color("Focus color", "focus"),
  "outline-style": choice("Focus style", ["auto", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"], "solid"),
  "outline-width": length("Focus width", "2px"),
  "outline-offset": length("Focus offset", offset, true),
});

const link = defineTreatment({
  schemaVersion: 1,
  rules: [
    {
      id: "base",
      kind: "base",
      selector: ":where(a[href])",
      declarations: {
        color: color("Text color", "text"),
        "text-decoration-line": choice("Underline", ["underline", "none"], "underline"),
      },
    },
    { id: "hover", kind: "state", state: "hover", selector: ":where(a[href]:hover)", declarations: { color: color("Hover color", "text") } },
    { id: "focus-visible", kind: "state", state: "focus-visible", selector: ":where(a[href]:focus-visible)", declarations: focusDeclarations() },
    { id: "active", kind: "state", state: "active", selector: ":where(a[href]:active)", declarations: { color: color("Active color", "text") } },
    {
      id: "quiet",
      kind: "variant",
      variant: "quiet",
      when: "Use for lower-emphasis supporting links.",
      selector: ':where(a[href][data-variant="quiet"])',
      declarations: { "text-decoration-line": choice("Underline", ["none"], "none") },
    },
  ],
  relationships: [{
    id: "link-in-navigation",
    elements: ["a", "nav"],
    when: "A link names a destination in navigation.",
    semanticHtml: '<nav aria-label="Primary"><a aria-current="page" href="/elements">Elements</a></nav>',
    rules: [{
      id: "current",
      kind: "base",
      targetElement: "a",
      selector: ':where(nav a[aria-current="page"])',
      declarations: { "text-decoration-line": choice("Current page mark", ["underline"], "underline") },
    }],
  }],
  specimens: [
    { id: "default", label: "Link", semanticHtml: '<a href="/elements">Browse element guidance</a>', demonstrates: ["base", "hover", "focus-visible", "active"] },
    { id: "navigation", label: "Current navigation link", relationship: "link-in-navigation", semanticHtml: '<nav aria-label="Primary"><a aria-current="page" href="/elements">Elements</a></nav>', demonstrates: ["link-in-navigation/current"] },
  ],
} satisfies TreatmentDefinition);

type ActionControlSource = Readonly<{
  id: string;
  subject: string;
  selectorSubject?: string;
  label: string;
  semanticHtml: string;
  secondaryLabel: string;
  secondarySemanticHtml: string;
}>;

export const createActionControlDefinition = (source: ActionControlSource): TreatmentDefinition => defineTreatment({
  schemaVersion: 1,
  ...(source.selectorSubject ? { selectorSubject: source.selectorSubject } : {}),
  rules: [
    {
      id: "base",
      kind: "base",
      selector: `:where(${source.subject})`,
      declarations: {
        color: color("Text color", "surface", ["surface", "text"]),
        "background-color": color("Background", "action", ["action", "primary"]),
        "font-size": token("Font size", ["typography"], [{ family: "typography", name: "m" }], { family: "typography", name: "m" }),
        "border-color": color("Border color", "border"),
        "border-style": choice("Border style", ["solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"], "solid"),
        "border-width": length("Border width", "1px"),
        "border-radius": token("Border radius", ["radius"], [{ family: "radius", name: "m" }], { family: "radius", name: "m" }),
        "margin-block-start": token("Block start margin", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }, true),
        "margin-block-end": token("Block end margin", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }, true),
        "margin-inline-start": token("Inline start margin", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }, true),
        "margin-inline-end": token("Inline end margin", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }, true),
        "padding-block-start": token("Block start padding", ["spacing"], [{ family: "spacing", name: "3xs" }], { family: "spacing", name: "3xs" }),
        "padding-block-end": token("Block end padding", ["spacing"], [{ family: "spacing", name: "3xs" }], { family: "spacing", name: "3xs" }),
        "padding-inline-start": token("Inline start padding", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }),
        "padding-inline-end": token("Inline end padding", ["spacing"], [{ family: "spacing", name: "s" }], { family: "spacing", name: "s" }),
      },
    },
    { id: "hover", kind: "state", state: "hover", selector: `:where(${source.subject}:not(:disabled):hover)`, declarations: { "background-color": color("Hover background", "primary", ["primary", "action"]) } },
    { id: "focus-visible", kind: "state", state: "focus-visible", selector: `:where(${source.subject}:not(:disabled):focus-visible)`, declarations: focusDeclarations("-2px") },
    { id: "active", kind: "state", state: "active", selector: `:where(${source.subject}:not(:disabled):active)`, declarations: { "background-color": color("Active background", "action") } },
    {
      id: "disabled",
      kind: "state",
      state: "disabled",
      selector: `:where(${source.subject}:disabled)`,
      declarations: {
        color: color("Disabled text", "text"),
        "background-color": color("Disabled background", "surface"),
        "border-color": color("Disabled border", "border"),
      },
    },
    {
      id: "secondary",
      kind: "variant",
      variant: "secondary",
      when: "Use for a valid lower-priority action beside one primary action.",
      selector: `:where(${source.subject}:not(:disabled)[data-variant="secondary"])`,
      declarations: {
        color: color("Text color", "text"),
        "background-color": color("Background", "surface"),
      },
    },
  ],
  contrastChecks: [
    {
      id: `${source.id}-base-text`,
      kind: "normal-text",
      subject: { ruleId: "base", property: "color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-secondary-text`,
      kind: "normal-text",
      subject: { ruleId: "secondary", property: "color", editable: true },
      comparison: { ruleId: "secondary", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-base-boundary`,
      kind: "non-text-ui",
      subject: { ruleId: "base", property: "border-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-secondary-boundary`,
      kind: "non-text-ui",
      subject: { ruleId: "base", property: "border-color", editable: true },
      comparison: { ruleId: "secondary", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-disabled-text`,
      kind: "normal-text",
      subject: { ruleId: "disabled", property: "color", editable: true },
      comparison: { ruleId: "disabled", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-disabled-boundary`,
      kind: "non-text-ui",
      subject: { ruleId: "disabled", property: "border-color", editable: true },
      comparison: { ruleId: "disabled", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-focus-inner`,
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-focus-secondary-inner`,
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "secondary", property: "background-color", editable: true },
    },
    {
      id: `${source.id}-focus-outer`,
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "border-color", editable: true },
    },
  ],
  specimens: [
    { id: "default", label: source.label, semanticHtml: source.semanticHtml, demonstrates: ["base", "hover", "focus-visible", "active", "disabled"] },
    { id: "secondary", label: source.secondaryLabel, semanticHtml: source.secondarySemanticHtml, demonstrates: ["secondary"] },
  ],
} satisfies TreatmentDefinition);

const button = createActionControlDefinition({
  id: "button",
  subject: "button",
  label: "Button",
  semanticHtml: '<button type="button">Save preference</button>',
  secondaryLabel: "Secondary button",
  secondarySemanticHtml: '<button type="button" data-variant="secondary">Cancel</button>',
});

export const actionsTreatments = deepFreezeTreatments({ a: link, button });

function deepFreezeTreatments<T extends Readonly<Record<string, TreatmentDefinition>>>(value: T): T {
  Object.freeze(value);
  return value;
}
