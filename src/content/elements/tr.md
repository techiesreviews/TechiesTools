---
title: "Table row"
group: "Data"
tags: ["tr"]
kind: "native"
capability: "data"
purpose: "Row of cells in a table."
treatment: "Use Native Fallback. Row surfaces, striping, and states require an explicit table or component owner."
contextGuidance: "Prefer tr inside an explicit thead, tbody, or tfoot and keep its th and td cells aligned with the table's column structure. Direct table rows are valid only when no tbody is present and they follow any caption, colgroup, and thead; browsers insert an implicit tbody in the DOM. Keep striping and selectable-row states in the owning table component."
use: ["Prefer an explicit row group; use direct table rows only in the valid no-tbody sequence."]
avoid: "Place outside table structure, mix direct rows with an authored tbody, or use as a flex or grid layout row."
constraints: ["Keep cell count and spans compatible with the table structure.","Account for the browser-inserted tbody when selecting direct authored rows; do not replace native table-row display."]
accessibility: ["Preserve cell source order and header associations across every row."]
variants: []
semanticHtml: "<table><tbody><tr><th scope=\"row\">Status</th><td>Supported</td></tr></tbody></table>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr", checkedAt: "2026-07-23" }
deprecated: false
order: 510
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr"
---

<div class="native-demo"><table><tbody><tr><th scope="row">Status</th><td>Supported</td></tr></tbody></table></div>
