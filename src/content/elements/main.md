---
title: "Main"
group: "Structure"
tags: ["main"]
kind: "native"
capability: "structure"
purpose: "Unique dominant page content."
treatment: "Use Native Fallback. Main-content width, spacing, and layout belong to the page."
contextGuidance: "Use main for the document body's dominant unique content. Keep one visible main in ordinary documents, do not nest it, and keep repeated site chrome outside. Apply page width, centering, and section rhythm through page composition."
use: ["Render one visible main per ordinary document for its unique central content."]
avoid: "Nest main elements, place repeated site chrome inside, or use main only as a layout hook."
constraints: ["Keep main as a direct semantic region of the document body rather than a descendant of article, aside, footer, header, or nav.","Do not force width, centering, padding, or section gaps from Element CSS."]
accessibility: ["Keep a single discoverable main landmark and provide a skip link when repeated navigation precedes it."]
variants: []
semanticHtml: "<main><h1>Unique page content</h1></main>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main", checkedAt: "2026-07-23" }
deprecated: false
order: 30
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main"
---

<div class="native-demo"><main><h1>Unique page content</h1></main></div>
