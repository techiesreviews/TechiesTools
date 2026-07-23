---
title: "Legend"
group: "Forms"
tags: ["legend"]
kind: "form"
capability: "form-control"
purpose: "Caption for a fieldset group."
treatment: "Use the body family at the base size with bold emphasis, compact line height, and small logical inline padding."
use: ["Make the first child of fieldset and describe the shared question or group."]
avoid: "Use outside a fieldset or as a decorative heading without grouped controls."
constraints: ["Keep the caption concise and specific to every control in the fieldset.","Do not replace the legend with visual text outside the fieldset."]
accessibility: ["Preserve the legend as the programmatic group name.","Keep text readable at zoom without clipping or forced single-line layout."]
variants: []
semanticHtml: "<fieldset><legend>Notification method</legend><label><input type=\"checkbox\" name=\"email\"> Email</label></fieldset>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-composition-treatments.md#fieldset-and-legend", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 650
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend"
---

<div class="native-demo"><fieldset><legend>Notification method</legend><label><input type="checkbox"> Email</label></fieldset></div>
