---
title: "Details"
group: "Disclosure"
tags: ["details"]
kind: "disclosure"
capability: "disclosure"
purpose: "Expandable disclosure with a visible native summary and browser-owned open state."
treatment: "Use a semantic surface, one-pixel boundary, token radius, logical padding, and block rhythm without changing native disclosure state or marker behavior."
use: ["Place summary first and use a clear label that remains accurate whether content is open or closed."]
avoid: "Add custom keyboard handlers or scripted state already supplied by the native element."
constraints: ["Use summary as the first child with a clear state-independent label.","Treat the open attribute as boolean: its presence means open.","Do not alter display, overflow, generated content, or the native marker."]
accessibility: ["Preserve native focus, Enter, and Space behavior; Escape-to-close is not required.","Keep disclosure content understandable with the summary alone before activation."]
variants: []
semanticHtml: "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/disclosure-dialog-treatments.md#details-and-summary", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 680
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details"
---

<div class="native-demo"><details><summary>Review guidance</summary><p>Disclosure content.</p></details></div>
