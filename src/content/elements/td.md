---
title: "Table data cell"
group: "Data"
tags: ["td"]
kind: "native"
purpose: "Data cell within a table row."
treatment: "Keep native td semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Keep cell relationship clear through headers."]
avoid: "Use outside tr."
constraints: ["Place inside tr and use only for data cells.","Keep spans from creating ambiguous header relationships."]
accessibility: ["Ensure each data cell remains associated with its relevant headers."]
variants: []
semanticHtml: "<tr><th scope=\"row\">Color</th><td>Supported</td></tr>"
status: "supported"
order: 530
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td"
---

<div class="native-demo"><table><tbody><tr><th scope="row">Status</th><td>Draft</td></tr></tbody></table></div>
