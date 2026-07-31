---
title: "Table"
group: "Data"
tags: ["table"]
kind: "table"
capability: "data"
purpose: "Two-dimensional data with row and column relationships."
treatment: "Use token-backed table typography and logical block rhythm while preserving native table layout and relationships."
use: ["Use for real two-dimensional data with a concise caption and structural header cells."]
avoid: "Use table for page layout or convert table descendants to generic display boxes for small screens."
constraints: ["Provide caption, real header cells, and meaningful row groups.","Place wide tables in an authored overflow wrapper or higher-layer responsive composition; Element CSS does not own that wrapper."]
accessibility: ["Preserve table semantics, reading order, caption, scope, and headers relationships at zoom and narrow reflow."]
variants: []
semanticHtml: "<table><caption>Token status</caption><thead><tr><th scope=\"col\">Token</th><th scope=\"col\">Status</th></tr></thead><tbody><tr><td>Color</td><td>Supported</td></tr></tbody></table>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/data-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/data-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 460
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table"
---

<div class="native-demo"><table><caption>Token status</caption><thead><tr><th scope="col">Token</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Color</td><td>Supported</td></tr></tbody></table></div>
