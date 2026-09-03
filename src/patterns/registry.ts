import button from "./library/button/index.ts";
import listingCard from "./library/listing-card/index.ts";
import { catalogEntry, type PatternDefinition } from "./definition.ts";

export const patternDefinitions: readonly PatternDefinition[] = Object.freeze([
  button,
  listingCard,
]);

const definitionsById = new Map(patternDefinitions.map((definition) => [definition.id, definition]));

export const getPatternDefinition = (id: string) => definitionsById.get(id);
export const patternCatalog = Object.freeze(patternDefinitions.map(catalogEntry));
export const patternCategories = [...new Set(patternDefinitions.map(({ category }) => category))];
