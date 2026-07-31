---
title: "Footer"
group: "Structure"
tags: ["footer"]
kind: "native"
capability: "structure"
purpose: "Footer for nearest sectioning ancestor or page."
treatment: "Use Native Fallback. Footer arrangement and separation belong to its nearest section or page owner."
contextGuidance: "Use footer for information about its nearest sectioning ancestor or the page, such as authorship, copyright, or related links. A body-level footer may expose contentinfo; a footer nested in sectioning content does not. Keep layout and separators in the owner."
use: ["Keep footer content scoped to its nearest sectioning ancestor or page."]
avoid: "Assume every footer is page-level contentinfo or use it as a generic bottom-aligned container."
constraints: ["Keep footer ownership clear from document structure.","Do not add redundant contentinfo roles or force bottom positioning, grids, padding, or separators."]
accessibility: ["Avoid duplicate unnamed contentinfo landmarks and keep footer links descriptively labeled."]
variants: []
semanticHtml: "<article><footer>Article ownership</footer></article>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer", checkedAt: "2026-07-23" }
deprecated: false
order: 70
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer"
---

<div class="native-demo"><article><footer>Article ownership</footer></article></div>
