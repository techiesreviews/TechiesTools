---
title: "Header"
group: "Structure"
tags: ["header"]
kind: "native"
capability: "structure"
purpose: "Introductory or navigational content for page or nearest section."
treatment: "Use Native Fallback. Header presentation depends on its page or section owner and belongs to higher-layer composition."
contextGuidance: "Use header for introductory or navigational content owned by the page or nearest sectioning ancestor. A body-level header may expose a banner landmark; a header nested in article, aside, main, nav, or section does not. Keep its layout and spacing in the owning page, section, or component."
use: ["Use for a page or section introduction; let the nearest semantic owner determine landmark behavior."]
avoid: "Treat every header as the page banner, use it as a styling wrapper, or nest header/footer inside it."
constraints: ["Keep header ownership clear from document structure.","Do not add a redundant banner role or force global header layout."]
accessibility: ["Preserve descriptive heading hierarchy and avoid duplicate unnamed banner landmarks."]
variants: []
semanticHtml: "<header><h2>Section introduction</h2></header>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header", checkedAt: "2026-07-23" }
deprecated: false
order: 10
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header"
---

<div class="native-demo"><header><h2>Section introduction</h2></header></div>
