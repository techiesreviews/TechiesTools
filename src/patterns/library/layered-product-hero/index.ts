import { definePattern } from "../../definition.ts";
import { layeredProductHeroMarkup } from "./markup.ts";
import { layeredProductHeroDefaultCss, layeredProductHeroNestedCss, layeredProductHeroSupportCss } from "./styles.ts";

export default definePattern({
  id: "layered-product-hero",
  title: "Layered product hero",
  category: "Marketing",
  description: "A centered product introduction with layered interface reveal.",
  selector: ".layered-product-hero",
  storageVersion: 1,
  previewScale: 0.24,
  previewLayout: "canvas",
  html: layeredProductHeroMarkup,
  defaultCss: layeredProductHeroDefaultCss,
  nestedCss: layeredProductHeroNestedCss,
  supportCss: layeredProductHeroSupportCss,
  dependencies: [
    "button"
  ],
  defaultAttributes: {
    "data-layout": "centered"
  },
  controls: [
    {
      "id": "layout",
      "label": "Layout",
      "attribute": "data-layout",
      "options": [
        {
          "id": "centered",
          "label": "Centered",
          "attributeValue": "centered"
        },
        {
          "id": "offset",
          "label": "Offset",
          "attributeValue": "offset"
        }
      ]
    },
    {
      "id": "radius",
      "label": "Surface radius",
      "options": [
        {
          "id": "soft",
          "label": "Soft",
          "declarations": [
            {
              "property": "--layered-product-hero-radius",
              "value": "var(--radius-xl)"
            }
          ]
        },
        {
          "id": "square",
          "label": "Square",
          "declarations": [
            {
              "property": "--layered-product-hero-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
