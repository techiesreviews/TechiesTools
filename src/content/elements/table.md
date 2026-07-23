---
title: "Table"
group: "Data"
tags: ["table"]
kind: "table"
purpose: "Two-dimensional data with row and column relationships."
treatment: "Keep native table semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use caption and structural header cells for real data."]
avoid: "Use table for page layout."
constraints: ["Use for two-dimensional data, never page layout.","Provide caption, real header cells, and meaningful row groups."]
accessibility: ["Preserve table semantics inside responsive wrappers; do not convert cells to generic display blocks."]
variants: []
semanticHtml: "<table><caption>Token status</caption><thead><tr><th scope=\"col\">Token</th><th scope=\"col\">Status</th></tr></thead><tbody><tr><td>Color</td><td>Supported</td></tr></tbody></table>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table", checkedAt: "2026-07-16" }
deprecated: false
order: 460
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table"
---

<div class="native-demo"><code>&lt;table&gt;</code><p>Table uses native browser semantics as fallback.</p></div>
