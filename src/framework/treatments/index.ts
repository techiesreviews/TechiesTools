import { actionsTreatments } from "./actions/index.ts";
import { dataTreatments } from "./data/index.ts";
import { formsCompositionTreatments } from "./forms-composition/index.ts";
import { formsChoiceTreatments } from "./forms-choice/index.ts";
import { formsFileActionTreatments } from "./forms-file-action/index.ts";
import { formsNumericTemporalTreatments } from "./forms-numeric-temporal/index.ts";
import { formsTextEntryTreatments } from "./forms-text-entry/index.ts";
import { listsTreatments } from "./lists/index.ts";
import { structureTreatments } from "./structure/index.ts";
import { typographyTreatments } from "./typography/index.ts";
import type { TreatmentModules } from "../catalog/index.ts";

export const treatmentModules: TreatmentModules = Object.freeze({
  ...structureTreatments,
  ...typographyTreatments,
  ...actionsTreatments,
  ...dataTreatments,
  ...formsCompositionTreatments,
  ...formsChoiceTreatments,
  ...formsFileActionTreatments,
  ...formsNumericTemporalTreatments,
  ...formsTextEntryTreatments,
  ...listsTreatments,
});
