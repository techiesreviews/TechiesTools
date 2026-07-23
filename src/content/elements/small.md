---
title: "Side comment"
group: "Typography"
tags: ["small"]
kind: "native"
capability: "text"
purpose: "Side comments, legal text, or small print."
treatment: "Keep native small semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use when content is semantically secondary."]
avoid: "Use as generic font-size utility."
constraints: ["Use for side comments, legal text, or small print; never as a generic size utility."]
accessibility: ["Retain readable size, contrast, wrapping, and zoom behavior."]
variants: []
semanticHtml: "<small>Terms and supporting detail.</small>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 190
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small"
---

<div class="native-demo"><small>Terms apply. Last updated July 2026.</small></div>
