import { definePattern } from "../../definition.ts";
import { listingCardMarkup } from "./markup.ts";
import { listingCardDefaultCss, listingCardNestedCss, listingCardSupportCss } from "./styles.ts";

export default definePattern({
  id: "listing-card",
  title: "Listing card",
  category: "Content",
  description: "A responsive property card with inset, edge-to-edge, and progressive-blur image treatments.",
  selector: ".listing-card_component",
  legacyClasses: {
    "pattern-listing-card": "listing-card_component",
    "pattern-listing-card__media": "media",
    "pattern-listing-card__image": "image",
    "pattern-listing-card__image--blur": "image--blur",
    "pattern-listing-card__badge": "badge",
    "pattern-listing-card__favorite": "favorite",
    "pattern-listing-card__body": "body",
    "pattern-listing-card__header": "header",
    "pattern-listing-card__rating": "rating",
    "pattern-listing-card__meta": "meta",
    "pattern-listing-card__footer": "footer",
    "pattern-listing-card__price": "price",
    "pattern-listing-card__action": "action"
  },
  storageVersion: 4,
  previewScale: 0.62,
  html: listingCardMarkup,
  defaultCss: listingCardDefaultCss,
  nestedCss: listingCardNestedCss,
  supportCss: listingCardSupportCss,
  dependencies: ["button"],
  defaultAttributes: { "data-media": "inset" },
  controls: [
    { id: "media", label: "Media", attribute: "data-media", options: [
      { id: "off", label: "Off", attributeValue: null },
      { id: "inset", label: "Inset", attributeValue: "inset" },
      { id: "bleed", label: "Edge", attributeValue: "bleed" },
      { id: "cover", label: "Cover", attributeValue: "cover" },
    ] },
    { id: "density", label: "Density", attribute: "data-density", options: [
      { id: "default", label: "Default", attributeValue: null },
      { id: "compact", label: "Compact", attributeValue: "compact" },
    ] },
    { id: "tone", label: "Tone", attribute: "data-tone", options: [
      { id: "default", label: "Default", attributeValue: null },
      { id: "accent", label: "Accent", attributeValue: "accent" },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "--listing-card-radius", value: "var(--radius-s)" }] },
      { id: "medium", label: "Medium", declarations: [{ property: "--listing-card-radius", value: "var(--radius-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "--listing-card-radius", value: "var(--radius-xl)" }] },
    ] },
  ],
});
