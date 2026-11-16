import { getCollection } from "astro:content";
import { createElementGuidance } from "./guidance-payload.ts";

export const elementGuidance = createElementGuidance(async () =>
  (await getCollection("elements")).map((entry) => ({ id: entry.id, ...entry.data })));
