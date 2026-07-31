---
title: "Abbreviation"
group: "Typography"
tags: ["abbr"]
kind: "native"
capability: "text"
purpose: "Abbreviation or acronym with an available expansion."
treatment: "Keep native abbr semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Expand visibly on first use; title is secondary help only."]
avoid: "Rely on hover tooltip as sole explanation."
constraints: ["Expand visibly on first use; treat title as secondary help only."]
accessibility: ["Do not rely on a hover-only title tooltip; keep the abbreviation visually identifiable."]
variants: []
semanticHtml: "<abbr title=\"Web Content Accessibility Guidelines\">WCAG</abbr>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#prose-and-inline-semantics", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 210
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr"
---

<div class="native-demo"><p><abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.2 guidance</p></div>
