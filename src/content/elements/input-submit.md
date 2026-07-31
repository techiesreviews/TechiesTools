---
title: "Input: submit"
group: "Forms"
tags: ["input[type=\"submit\"]"]
kind: "native"
capability: "form-control"
purpose: "Submit control."
treatment: "Use the shared action-control color, boundary, spacing, hover, focus, active, disabled, and secondary intent. Preserve native form submission and validation behavior."
use: ["Set an explicit value as the accessible name; prefer button when rich content is needed."]
avoid: "Use multiple ambiguous submit actions."
constraints: ["Keep the input associated with the intended form and preserve formaction, formenctype, formmethod, formnovalidate, and formtarget behavior.","Do not intercept native validation or submission without an equivalent error and progress flow."]
accessibility: ["Use a concise action label in value and preserve visible focus, keyboard activation, disabled state, and touch target.","Distinguish multiple submit actions by result, not vague labels."]
variants: [{ name: "secondary", when: "Use for a valid lower-priority submit action such as saving a draft." }]
defaultVariant: "default"
semanticHtml: "<form><input type=\"submit\" value=\"Submit order\"></form>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#button-like-inputs", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 880
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit"
---

<div class="native-demo"><form><input type="submit" value="Submit order"></form></div>
