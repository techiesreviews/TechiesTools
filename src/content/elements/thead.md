---
title: "Table head"
group: "Data"
tags: ["thead"]
kind: "native"
capability: "data"
purpose: "Group of table header rows."
treatment: "Use Native Fallback. Row-group surfaces and separators require an explicit table or component owner."
contextGuidance: "Use thead to group the table rows that define column-heading information. Place it after caption and colgroup, before tbody or tfoot. Keep row-group colors, separators, and print treatment in the owning table component."
use: ["Group rows that contain the table's column headings."]
avoid: "Use only as a styling hook or place ordinary data rows in the head group."
constraints: ["Place after caption and colgroup and before body or foot row groups.","Keep each row composed of th and td cells with truthful header relationships."]
accessibility: ["Use th cells and appropriate scope or headers relationships; thead alone does not create headers."]
variants: []
semanticHtml: "<table><thead><tr><th scope=\"col\">Element</th><th scope=\"col\">Status</th></tr></thead><tbody><tr><td>button</td><td>Supported</td></tr></tbody></table>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead", checkedAt: "2026-07-23" }
deprecated: false
order: 480
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead"
---

<div class="native-demo"><table><thead><tr><th scope="col">Element</th><th scope="col">Status</th></tr></thead><tbody><tr><td>button</td><td>Supported</td></tr></tbody></table></div>
