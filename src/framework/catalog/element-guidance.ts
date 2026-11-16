import { getCollection } from "astro:content";
import { createElementGuidancePayload } from "./guidance-payload.ts";

export const elementGuidancePayload = createElementGuidancePayload(async () =>
  (await getCollection("elements")).map((entry) => ({ id: entry.id, ...entry.data })));
