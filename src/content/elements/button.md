---
title: "Button"
group: "Actions"
tags: ["button"]
kind: "native"
capability: "interactive"
purpose: "Submit or execute an action in current interface."
treatment: "Keep native button semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Set explicit type and accessible name; preserve visible focus."]
avoid: "Use for navigation or omit type inside form."
constraints: ["Set an explicit type; button submits by default inside forms.","Use for actions, not navigation."]
accessibility: ["Provide an accessible name, including icon-only buttons.","Preserve visible focus and native keyboard activation."]
variants: [{ name: "secondary", when: "Use for a valid lower-priority action beside one primary action." }]
defaultVariant: "default"
semanticHtml: "<button type=\"button\">Save preference</button>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button", checkedAt: "2026-07-16" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/element-catalog.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "src/content/elements", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
order: 370
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button"
---

<div class="native-demo">
  <button type="button">Save preference</button>
  <button type="button" data-variant="secondary">Cancel</button>
  <button type="button" disabled>Unavailable</button>
</div>
