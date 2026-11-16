import { buildElementCatalog, type ElementCatalog } from "./index.ts";
import { treatmentModules } from "../treatments/index.ts";
import { starterTokenRegistry } from "../starter/index.ts";

const checkedCatalog = (guidance: readonly unknown[]): ElementCatalog => {
  const catalog = buildElementCatalog({ guidance, treatments: treatmentModules, tokens: starterTokenRegistry });
  if (!catalog.success) throw new Error(catalog.diagnostics.map((item) => `${item.code}: ${item.message}`).join("\n"));
  return catalog.data;
};

/**
 * The Element Catalog the Framework pages render, and the guidance they inline for their
 * browser controller. The guidance never changes while the site runs, so it is read,
 * checked and serialized once per server instance, not on every page request.
 */
export const createElementGuidance = (
  loadGuidance: () => Promise<readonly unknown[]>,
  buildCatalog: (guidance: readonly unknown[]) => ElementCatalog = checkedCatalog,
) => {
  let built: Promise<{ catalog: ElementCatalog; serializedGuidance: string }> | undefined;
  return () => built ??= loadGuidance().then((guidance) => ({
    catalog: buildCatalog(guidance),
    serializedGuidance: JSON.stringify(guidance).replaceAll("<", "\\u003c"),
  }));
};
