---
title: "Citation title"
group: "Typography"
tags: ["cite"]
kind: "native"
capability: "text"
purpose: "Title of a cited creative work."
treatment: "Keep native cite semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use for work title, not generic author name."]
avoid: "Use as author attribution merely for italics."
constraints: ["Use for the title of a cited creative work, not a generic author name."]
accessibility: ["Keep the work title identifiable without depending on italics alone."]
variants: []
semanticHtml: "<cite>The Design of Everyday Things</cite>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#quotations", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 250
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite"
---

<div class="native-demo"><p>Read <cite>HTML Living Standard</cite>.</p></div>
