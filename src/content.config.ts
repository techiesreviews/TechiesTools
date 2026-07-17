import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { baselineStatuses, isSemanticVersion, isStableTreatment } from "./framework/element-lifecycle";

const elementSchema = z.object({
  title: z.string(),
  group: z.enum(["Structure", "Typography", "Lists", "Actions", "Media", "Data", "Forms", "Disclosure"]),
  tags: z.array(z.string()).min(1),
  kind: z.enum(["type", "actions", "form", "table", "figure", "disclosure", "dialog", "native"]),
  purpose: z.string(),
  treatment: z.string(),
  use: z.array(z.string()).min(1),
  avoid: z.string(),
  constraints: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  variants: z.array(z.object({ name: z.string(), when: z.string() })).default([]),
  defaultVariant: z.string().optional(),
  semanticHtml: z.string().default(""),
  version: z.string().refine(isSemanticVersion, "Element Treatment version must be valid SemVer."),
  baseline: z.object({
    status: z.enum(baselineStatuses),
    source: z.literal("mdn"),
    sourceUrl: z.string().url(),
    checkedAt: z.string().date(),
    note: z.string().min(1).optional(),
  }),
  deprecated: z.boolean(),
  deprecationReason: z.string().min(1).optional(),
  deprecationReplacement: z.string().min(1).optional(),
  order: z.number().int().positive(),
  sourceUrl: z.string().url(),
}).superRefine((entry, context) => {
  if (entry.deprecated && !entry.deprecationReason) context.addIssue({ code: "custom", path: ["deprecationReason"], message: "Deprecated entries require a reason." });
  if (entry.deprecated && !entry.deprecationReplacement) context.addIssue({ code: "custom", path: ["deprecationReplacement"], message: "Deprecated entries require a replacement." });
  if (entry.baseline.status === "unknown/not-applicable" && !entry.baseline.note) context.addIssue({ code: "custom", path: ["baseline", "note"], message: "Unknown MDN Baseline entries require a note." });
  if (isStableTreatment(entry.version)) {
    if (!entry.constraints.length) context.addIssue({ code: "custom", path: ["constraints"], message: "Stable entries require content constraints." });
    if (!entry.accessibility.length) context.addIssue({ code: "custom", path: ["accessibility"], message: "Stable entries require accessibility behavior." });
    if (!entry.semanticHtml.trim()) context.addIssue({ code: "custom", path: ["semanticHtml"], message: "Stable entries require semantic HTML." });
  }
  if (entry.variants.length && !entry.defaultVariant) context.addIssue({ code: "custom", path: ["defaultVariant"], message: "Entries with variants require a defaultVariant." });
});

const elements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/elements" }),
  schema: elementSchema,
});

export const collections = { elements };
