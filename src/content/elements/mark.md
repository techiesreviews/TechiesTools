---
title: "Marked relevance"
group: "Typography"
tags: ["mark"]
kind: "native"
capability: "text"
purpose: "Text highlighted as relevant in current context."
treatment: "Keep native mark semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Ensure meaning survives without color or announcement."]
avoid: "Use as importance or syntax-highlighting marker."
constraints: ["Use only for relevance in the current context, not importance or syntax highlighting."]
accessibility: ["Ensure marked relevance remains understandable without color; maintain AA text contrast."]
variants: []
semanticHtml: "<p>Search result with <mark>matching text</mark>.</p>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 200
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark"
---

<div class="native-demo"><p>Found result: <mark>semantic HTML</mark>.</p></div>
