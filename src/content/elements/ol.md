---
title: "Ordered list"
group: "Lists"
tags: ["ol"]
kind: "native"
capability: "list"
purpose: "Items whose sequence or rank matters."
treatment: "Use token-backed block rhythm and marker indentation while preserving native numbering, nesting, and authored start, reversed, and value behavior."
use: ["Preserve meaningful order; use start/reversed/value only when needed."]
avoid: "Use when order is irrelevant."
constraints: ["Keep li as semantic children and use start, reversed, or li value only when the authored sequence requires it.","Do not replace numbering with generated text or visual-only counters."]
accessibility: ["Preserve the native list role, sequence, and visible markers at zoom and narrow reflow."]
variants: []
semanticHtml: "<ol start=\"3\"><li>Third step</li><li value=\"5\">Fifth step</li><li>Sixth step</li></ol>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 310
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol"
---

<div class="native-demo"><ol start="3"><li>Third step</li><li value="5">Fifth step</li><li>Sixth step</li></ol></div>
