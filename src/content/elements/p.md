---
title: "Paragraph"
group: "Typography"
tags: ["p"]
kind: "native"
capability: "text"
purpose: "Related block of prose."
treatment: "Keep native p semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use for regular text and let CSS control spacing."]
avoid: "Insert empty paragraphs for layout."
constraints: ["Contain phrasing content; use CSS rather than empty paragraphs for spacing."]
accessibility: ["Keep regular prose at readable measure and text-m scale."]
variants: []
semanticHtml: "<p>One related paragraph of regular text.</p>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 160
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p"
---

<div class="native-demo"><p>Regular paragraph text uses the Framework body scale and native paragraph semantics.</p></div>
