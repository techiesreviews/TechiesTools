import { definePattern } from "../../definition.ts";
import { TestimonialRailMarkup } from "./markup.ts";
import { TestimonialRailDefaultCss, TestimonialRailNestedCss, TestimonialRailSupportCss } from "./styles.ts";

export default definePattern({
  id: "testimonial-rail",
  title: "Testimonial rail",
  category: "Editorial",
  description: "A keyboard reachable rail of editorial example reviews.",
  selector: ".testimonial-rail_component",
  scoped: true,
  legacyClasses: {
    "testimonial-rail": "testimonial-rail_component",
    "testimonial-rail__track": "track",
    "testimonial-rail__byline": "byline"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: TestimonialRailMarkup,
  defaultCss: TestimonialRailDefaultCss,
  nestedCss: TestimonialRailNestedCss,
  supportCss: TestimonialRailSupportCss,
  controls: [
    {
      "id": "space",
      "label": "Spacing",
      "options": [
        {
          "id": "open",
          "label": "Open",
          "declarations": [
            {
              "property": "padding",
              "value": "clamp(var(--space-xl),6%,var(--space-4xl))"
            }
          ]
        },
        {
          "id": "compact",
          "label": "Compact",
          "declarations": [
            {
              "property": "padding",
              "value": "var(--space-xl) var(--space-l)"
            }
          ]
        }
      ]
    },
    {
      "id": "radius",
      "label": "Radius",
      "options": [
        {
          "id": "soft",
          "label": "Soft",
          "declarations": [
            {
              "property": "--testimonial-rail-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--testimonial-rail-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
