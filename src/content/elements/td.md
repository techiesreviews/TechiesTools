---
title: "Table data cell"
group: "Data"
tags: ["td"]
kind: "native"
capability: "data"
purpose: "Data cell within a table row."
treatment: "Use token-backed cell padding while preserving native table layout and header relationships."
use: ["Use for ordinary data inside tr and keep its header relationship clear."]
avoid: "Use outside tr or use td for row and column headers."
constraints: ["Keep colspan and rowspan structurally valid and non-overlapping.","Use headers when a complex table cannot express associations through scope."]
accessibility: ["Ensure every data cell remains associated with its relevant headers at zoom and narrow reflow."]
variants: []
semanticHtml: "<table><tbody><tr><th scope=\"row\">Status</th><td>Draft</td></tr></tbody></table>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/data-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 530
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td"
---

<div class="native-demo"><table><tbody><tr><th scope="row">Status</th><td>Draft</td></tr></tbody></table></div>
