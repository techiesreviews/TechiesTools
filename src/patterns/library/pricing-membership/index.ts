import { definePattern } from "../../definition.ts";
import { PricingMembershipMarkup } from "./markup.ts";
import { PricingMembershipDefaultCss, PricingMembershipNestedCss, PricingMembershipSupportCss } from "./styles.ts";

export default definePattern({
  id: "pricing-membership",
  title: "Pricing membership",
  category: "Marketing",
  description: "A sample membership comparison with native billing selection.",
  selector: ".pricing-membership_component",
  scoped: true,
  legacyClasses: {
    "pricing-membership": "pricing-membership_component",
    "pricing-membership__tiers": "tiers"
  },
  storageVersion: 1,
  previewScale: 0.32,
  previewLayout: "canvas",
  html: PricingMembershipMarkup,
  defaultCss: PricingMembershipDefaultCss,
  nestedCss: PricingMembershipNestedCss,
  supportCss: PricingMembershipSupportCss,
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
              "property": "--pricing-membership-radius",
              "value": "var(--radius-l)"
            }
          ]
        },
        {
          "id": "tight",
          "label": "Tight",
          "declarations": [
            {
              "property": "--pricing-membership-radius",
              "value": "var(--radius-s)"
            }
          ]
        }
      ]
    }
  ],
});
