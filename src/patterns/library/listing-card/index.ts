import { definePattern } from "../../definition.ts";
import { listingCardMarkup } from "./markup.ts";
import { listingCardDefaultCss, listingCardNestedCss } from "./styles.ts";

export default definePattern({
  id: "listing-card",
  title: "Listing card",
  category: "Content",
  description: "A responsive property card with inset, edge-to-edge, and progressive-blur image treatments.",
  selector: ".pattern-listing-card",
  storageVersion: 4,
  previewScale: 0.62,
  html: listingCardMarkup,
  defaultCss: listingCardDefaultCss,
  nestedCss: listingCardNestedCss,
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
