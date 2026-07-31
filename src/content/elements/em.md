---
title: "Stress emphasis"
group: "Typography"
tags: ["em"]
kind: "native"
capability: "text"
purpose: "Stress that changes spoken meaning."
treatment: "Keep native em semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use for semantic emphasis; nesting increases emphasis."]
avoid: "Use only to make text italic."
constraints: ["Use only for stress emphasis that changes spoken meaning."]
accessibility: ["Keep emphasis understandable from wording and semantics, not styling alone."]
variants: []
semanticHtml: "<em>Stressed emphasis</em>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 180
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em"
---

<div class="native-demo"><p>I asked for the <em>current</em> version.</p></div>
