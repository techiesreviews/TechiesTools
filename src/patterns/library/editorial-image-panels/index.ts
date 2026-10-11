import { definePattern } from "../../definition.ts";
import { EditorialImagePanelsMarkup } from "./markup.ts";
import { EditorialImagePanelsDefaultCss, EditorialImagePanelsNestedCss, EditorialImagePanelsSupportCss } from "./styles.ts";

export default definePattern({
  id: "editorial-image-panels",
  title: "Editorial image panels",
  category: "Editorial",
  description: "Full-bleed editorial panels with numbered chapters.",
  selector: ".editorial-image-panels_component",
  legacyClasses: {
    "editorial-image-panels": "editorial-image-panels_component"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: EditorialImagePanelsMarkup,
  defaultCss: EditorialImagePanelsDefaultCss,
  nestedCss: EditorialImagePanelsNestedCss,
  supportCss: EditorialImagePanelsSupportCss,
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
              "property": "--editorial-image-panels-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--editorial-image-panels-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
