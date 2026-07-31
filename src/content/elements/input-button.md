---
title: "Input: button"
group: "Forms"
tags: ["input[type=\"button\"]"]
kind: "native"
capability: "form-control"
purpose: "Generic button input."
treatment: "Use the shared action-control color, boundary, spacing, hover, focus, active, disabled, and secondary intent. Preserve native push-button behavior."
use: ["Use button element instead for richer accessible content."]
avoid: "Omit a real declarative or scripted action or an accessible name."
constraints: ["Provide an explicit value and a real declarative or scripted action; this input otherwise has no default behavior.","Prefer button when the label requires markup, an icon, or richer state."]
accessibility: ["Use value as a concise accessible name and announce the result of scripted actions when it is not otherwise apparent.","Preserve focus, keyboard activation, disabled state, and touch target."]
variants: [{ name: "secondary", when: "Use for a valid lower-priority scripted action." }]
defaultVariant: "default"
semanticHtml: "<input type=\"button\" value=\"Open options\" onclick=\"this.nextElementSibling.textContent='Options opened.'\"><output aria-live=\"polite\"></output>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#button-like-inputs", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 900
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button"
---

<div class="native-demo"><input type="button" value="Open options" onclick="this.nextElementSibling.textContent='Options opened.'"><output aria-live="polite"></output></div>
