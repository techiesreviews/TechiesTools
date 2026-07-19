import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { elementContentSchema } from "./framework/model/index";

const elements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/elements" }),
  schema: elementContentSchema,
});

export const collections = { elements };
