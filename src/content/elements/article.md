---
title: "Article"
group: "Structure"
tags: ["article"]
kind: "native"
capability: "structure"
purpose: "Self-contained reusable or distributable composition."
treatment: "Use Native Fallback. Article layout and surface treatment depend on the owning feed, page, or component."
contextGuidance: "Use article for a self-contained composition that remains meaningful when distributed or reused independently, such as a story, post, comment, or product record. Give it a heading and keep card surfaces, grids, and spacing in the owning component."
use: ["Use for independently reusable or distributable content and identify it with a heading."]
avoid: "Use for content that depends entirely on surrounding context or merely needs a card appearance."
constraints: ["Keep nested articles meaningfully related to the owning article and independently identifiable.","Do not force a card surface, border, width, or layout from Element CSS."]
accessibility: ["Use descriptive headings so article boundaries remain understandable in document navigation."]
variants: []
semanticHtml: "<article><h2>Reusable story</h2><p>Self-contained content.</p></article>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article", checkedAt: "2026-07-23" }
deprecated: false
order: 50
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article"
---

<div class="native-demo"><article><h2>Reusable story</h2><p>Self-contained content.</p></article></div>
