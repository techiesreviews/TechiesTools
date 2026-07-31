---
title: "Inline quotation"
group: "Typography"
tags: ["q"]
kind: "native"
capability: "text"
purpose: "Short inline quotation."
treatment: "Keep native q semantics; style with Framework tokens without removing browser fallback behavior."
contextGuidance: "Use q for a short inline quotation and let the browser supply language-appropriate quotation marks; use blockquote for extended quoted material."
use: ["Let browser supply quotation marks."]
avoid: "Type duplicate quotation marks around q."
constraints: ["Do not type duplicate quotation marks around the element."]
accessibility: ["Preserve browser-generated quotation marks and language-aware quotation behavior."]
variants: []
semanticHtml: "<p>The review called it <q>clear and reusable</q>.</p>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q", checkedAt: "2026-07-23" }
deprecated: false
order: 240
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q"
---

<div class="native-demo"><p>The review called it <q>clear and reusable</q>.</p></div>
