---
title: "Table foot"
group: "Data"
tags: ["tfoot"]
kind: "native"
capability: "data"
purpose: "Summary or footer row group."
treatment: "Use Native Fallback. Summary-row styling belongs to the owning table component."
contextGuidance: "Use tfoot for rows that summarize the table's columns, such as totals. Place it after the body rows. Do not use it for unrelated notes or assume styling alone communicates the summary."
use: ["Use for totals or stable column summaries after the table body."]
avoid: "Use for unrelated notes or generic footer content."
constraints: ["Place after caption, colgroup, thead, and tbody groups.","Keep summary cells associated with the correct row or column headers."]
accessibility: ["Use th and scope where a summary label heads related values; preserve relationships in print and reflow."]
variants: []
semanticHtml: "<table><tbody><tr><td>Reviewed</td><td>15</td></tr></tbody><tfoot><tr><th scope=\"row\">Total</th><td>15</td></tr></tfoot></table>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot", checkedAt: "2026-07-23" }
deprecated: false
order: 500
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot"
---

<div class="native-demo"><table><tbody><tr><td>Reviewed</td><td>15</td></tr></tbody><tfoot><tr><th scope="row">Total</th><td>15</td></tr></tfoot></table></div>
