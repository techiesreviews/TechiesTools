import type { TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
  lengthDeclaration as length,
  semanticColorDeclaration as color,
  tokenDeclaration as token,
} from "../declarations.ts";

const select: TreatmentDefinition = {
  schemaVersion: 1,
  rules: [
    {
      id: "base",
      kind: "base",
      selector: ":where(select:not([multiple]):not([size]):not(:disabled):not(:invalid))",
      declarations: {
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
        "min-block-size": length("Minimum block size", "2.75rem"),
        "max-inline-size": length("Maximum inline size", "30rem"),
      },
    },
    {
      id: "focus-visible",
      kind: "state",
      state: "focus-visible",
      selector: ":where(select:not([multiple]):not([size]):not(:disabled):not(:invalid):focus-visible)",
      declarations: {
        "outline-color": color("Focus color", ["focus", "text", "action"], "focus"),
        "outline-style": choice("Focus style", ["solid", "dashed", "dotted"], "solid"),
        "outline-width": length("Focus width", "2px"),
        "outline-offset": length("Focus offset", "-2px", true),
      },
    },
  ],
  contrastChecks: [
    {
      id: "select-text",
      kind: "normal-text",
      subject: { ruleId: "base", property: "color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "select-boundary",
      kind: "non-text-ui",
      subject: { ruleId: "base", property: "border-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "select-focus-inner",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "select-focus-outer",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "border-color", editable: false },
    },
  ],
  specimens: [{
    id: "default",
    label: "Collapsed select",
    semanticHtml: '<label for="choice-intent">Intent</label><select id="choice-intent" name="intent"><option value="">Choose an intent</option><option value="browse">Browse</option><option value="act">Act</option></select>',
    demonstrates: ["base", "focus-visible"],
  }],
};

export const formsChoiceTreatments = Object.freeze({ select });
