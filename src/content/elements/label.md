---
title: "Label"
group: "Forms"
tags: ["label"]
kind: "form"
capability: "form-control"
purpose: "Accessible label for a form control."
treatment: "Use the body family at the small type token with semibold emphasis and comfortable line height. Preserve native inline behavior so layout remains contextual."
use: ["Associate explicitly with matching for/id values or wrap one labelable control."]
avoid: "Use placeholder text as a label or place unrelated interactive content inside."
constraints: ["Associate label explicitly with a unique control id or wrap the control.","Do not use placeholder text as the label."]
accessibility: ["Keep labels visible and descriptive; avoid unrelated interactive content inside."]
variants: []
semanticHtml: "<label for=\"email\">Email address</label><input id=\"email\" type=\"email\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-composition-treatments.md#label", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 580
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label"
---

<div class="native-demo"><label for="label-demo">Email address</label><input id="label-demo" type="email" autocomplete="email"></div>
