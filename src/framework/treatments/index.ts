import { actionsTreatments } from "./actions/index.ts";
import { typographyTreatments } from "./typography/index.ts";
import type { TreatmentModules } from "../catalog/index.ts";

export const treatmentModules: TreatmentModules = Object.freeze({
  ...typographyTreatments,
  ...actionsTreatments,
});
