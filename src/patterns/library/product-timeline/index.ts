import { definePattern } from "../../definition.ts";
import { ProductTimelineMarkup } from "./markup.ts";
import { ProductTimelineDefaultCss, ProductTimelineNestedCss, ProductTimelineSupportCss } from "./styles.ts";

export default definePattern({
  id: "product-timeline",
  title: "Product timeline",
  category: "Content",
  description: "A scroll-led record of four workspace eras.",
  selector: ".product-timeline_component",
  scoped: true,
  legacyClasses: {
    "product-timeline": "product-timeline_component"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: ProductTimelineMarkup,
  defaultCss: ProductTimelineDefaultCss,
  nestedCss: ProductTimelineNestedCss,
  supportCss: ProductTimelineSupportCss,
  defaultAttributes: {
    "data-density": "open"
  },
  controls: [
    {
      "id": "density",
      "label": "Density",
      "attribute": "data-density",
      "options": [
        {
          "id": "open",
          "label": "Open",
          "attributeValue": "open"
        },
        {
          "id": "compact",
          "label": "Compact",
          "attributeValue": "compact"
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
              "property": "--product-timeline-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--product-timeline-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
