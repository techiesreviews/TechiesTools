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
  activationEvidence?: object;
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
  activationEvidence,
}: ElementLifecycle): "Active" | "Draft" | "Native" => {
  void deprecated;
  if (version === "0.0.0") return "Native";
  if (version.startsWith("0.")) return "Draft";
  if (isStableTreatment(version) && baseline.status === "widely-available" && activationEvidence) return "Active";
  return "Native";
};
