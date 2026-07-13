import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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
  status: z.enum(["supported", "draft", "experimental", "deprecated"]),
  order: z.number().int().positive(),
  sourceUrl: z.string().url(),
}).superRefine((entry, context) => {
  if (entry.status !== "supported") return;
  if (!entry.constraints.length) context.addIssue({ code: "custom", path: ["constraints"], message: "Supported entries require content constraints." });
  if (!entry.accessibility.length) context.addIssue({ code: "custom", path: ["accessibility"], message: "Supported entries require accessibility behavior." });
  if (!entry.semanticHtml.trim()) context.addIssue({ code: "custom", path: ["semanticHtml"], message: "Supported entries require semantic HTML." });
  if (entry.variants.length && !entry.defaultVariant) context.addIssue({ code: "custom", path: ["defaultVariant"], message: "Entries with variants require a defaultVariant." });
});

const elements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/elements" }),
  schema: elementSchema,
});

export const collections = { elements };
