export const baselineStatuses = [
  "widely-available",
  "newly-available",
  "limited-availability",
  "unknown/not-applicable",
] as const;

export type BaselineStatus = (typeof baselineStatuses)[number];

export type ElementLifecycle = {
  version: string;
  baseline: { status: BaselineStatus; source: "mdn"; sourceUrl: string; checkedAt: string; note?: string };
  deprecated: boolean;
  hasPromotedTreatment?: boolean;
  definitionValid?: boolean;
  overridesValid?: boolean;
  accessibilityPassed?: boolean;
  overridesReviewed?: boolean;
};

const numericIdentifier = "(?:0|[1-9]\\d*)";
const nonNumericIdentifier = "(?:\\d*[A-Za-z-][0-9A-Za-z-]*)";
const prereleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
const semver = new RegExp(`^${numericIdentifier}\\.${numericIdentifier}\\.${numericIdentifier}(?:-${prereleaseIdentifier}(?:\\.${prereleaseIdentifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

export const isSemanticVersion = (value: string) => semver.test(value);

export const isStableTreatment = (version: string) => {
  return isSemanticVersion(version) && !version.includes("-") && Number(version.split(".")[0]) >= 1;
};

export const deriveElementReferenceState = ({
  version,
  baseline,
  deprecated,
  hasPromotedTreatment = false,
  definitionValid = false,
  overridesValid = false,
  accessibilityPassed = false,
  overridesReviewed = false,
}: ElementLifecycle): "Active" | "Draft" | "Native" => {
  void deprecated;
  if (!isStableTreatment(version)) return "Draft";
  if (hasPromotedTreatment && baseline.status === "widely-available" && definitionValid && overridesValid && accessibilityPassed && overridesReviewed) return "Active";
  return "Native";
};
