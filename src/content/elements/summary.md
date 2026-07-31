---
title: "Summary"
group: "Disclosure"
tags: ["summary"]
kind: "native"
capability: "disclosure"
purpose: "Visible, interactive label that toggles its parent details disclosure."
treatment: "Use stronger type, compact logical padding, and token-backed focus indication while preserving the browser marker and list-item behavior."
use: ["Place as the first child of details and keep its label accurate in both open and closed states."]
avoid: "Use outside details as a generic heading or replace its native marker with generated content."
constraints: ["Keep summary as the first child of details.","Preserve the native marker, display behavior, focusability, and keyboard activation.","Do not add duplicate click or keyboard handlers."]
accessibility: ["Keep the focus-visible outline unobscured.","Preserve native Enter and Space activation across keyboard and touch input."]
variants: []
semanticHtml: "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/disclosure-dialog-treatments.md#details-and-summary", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 690
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary"
---

<div class="native-demo"><details><summary>Review guidance</summary><p>Disclosure content.</p></details></div>
