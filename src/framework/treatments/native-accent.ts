import type { TreatmentDefinition } from "../model/index.ts";
import { semanticColorDeclaration } from "./declarations.ts";

type NativeAccentSource = {
  id: string;
  subject: string;
  label: string;
  semanticHtml: string;
  selectorSubject?: string;
};

export const createNativeAccentDefinition = (source: NativeAccentSource): TreatmentDefinition => ({
  schemaVersion: 1,
  ...(source.selectorSubject ? { selectorSubject: source.selectorSubject } : {}),
  rules: [{
    id: "base",
    kind: "base",
    selector: `:where(${source.subject})`,
    declarations: {
      "accent-color": semanticColorDeclaration("Accent color", ["action", "primary"], "action"),
    },
  }],
  specimens: [{
    id: "default",
    label: source.label,
    semanticHtml: source.semanticHtml,
    demonstrates: ["base"],
  }],
});
