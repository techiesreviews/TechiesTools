import { buildElementCatalog } from "./index.ts";
import { treatmentModules } from "../treatments/index.ts";
import { starterTokenRegistry } from "../starter/index.ts";

const assertValidCatalog = (guidance: readonly unknown[]) => {
  const catalog = buildElementCatalog({ guidance, treatments: treatmentModules, tokens: starterTokenRegistry });
  if (!catalog.success) throw new Error(catalog.diagnostics.map((item) => `${item.code}: ${item.message}`).join("\n"));
};

/**
 * The Element guidance a Framework page inlines for its browser controller. The guidance
 * never changes while the site runs, so it is read, checked against the Element Catalog
 * and serialized once per server instance, not on every page request.
 */
export const createElementGuidancePayload = (
  loadGuidance: () => Promise<readonly unknown[]>,
  validate: (guidance: readonly unknown[]) => void = assertValidCatalog,
) => {
  let payload: Promise<string> | undefined;
  return () => payload ??= loadGuidance().then((guidance) => {
    validate(guidance);
    return JSON.stringify(guidance).replaceAll("<", "\\u003c");
  });
};
