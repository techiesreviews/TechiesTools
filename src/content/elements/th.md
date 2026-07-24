---
title: "Table header cell"
group: "Data"
tags: ["th"]
kind: "native"
capability: "data"
purpose: "Header for a row, column, or group of cells."
treatment: "Use token-backed header emphasis and cell padding while preserving native table-cell relationships."
use: ["Use for a row, column, row-group, or column-group header and set scope when the relationship benefits from explicitness."]
avoid: "Use a bold td as a semantic substitute or use th for ordinary data."
constraints: ["Set scope for row, col, rowgroup, or colgroup relationships when useful.","Use id and headers for complex tables where scope cannot express the relationship."]
accessibility: ["Keep header text concise and ensure each related data cell has an unambiguous programmatic association."]
variants: []
semanticHtml: "<table><tbody><tr><th scope=\"row\">Color</th><td>Supported</td></tr></tbody></table>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/data-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 520
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th"
---

<div class="native-demo"><table><tbody><tr><th scope="row">Color</th><td>Supported</td></tr></tbody></table></div>
