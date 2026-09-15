import button from "./library/button/index.ts";
import listingCard from "./library/listing-card/index.ts";
import stackedScrollPanel from "./library/stacked-scroll-panel/index.ts";
import portraitStripHero from "./library/portrait-strip-hero/index.ts";
import layeredProductHero from "./library/layered-product-hero/index.ts";
import featureDirectory from "./library/feature-directory/index.ts";
import productTimeline from "./library/product-timeline/index.ts";
import editorialImagePanels from "./library/editorial-image-panels/index.ts";
import featureJourney from "./library/feature-journey/index.ts";
import pricingMembership from "./library/pricing-membership/index.ts";
import processAccordion from "./library/process-accordion/index.ts";
import portraitTestimonials from "./library/portrait-testimonials/index.ts";
import testimonialRail from "./library/testimonial-rail/index.ts";
import { catalogEntry, type PatternDefinition } from "./definition.ts";

export const patternDefinitions: readonly PatternDefinition[] = Object.freeze([
  button,
  listingCard,
  stackedScrollPanel,
  portraitStripHero,
  layeredProductHero,
  featureDirectory,
  productTimeline,
  editorialImagePanels,
  featureJourney,
  pricingMembership,
  processAccordion,
  portraitTestimonials,
  testimonialRail,
]);

const definitionsById = new Map(patternDefinitions.map((definition) => [definition.id, definition]));

export const getPatternDefinition = (id: string) => definitionsById.get(id);
export const patternCatalog = Object.freeze(patternDefinitions.map(catalogEntry));
export const patternCategories = [...new Set(patternDefinitions.map(({ category }) => category))];
