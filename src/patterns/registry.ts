import badge from "./library/badge/index.ts";
import button from "./library/button/index.ts";
import card from "./library/card/index.ts";
import clickableCard from "./library/clickable-card/index.ts";
import listingCard from "./library/listing-card/index.ts";
import { catalogEntry, type PatternDefinition } from "./definition.ts";

export const patternDefinitions: readonly PatternDefinition[] = Object.freeze([
  button,
  badge,
  card,
  clickableCard,
  listingCard,
]);

const definitionsById = new Map(patternDefinitions.map((definition) => [definition.id, definition]));

export const getPatternDefinition = (id: string) => definitionsById.get(id);
export const patternCatalog = Object.freeze(patternDefinitions.map(catalogEntry));
export const patternCategories = [...new Set(patternDefinitions.map(({ category }) => category))];
