import { definePattern } from "../../definition.ts";
import { PortraitTestimonialsMarkup } from "./markup.ts";
import { PortraitTestimonialsDefaultCss, PortraitTestimonialsNestedCss, PortraitTestimonialsSupportCss } from "./styles.ts";

export default definePattern({
  id: "portrait-testimonials",
  title: "Portrait testimonials",
  category: "Editorial",
  description: "Editorial sample quotes with native portrait selection.",
  selector: ".portrait-testimonials_component",
  legacyClasses: {
    "portrait-testimonials": "portrait-testimonials_component",
    "portrait-testimonials__quotes": "quotes"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: PortraitTestimonialsMarkup,
  defaultCss: PortraitTestimonialsDefaultCss,
  nestedCss: PortraitTestimonialsNestedCss,
  supportCss: PortraitTestimonialsSupportCss,
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
              "value": "var(--space-2xl) var(--space-l)"
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
              "property": "--portrait-testimonials-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--portrait-testimonials-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
