import type { Declaration, TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
} from "../declarations.ts";

const definition = (
  id: string,
  declarations: Record<string, Declaration>,
  label: string,
  semanticHtml: string,
): TreatmentDefinition => ({
  schemaVersion: 1,
  rules: [{
    id: "base",
    kind: "base",
    selector: `:where(${id})`,
    declarations,
  }],
  specimens: [{
    id: "default",
    label,
    semanticHtml,
    demonstrates: ["base"],
  }],
});

const listContainerDeclarations = (): Record<string, Declaration> => ({
  "margin-block-start": dimension("Block start rhythm", "spacing", ["m", "s"], "m"),
  "margin-block-end": dimension("Block end rhythm", "spacing", ["m", "s"], "m"),
  "padding-inline-start": dimension("Marker indentation", "spacing", ["l", "xl"], "l"),
});

const ul = definition("ul", listContainerDeclarations(), "Nested unordered list", "<ul><li>Semantic structure</li><li>Nested guidance<ul><li>Preserve the marker</li></ul></li></ul>");
const ol = definition("ol", listContainerDeclarations(), "Ordered list with authored numbering", '<ol start="3"><li>Third step</li><li value="5">Fifth step</li><li>Sixth step</li></ol>');
const li = definition("li", {
  "margin-block-end": dimension("Item rhythm", "spacing", ["3xs", "2xs"], "3xs"),
}, "List item in context", "<ul><li>One list item in its required parent</li></ul>");
const dl = definition("dl", {
  "margin-block-start": dimension("Block start rhythm", "spacing", ["m", "s"], "m"),
  "margin-block-end": dimension("Block end rhythm", "spacing", ["m", "s"], "m"),
}, "Description list", "<dl><dt>Status</dt><dd>Active</dd><dt>Source</dt><dd>MDN and Framework evidence</dd></dl>");
const dt = definition("dt", {
  "font-weight": choice("Term weight", ["600", "700"], "600"),
  "margin-block-start": dimension("Term group rhythm", "spacing", ["s", "xs"], "s"),
}, "Description term", "<dl><dt>Token</dt><dd>A named design decision.</dd></dl>");
const dd = definition("dd", {
  "margin-inline-start": dimension("Description indentation", "spacing", ["l", "m"], "l"),
  "margin-block-end": dimension("Description rhythm", "spacing", ["s", "xs"], "s"),
}, "Description details", "<dl><dt>Framework</dt><dd>Portable UI preference context.</dd></dl>");

export const listsTreatments = Object.freeze({ ul, ol, li, dl, dt, dd });
