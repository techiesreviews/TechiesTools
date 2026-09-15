import { definePattern } from "../../definition.ts";
import { featureDirectoryMarkup } from "./markup.ts";
import { featureDirectoryDefaultCss, featureDirectoryNestedCss, featureDirectorySupportCss } from "./styles.ts";

export default definePattern({
  id: "feature-directory",
  title: "Feature directory",
  category: "Content",
  description: "A native radio-filtered feature catalogue.",
  selector: ".feature-directory",
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: featureDirectoryMarkup,
  defaultCss: featureDirectoryDefaultCss,
  nestedCss: featureDirectoryNestedCss,
  supportCss: featureDirectorySupportCss,
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
      "label": "Card radius",
      "options": [
        {
          "id": "round",
          "label": "Round",
          "declarations": [
            {
              "property": "--feature-directory-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--feature-directory-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
