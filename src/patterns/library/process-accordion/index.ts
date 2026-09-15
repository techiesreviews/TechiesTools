import { definePattern } from "../../definition.ts";
import { ProcessAccordionMarkup } from "./markup.ts";
import { ProcessAccordionDefaultCss, ProcessAccordionNestedCss, ProcessAccordionSupportCss } from "./styles.ts";

export default definePattern({
  id: "process-accordion",
  title: "Process accordion",
  category: "Content",
  description: "A four-step native disclosure process.",
  selector: ".process-accordion",
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: ProcessAccordionMarkup,
  defaultCss: ProcessAccordionDefaultCss,
  nestedCss: ProcessAccordionNestedCss,
  supportCss: ProcessAccordionSupportCss,
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
              "value": "clamp(var(--space-xl),7%,var(--space-4xl))"
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
              "property": "--process-accordion-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--process-accordion-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
