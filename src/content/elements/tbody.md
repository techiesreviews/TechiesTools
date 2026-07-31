---
title: "Table body"
group: "Data"
tags: ["tbody"]
kind: "native"
capability: "data"
purpose: "Primary row group in a table."
treatment: "Use Native Fallback. Body-row grouping is semantic; group styling belongs to the owning table component."
contextGuidance: "Use tbody to group the table's primary data rows. Multiple tbody groups are valid when consecutive and semantically useful. Remember that browsers insert an implicit tbody around direct tr children, so do not depend on table > tr selectors."
use: ["Group related primary data rows, using consecutive groups when the data has meaningful sections."]
avoid: "Split rows arbitrarily for appearance or rely on table > tr selectors."
constraints: ["Place after caption, colgroup, and thead and before tfoot.","Keep rows and cell spans structurally valid."]
accessibility: ["Preserve source order and header relationships across every body group."]
variants: []
semanticHtml: "<table><tbody><tr><th scope=\"row\">button</th><td>Supported</td></tr></tbody></table>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody", checkedAt: "2026-07-23" }
deprecated: false
order: 490
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody"
---

<div class="native-demo"><table><tbody><tr><th scope="row">button</th><td>Supported</td></tr></tbody></table></div>
