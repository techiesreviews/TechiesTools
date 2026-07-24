import type { Declaration, TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
  tokenDeclaration as token,
} from "../declarations.ts";
import { createNativeAccentDefinition } from "../native-accent.ts";

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

const cellSpacing = (): Record<string, Declaration> => ({
  "padding-block-start": dimension("Block start padding", "spacing", ["2xs", "xs"], "2xs"),
  "padding-block-end": dimension("Block end padding", "spacing", ["2xs", "xs"], "2xs"),
  "padding-inline-start": dimension("Inline start padding", "spacing", ["xs", "s"], "xs"),
  "padding-inline-end": dimension("Inline end padding", "spacing", ["xs", "s"], "xs"),
});

const table = definition("table", {
  "font-family": token("Font family", "typography", ["family-body"], "family-body"),
  "font-size": dimension("Font size", "typography", ["s", "m"], "s"),
  "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
  "margin-block-start": dimension("Block start rhythm", "spacing", ["m", "s"], "m"),
  "margin-block-end": dimension("Block end rhythm", "spacing", ["m", "s"], "m"),
}, "Data table", '<table><caption>Token status</caption><thead><tr><th scope="col">Token</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Color</td><td>Supported</td></tr></tbody></table>');

const caption = definition("caption", {
  "font-size": dimension("Caption size", "typography", ["m", "s"], "m"),
  "font-weight": choice("Caption weight", ["700", "600"], "700"),
  "line-height": choice("Line height", ["1.4", "1.5"], "1.4"),
  "padding-block-start": dimension("Block start padding", "spacing", ["2xs", "xs"], "2xs"),
  "padding-block-end": dimension("Block end padding", "spacing", ["2xs", "xs"], "2xs"),
}, "Table caption", '<table><caption>Framework tokens</caption><tbody><tr><th scope="row">Color</th><td>OKLCH</td></tr></tbody></table>');

const th = definition("th", {
  "font-weight": choice("Header weight", ["700", "600"], "700"),
  ...cellSpacing(),
}, "Header cell", '<table><tbody><tr><th scope="row">Color</th><td>Supported</td></tr></tbody></table>');

const td = definition("td", cellSpacing(), "Data cell", '<table><tbody><tr><th scope="row">Status</th><td>Draft</td></tr></tbody></table>');

const progress = createNativeAccentDefinition({
  id: "progress",
  subject: "progress",
  label: "Task progress",
  semanticHtml: '<label for="export-progress">Export progress</label><progress id="export-progress" max="100" value="68">68%</progress>',
});

export const dataTreatments = Object.freeze({ table, caption, th, td, progress });
