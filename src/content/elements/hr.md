---
title: "Thematic break"
group: "Typography"
tags: ["hr"]
kind: "native"
capability: "text"
purpose: "Thematic break or topic shift."
treatment: "Keep native hr semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use when content meaning changes."]
avoid: "Use as decorative line; use CSS instead."
constraints: ["Use only for a thematic break or topic shift, never as a decorative line."]
accessibility: ["Keep the content transition understandable from document structure and surrounding text."]
variants: []
semanticHtml: "<p>First topic.</p><hr><p>New topic.</p>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#thematic-break", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 290
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr"
---

<div class="native-demo"><p>First topic.</p><hr><p>New topic.</p></div>
