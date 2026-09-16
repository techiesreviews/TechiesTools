import { definePattern } from "../../definition.ts";
import { FeatureJourneyMarkup } from "./markup.ts";
import { FeatureJourneyDefaultCss, FeatureJourneyNestedCss, FeatureJourneySupportCss } from "./styles.ts";

export default definePattern({
  id: "feature-journey",
  title: "Feature journey",
  category: "Content",
  description: "A three-step decision workflow with expandable detail.",
  selector: ".feature-journey_component",
  scoped: true,
  legacyClasses: {
    "feature-journey": "feature-journey_component",
    "feature-journey__diagram": "diagram"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: FeatureJourneyMarkup,
  defaultCss: FeatureJourneyDefaultCss,
  nestedCss: FeatureJourneyNestedCss,
  supportCss: FeatureJourneySupportCss,
  dependencies: [
    "button"
  ],
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
              "property": "--feature-journey-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--feature-journey-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
