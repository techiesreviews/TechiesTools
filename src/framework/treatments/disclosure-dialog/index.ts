import type { TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
  lengthDeclaration as length,
  semanticColorDeclaration as color,
} from "../declarations.ts";

const disclosureHtml = "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>";
const dialogHtml = '<dialog open aria-labelledby="promotion-title"><h2 id="promotion-title">Confirm Promotion</h2><form method="dialog"><button value="cancel">Cancel</button><button value="confirm">Promote</button></form></dialog>';

const details: TreatmentDefinition = {
  schemaVersion: 1,
  rules: [{
    id: "base",
    kind: "base",
    selector: ":where(details)",
    declarations: {
      "background-color": color("Background", ["surface"], "surface"),
      "border-color": color("Border color", ["border", "text", "action", "primary"], "border"),
      "border-style": choice("Border style", ["solid", "dashed", "dotted"], "solid"),
      "border-width": length("Border width", "1px"),
      "border-radius": dimension("Border radius", "radius", ["m", "s", "l"], "m"),
      "padding-block-start": dimension("Block start padding", "spacing", ["xs", "s"], "xs"),
      "padding-block-end": dimension("Block end padding", "spacing", ["xs", "s"], "xs"),
      "padding-inline-start": dimension("Inline start padding", "spacing", ["xs", "s"], "xs"),
      "padding-inline-end": dimension("Inline end padding", "spacing", ["xs", "s"], "xs"),
      "margin-block-start": dimension("Block start margin", "spacing", ["m", "l"], "m"),
      "margin-block-end": dimension("Block end margin", "spacing", ["m", "l"], "m"),
    },
  }],
  contrastChecks: [{
    id: "details-boundary",
    kind: "non-text-ui",
    subject: { ruleId: "base", property: "border-color", editable: true },
    comparison: { ruleId: "base", property: "background-color", editable: false },
  }],
  specimens: [{ id: "default", label: "Disclosure", semanticHtml: disclosureHtml, demonstrates: ["base"] }],
};

const summary: TreatmentDefinition = {
  schemaVersion: 1,
  rules: [
    {
      id: "base",
      kind: "base",
      selector: ":where(summary)",
      declarations: {
        "background-color": color("Background", ["surface"], "surface"),
        "font-weight": choice("Font weight", ["600", "700"], "600"),
        "line-height": choice("Line height", ["1.4", "1.5"], "1.4"),
        "padding-block-start": dimension("Block start padding", "spacing", ["2xs", "xs"], "2xs"),
        "padding-block-end": dimension("Block end padding", "spacing", ["2xs", "xs"], "2xs"),
        "padding-inline-start": dimension("Inline start padding", "spacing", ["2xs", "xs"], "2xs"),
        "padding-inline-end": dimension("Inline end padding", "spacing", ["2xs", "xs"], "2xs"),
      },
    },
    {
      id: "focus-visible",
      kind: "state",
      state: "focus-visible",
      selector: ":where(summary:focus-visible)",
      declarations: {
        "outline-color": color("Focus color", ["focus"], "focus"),
        "outline-style": choice("Focus style", ["solid", "dotted", "dashed"], "solid"),
        "outline-width": length("Focus width", "2px"),
        "outline-offset": length("Focus offset", "2px"),
      },
    },
  ],
  contrastChecks: [
    {
      id: "summary-focus-inner",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "summary-focus-outer",
      kind: "non-text-ui",
      subject: { ruleId: "focus-visible", property: "outline-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
  ],
  specimens: [{ id: "default", label: "Disclosure summary", semanticHtml: disclosureHtml, demonstrates: ["base", "focus-visible"] }],
};

const dialog: TreatmentDefinition = {
  schemaVersion: 1,
  rules: [{
    id: "base",
    kind: "base",
    selector: ":where(dialog)",
    declarations: {
      color: color("Text color", ["text"], "text"),
      "background-color": color("Background", ["surface"], "surface"),
      "border-color": color("Border color", ["border", "text", "action", "primary"], "border"),
      "border-style": choice("Border style", ["solid", "dashed", "dotted"], "solid"),
      "border-width": length("Border width", "1px"),
      "border-radius": dimension("Border radius", "radius", ["l", "m"], "l"),
      "padding-block-start": dimension("Block start padding", "spacing", ["l", "m"], "l"),
      "padding-block-end": dimension("Block end padding", "spacing", ["l", "m"], "l"),
      "padding-inline-start": dimension("Inline start padding", "spacing", ["l", "m"], "l"),
      "padding-inline-end": dimension("Inline end padding", "spacing", ["l", "m"], "l"),
      "max-inline-size": length("Maximum inline size", "40rem"),
    },
  }],
  contrastChecks: [
    {
      id: "dialog-text",
      kind: "normal-text",
      subject: { ruleId: "base", property: "color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
    {
      id: "dialog-boundary",
      kind: "non-text-ui",
      subject: { ruleId: "base", property: "border-color", editable: true },
      comparison: { ruleId: "base", property: "background-color", editable: false },
    },
  ],
  specimens: [{ id: "default", label: "Open non-modal dialog", semanticHtml: dialogHtml, demonstrates: ["base"] }],
};

export const disclosureDialogTreatments = Object.freeze({ details, summary, dialog });
