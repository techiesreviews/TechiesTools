import type { Declaration, TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
  lengthDeclaration as length,
} from "../declarations.ts";

const imageSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E";
const figureSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E";
const definition = (
  id: string,
  declarations: Record<string, Declaration>,
  label: string,
  semanticHtml: string,
): TreatmentDefinition => ({
  schemaVersion: 1,
  rules: [{ id: "base", kind: "base", selector: `:where(${id})`, declarations }],
  specimens: [{ id: "default", label, semanticHtml, demonstrates: ["base"] }],
});

const img = definition("img", {
  "max-inline-size": length("Responsive maximum", "100%", false, true),
  "block-size": choice("Automatic block size", ["auto"], "auto"),
  "border-radius": dimension("Corner radius", "radius", ["m", "s", "l"], "m"),
}, "Responsive image", `<img width="480" height="240" src="${imageSource}" alt="Blue geometric placeholder showing image proportions">`);

const figure = definition("figure", {
  "margin-block-start": dimension("Block start rhythm", "spacing", ["m", "l"], "m"),
  "margin-block-end": dimension("Block end rhythm", "spacing", ["m", "l"], "m"),
  "margin-inline-start": length("Inline start margin", "0"),
  "margin-inline-end": length("Inline end margin", "0"),
}, "Figure with caption", `<figure><img width="480" height="240" src="${figureSource}" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure>`);

const figcaption = definition("figcaption", {
  "font-size": dimension("Caption size", "typography", ["s", "xs"], "s"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
  "margin-block-start": dimension("Caption separation", "spacing", ["2xs", "xs"], "2xs"),
}, "Figure caption", `<figure><img width="480" height="240" src="${figureSource}" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure>`);

export const mediaTreatments = Object.freeze({ img, figure, figcaption });
