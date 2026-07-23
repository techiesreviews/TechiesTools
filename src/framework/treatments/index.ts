import { actionsTreatments } from "./actions/index.ts";
import { formsCompositionTreatments } from "./forms-composition/index.ts";
import { formsTextEntryTreatments } from "./forms-text-entry/index.ts";
import { typographyTreatments } from "./typography/index.ts";
import type { TreatmentModules } from "../catalog/index.ts";

export const treatmentModules: TreatmentModules = Object.freeze({
  ...typographyTreatments,
  ...actionsTreatments,
  ...formsCompositionTreatments,
  ...formsTextEntryTreatments,
});
