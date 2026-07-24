---
title: "Section"
group: "Structure"
tags: ["section"]
kind: "native"
capability: "structure"
purpose: "Standalone thematic section."
treatment: "Use Native Fallback. Section spacing and composition depend on the owning document or component."
contextGuidance: "Use section for a standalone thematic part of a document when no more specific semantic element fits. Give it a meaningful heading except in rare self-evident cases. Use div when grouping exists only for styling or scripting."
use: ["Use for a named document theme with a meaningful heading."]
avoid: "Use section as a styling-only wrapper or choose it merely to create vertical spacing."
constraints: ["Keep sections aligned with document hierarchy and prefer a more specific semantic element when available.","Do not force gaps, padding, grids, or boundaries from Element CSS."]
accessibility: ["Use a descriptive heading so the section is understandable in heading and landmark navigation."]
variants: []
semanticHtml: "<section aria-labelledby=\"topic\"><h2 id=\"topic\">A named theme</h2></section>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section", checkedAt: "2026-07-23" }
deprecated: false
order: 40
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section"
---

<div class="native-demo"><section aria-labelledby="topic"><h2 id="topic">A named theme</h2></section></div>
