---
title: "Input: reset"
group: "Forms"
tags: ["input[type=\"reset\"]"]
kind: "native"
capability: "form-control"
purpose: "Reset control."
treatment: "Use the shared action-control color, boundary, spacing, hover, focus, active, disabled, and secondary intent. Preserve native reset-to-initial-values behavior."
use: ["Use rarely and clearly distinguish from submit."]
avoid: "Place near submit where accidental activation is likely."
constraints: ["Use only when returning every form control to its initial value is genuinely helpful.","Do not substitute reset for clearing saved data or undoing server-side changes."]
accessibility: ["Use an explicit value that names the scope of the reset.","Separate it spatially and visually from submit actions while preserving focus, keyboard, disabled, and touch behavior."]
variants: [{ name: "secondary", when: "Prefer this lower-emphasis intent when a reset is necessary beside a submit action." }]
defaultVariant: "default"
semanticHtml: "<form><label for=\"reset-example\">Example value</label><input id=\"reset-example\" name=\"example\" type=\"text\" value=\"Initial value\"><input type=\"reset\" value=\"Reset form\"></form>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#button-like-inputs", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-file-action-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-file-action-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 890
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset"
---

<div class="native-demo"><form><label for="reset-example">Example value</label><input id="reset-example" name="example" type="text" value="Initial value"><input type="reset" value="Reset form"></form></div>
