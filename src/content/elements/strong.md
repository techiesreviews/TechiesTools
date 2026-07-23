---
title: "Strong importance"
group: "Typography"
tags: ["strong"]
kind: "native"
capability: "text"
purpose: "Text with strong importance, seriousness, or urgency."
treatment: "Keep native strong semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use when importance changes meaning."]
avoid: "Use only to make text bold."
constraints: ["Use only when importance, seriousness, or urgency changes meaning."]
accessibility: ["Keep importance understandable without relying on weight alone."]
variants: []
semanticHtml: "<strong>Important text</strong>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 170
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong"
---

<div class="native-demo"><p>Save changes before <strong>closing this window</strong>.</p></div>
