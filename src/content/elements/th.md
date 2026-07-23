---
title: "Table header cell"
group: "Data"
tags: ["th"]
kind: "native"
capability: "data"
purpose: "Header for a row, column, or group of cells."
treatment: "Keep native th semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Set scope when relationship is not obvious; use headers/id for complex tables."]
avoid: "Use td styled bold as semantic header."
constraints: ["Use for row or column headers, not bold data.","Set scope when relationships are not immediately obvious."]
accessibility: ["Use id/headers for complex tables where scope cannot express the relationship."]
variants: []
semanticHtml: "<tr><th scope=\"row\">Color</th><td>Supported</td></tr>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th", checkedAt: "2026-07-16" }
deprecated: false
order: 520
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th"
---

<div class="native-demo"><table><tbody><tr><th scope="row">Status</th><td>Supported</td></tr></tbody></table></div>
