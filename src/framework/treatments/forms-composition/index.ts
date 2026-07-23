import type { Declaration, TreatmentDefinition, TokenFamily } from "../../model/index.ts";

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
const length = (label: string, value: string): Declaration => ({
  label,
  control: { kind: "length" },
  starter: { kind: "length", value },
});
const dimension = (label: string, family: "typography" | "spacing" | "radius", names: readonly string[], starter = names[0]) =>
  token(label, family, names, starter);
const color = (label: string, names: readonly string[], starter = names[0]) => token(label, "semantic", names, starter);
const definition = (
  id: string,
  declarations: Record<string, Declaration>,
  semanticHtml: string,
  label: string,
  contrastChecks?: TreatmentDefinition["contrastChecks"],
) => ({
  schemaVersion: 1 as const,
  rules: [{ id: "base", kind: "base" as const, selector: `:where(${id})`, declarations }],
  ...(contrastChecks ? { contrastChecks } : {}),
  specimens: [{ id: "default", label, semanticHtml, demonstrates: ["base"] }],
} satisfies TreatmentDefinition);

const label = definition("label", {
  "font-family": token("Font family", "typography", ["family-body"]),
  "font-size": dimension("Font size", "typography", ["s", "m"], "s"),
  "font-weight": choice("Font weight", ["600", "700"], "600"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
}, '<label for="composition-email">Email address</label><input id="composition-email" type="email" autocomplete="email">', "Control label");

const fieldset = definition("fieldset", {
  "background-color": color("Background", ["surface"], "surface"),
  "border-color": color("Border color", ["border", "text", "action", "primary"], "border"),
  "border-style": choice("Border style", ["solid", "dashed", "dotted"], "solid"),
  "border-width": length("Border width", "1px"),
  "border-radius": dimension("Border radius", "radius", ["m", "s"], "m"),
  "padding-block-start": dimension("Block start padding", "spacing", ["m", "s"], "m"),
  "padding-block-end": dimension("Block end padding", "spacing", ["m", "s"], "m"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["m", "s"], "m"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["m", "s"], "m"),
  "margin-block-start": dimension("Block start margin", "spacing", ["m", "l"], "m"),
  "margin-block-end": dimension("Block end margin", "spacing", ["m", "l"], "m"),
}, '<fieldset><legend>Preferred format</legend><label><input type="radio" name="format" value="html"> HTML</label><label><input type="radio" name="format" value="react"> React</label></fieldset>', "Related controls", [{
  id: "fieldset-boundary",
  kind: "non-text-ui",
  subject: { ruleId: "base", property: "border-color", editable: true },
  comparison: { ruleId: "base", property: "background-color", editable: false },
}]);

const legend = definition("legend", {
  "font-family": token("Font family", "typography", ["family-body"]),
  "font-size": dimension("Font size", "typography", ["m", "l"], "m"),
  "font-weight": choice("Font weight", ["700", "600"], "700"),
  "line-height": choice("Line height", ["1.2", "1.5"], "1.2"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["3xs", "4xs"], "3xs"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["3xs", "4xs"], "3xs"),
}, '<fieldset><legend>Notification method</legend><label><input type="checkbox" name="email"> Email</label></fieldset>', "Group caption");

const output = definition("output", {
  color: color("Text color", ["text", "action"], "text"),
  "font-family": token("Font family", "typography", ["family-body"]),
  "font-size": dimension("Font size", "typography", ["m", "l"], "m"),
  "font-weight": choice("Font weight", ["700", "600"], "700"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
}, '<form><label for="quantity">Quantity</label><input id="quantity" type="number" value="2"> <output name="total" for="quantity">€24.00</output></form>', "Calculated result");

export const formsCompositionTreatments = Object.freeze({
  label,
  fieldset,
  legend,
  output,
});
