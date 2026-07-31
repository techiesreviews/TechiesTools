import { z } from "zod";

export const guidedWebsiteSteps = ["project", "composition", "density", "surface", "voice", "review"] as const;
export type GuidedWebsiteStep = (typeof guidedWebsiteSteps)[number];

export const guidedWebsiteDecisionValues = {
  composition: ["structured", "editorial"],
  density: ["airy", "information-rich"],
  surface: ["quiet", "layered"],
  voice: ["direct", "expressive"],
} as const;

export type GuidedWebsiteDecisionId = keyof typeof guidedWebsiteDecisionValues;
export type GuidedWebsiteDecisionValue = (typeof guidedWebsiteDecisionValues)[GuidedWebsiteDecisionId][number];

const projectSchema = z.object({
  organization: z.string(),
  offer: z.string(),
  audience: z.string(),
  primaryAction: z.string(),
}).strict();

const unansweredDecisionSchema = z.object({ status: z.literal("unanswered") }).strict();
const skippedDecisionSchema = z.object({ status: z.literal("skipped") }).strict();
const selectedDecisionSchema = <T extends readonly [string, ...string[]]>(values: T) => z.object({
  status: z.literal("selected"),
  value: z.enum(values),
}).strict();
const decisionSchema = <T extends readonly [string, ...string[]]>(values: T) => z.discriminatedUnion("status", [
  unansweredDecisionSchema,
  skippedDecisionSchema,
  selectedDecisionSchema(values),
]);

export const guidedWebsiteDraftSchema = z.object({
  schemaVersion: z.literal(1),
  currentStep: z.enum(guidedWebsiteSteps),
  project: projectSchema,
  decisions: z.object({
    composition: decisionSchema(guidedWebsiteDecisionValues.composition),
    density: decisionSchema(guidedWebsiteDecisionValues.density),
    surface: decisionSchema(guidedWebsiteDecisionValues.surface),
    voice: decisionSchema(guidedWebsiteDecisionValues.voice),
  }).strict(),
}).strict();

export type GuidedWebsiteDraft = z.infer<typeof guidedWebsiteDraftSchema>;
export type GuidedWebsiteProject = GuidedWebsiteDraft["project"];

export type GuidedWebsiteAction =
  | { type: "set-project"; project: GuidedWebsiteProject }
  | { type: "choose"; decision: GuidedWebsiteDecisionId; value: GuidedWebsiteDecisionValue }
  | { type: "skip"; decision: GuidedWebsiteDecisionId }
  | { type: "set-step"; step: GuidedWebsiteStep }
  | { type: "reset" };

export interface GuidedWebsiteProgress {
  resolvedDecisions: number;
  totalDecisions: number;
  completedProjectFields: number;
  totalProjectFields: number;
  readyForFirstDraft: boolean;
}

export const createGuidedWebsiteDraft = (): GuidedWebsiteDraft => ({
  schemaVersion: 1,
  currentStep: "project",
  project: {
    organization: "",
    offer: "",
    audience: "",
    primaryAction: "",
  },
  decisions: {
    composition: { status: "unanswered" },
    density: { status: "unanswered" },
    surface: { status: "unanswered" },
    voice: { status: "unanswered" },
  },
});

const isDecisionValue = (
  decision: GuidedWebsiteDecisionId,
  value: GuidedWebsiteDecisionValue,
): boolean => (guidedWebsiteDecisionValues[decision] as readonly string[]).includes(value);

export const applyGuidedWebsiteAction = (
  draft: GuidedWebsiteDraft,
  action: GuidedWebsiteAction,
): GuidedWebsiteDraft => {
  if (action.type === "reset") return createGuidedWebsiteDraft();
  if (action.type === "set-step") return { ...draft, currentStep: action.step };
  if (action.type === "set-project") return { ...draft, project: { ...action.project } };
  if (action.type === "skip") {
    return {
      ...draft,
      decisions: {
        ...draft.decisions,
        [action.decision]: { status: "skipped" },
      },
    };
  }
  if (!isDecisionValue(action.decision, action.value)) return draft;
  return {
    ...draft,
    decisions: {
      ...draft.decisions,
      [action.decision]: { status: "selected", value: action.value },
    },
  } as GuidedWebsiteDraft;
};

export const guidedWebsiteProgress = (draft: GuidedWebsiteDraft): GuidedWebsiteProgress => {
  const projectValues = Object.values(draft.project);
  const decisions = Object.values(draft.decisions);
  const completedProjectFields = projectValues.filter((value) => value.trim().length > 0).length;
  const resolvedDecisions = decisions.filter((decision) => decision.status !== "unanswered").length;
  const totalProjectFields = projectValues.length;
  const totalDecisions = decisions.length;
  return {
    resolvedDecisions,
    totalDecisions,
    completedProjectFields,
    totalProjectFields,
    readyForFirstDraft: completedProjectFields === totalProjectFields && resolvedDecisions === totalDecisions,
  };
};

export const guidedWebsiteLastAvailableStep = (draft: GuidedWebsiteDraft): GuidedWebsiteStep => {
  const progress = guidedWebsiteProgress(draft);
  if (progress.completedProjectFields < progress.totalProjectFields) return "project";
  for (const decision of Object.keys(guidedWebsiteDecisionValues) as GuidedWebsiteDecisionId[]) {
    if (draft.decisions[decision].status === "unanswered") return decision;
  }
  return "review";
};

export const parseGuidedWebsiteDraft = (value: unknown): GuidedWebsiteDraft | null => {
  const result = guidedWebsiteDraftSchema.safeParse(value);
  return result.success ? result.data : null;
};

export const guidedWebsiteDecisionLabels: Record<GuidedWebsiteDecisionId, Record<string, string>> = {
  composition: {
    structured: "Product-led",
    editorial: "Editorial-led",
  },
  density: {
    airy: "Campaign pace",
    "information-rich": "Editorial scan",
  },
  surface: {
    quiet: "Quiet canvas",
    layered: "Layered workspace",
  },
  voice: {
    direct: "Utility-first",
    expressive: "Expressive campaign",
  },
};

const skippedGuidance: Record<GuidedWebsiteDecisionId, string> = {
  composition: "No additional preference; use the active Framework's prescriptive composition default",
  density: "No additional preference; derive density from the content and active Framework",
  surface: "No additional preference; follow Active Treatments and the active Framework",
  voice: "No additional preference; follow the active Framework and supplied copy",
};

const compileDecision = (draft: GuidedWebsiteDraft, decision: GuidedWebsiteDecisionId): string => {
  const evidence = draft.decisions[decision];
  if (evidence.status === "selected") return guidedWebsiteDecisionLabels[decision][evidence.value];
  if (evidence.status === "skipped") return skippedGuidance[decision];
  return "Unanswered; do not invent a preference";
};

const compileVoiceExample = (draft: GuidedWebsiteDraft): string => {
  const evidence = draft.decisions.voice;
  if (evidence.status === "skipped") return "No approved example; follow the supplied copy and active Framework default";
  if (evidence.status === "unanswered") return "Unanswered; do not invent a voice preference";
  return evidence.value === "direct"
    ? "“Make complex ideas clear.” Follow with the supplied offer verbatim."
    : "“Big idea? Good. Make it impossible to ignore.” Follow with the supplied offer verbatim and “Built to stand out, not blend in.”";
};

const briefValue = (value: string): string => value.trim().replace(/\s+/g, " ") || "Not supplied";

export const compileGuidedWebsiteBrief = (draft: GuidedWebsiteDraft): string => [
  "# Guided Website Brief",
  "",
  "## Project",
  "",
  `- Organization: ${briefValue(draft.project.organization)}`,
  `- Offer: ${briefValue(draft.project.offer)}`,
  `- Primary audience: ${briefValue(draft.project.audience)}`,
  `- Primary action: ${briefValue(draft.project.primaryAction)}`,
  "",
  "## Approved direction",
  "",
  `- Composition: ${compileDecision(draft, "composition")}`,
  `- Density: ${compileDecision(draft, "density")}`,
  `- Surface: ${compileDecision(draft, "surface")}`,
  `- Voice: ${compileDecision(draft, "voice")}`,
  `- Approved voice example: ${compileVoiceExample(draft)}`,
  "",
  "## Framework relationship",
  "",
  "- Treat the active Framework, its Tokens, and Active Element Treatments as prescriptive defaults.",
  "- Apply the approved direction only where it adds information the Framework does not already own.",
  "- Do not turn unanswered decisions into claimed brand preferences.",
  "- Do not mutate the Active Framework automatically. Return reusable discoveries as reviewable proposals.",
  "",
].join("\n");

export interface GuidedWebsiteFrameworkContext {
  markdown: string;
  frameworkVersion: string;
  sourceRevision: string;
  contextSchemaVersion: string;
  contentHash: string;
}

export const compileGuidedWebsiteGenerationContext = (
  draft: GuidedWebsiteDraft,
  framework: GuidedWebsiteFrameworkContext,
): string => {
  const header = [
    compileGuidedWebsiteBrief(draft).trimEnd(),
    "",
    "## Active Framework provenance",
    "",
    `- Framework version: ${briefValue(framework.frameworkVersion)}`,
    `- Source revision: ${briefValue(framework.sourceRevision)}`,
    `- Context schema version: ${briefValue(framework.contextSchemaVersion)}`,
    `- Content hash (semantic; not an exact artifact digest): ${briefValue(framework.contentHash)}`,
    "",
    "---",
    "",
    "## Active Framework Context (verbatim)",
    "",
    "",
  ].join("\n");
  return `${header}${framework.markdown}`;
};
