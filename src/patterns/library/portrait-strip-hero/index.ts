import { definePattern } from "../../definition.ts";
import { portraitStripHeroMarkup } from "./markup.ts";
import { portraitStripHeroDefaultCss, portraitStripHeroNestedCss, portraitStripHeroSupportCss } from "./styles.ts";

export default definePattern({
  id: "portrait-strip-hero",
  title: "Portrait strip hero",
  category: "Marketing",
  description: "A creator-focused hero with a moving portrait filmstrip.",
  selector: ".portrait-strip-hero_component",
  scoped: true,
  legacyClasses: {
    "portrait-strip-hero": "portrait-strip-hero_component",
    "portrait-strip-hero__intro": "intro",
    "portrait-strip-hero__action": "action",
    "portrait-strip-hero__strip": "strip"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: portraitStripHeroMarkup,
  defaultCss: portraitStripHeroDefaultCss,
  nestedCss: portraitStripHeroNestedCss,
  supportCss: portraitStripHeroSupportCss,
  dependencies: [
    "button"
  ],
  defaultAttributes: {
    "data-tone": "warm"
  },
  controls: [
    {
      "id": "tone",
      "label": "Tone",
      "attribute": "data-tone",
      "options": [
        {
          "id": "warm",
          "label": "Warm",
          "attributeValue": "warm"
        },
        {
          "id": "quiet",
          "label": "Quiet",
          "attributeValue": "quiet"
        }
      ]
    },
    {
      "id": "space",
      "label": "Spacing",
      "options": [
        {
          "id": "compact",
          "label": "Compact",
          "declarations": [
            {
              "property": "--portrait-strip-hero-space",
              "value": "var(--space-2xl)"
            }
          ]
        },
        {
          "id": "open",
          "label": "Open",
          "declarations": [
            {
              "property": "--portrait-strip-hero-space",
              "value": "var(--space-4xl)"
            }
          ]
        }
      ]
    }
  ],
});
