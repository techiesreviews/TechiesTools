---
title: "Table caption"
group: "Data"
tags: ["caption"]
kind: "native"
capability: "data"
purpose: "Accessible title or description for a table."
treatment: "Use token-backed caption type emphasis and block padding while preserving its native table association."
use: ["Place as the first child of table and describe the table's purpose concisely."]
avoid: "Replace with visually nearby text that lacks the programmatic table association."
constraints: ["Use one caption per table and keep it specific enough to help a reader decide whether to inspect the data."]
accessibility: ["Keep the caption visible and meaningful; do not hide the table's accessible name in surrounding prose."]
variants: []
semanticHtml: "<table><caption>Framework tokens</caption><tbody><tr><th scope=\"row\">Color</th><td>OKLCH</td></tr></tbody></table>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/data-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 470
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption"
---

<div class="native-demo"><table><caption>Framework tokens</caption><tbody><tr><th scope="row">Color</th><td>OKLCH</td></tr></tbody></table></div>
