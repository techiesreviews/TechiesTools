import type { TreatmentDefinition } from "../../model/index.ts";
import {
  choiceDeclaration as choice,
  dimensionDeclaration as dimension,
  tokenDeclaration as token,
} from "../declarations.ts";

const address = {
  schemaVersion: 1,
  rules: [{
    id: "base",
    kind: "base",
    selector: ":where(address)",
    declarations: {
      "font-family": token("Font family", "typography", ["family-body"], "family-body"),
      "font-style": choice("Font style", ["normal", "italic"], "normal"),
      "line-height": choice("Line height", ["1.5", "1.6"], "1.5"),
      "margin-block-start": dimension("Block start rhythm", "spacing", ["s", "m"], "s"),
      "margin-block-end": dimension("Block end rhythm", "spacing", ["s", "m"], "s"),
    },
  }],
  specimens: [{
    id: "default",
    label: "Contact information",
    semanticHtml: '<address>Techies Tools<br><a href="mailto:hello@example.test">hello@example.test</a></address>',
    demonstrates: ["base"],
  }],
} satisfies TreatmentDefinition;

export const structureTreatments = Object.freeze({ address });
