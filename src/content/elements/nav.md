---
title: "Navigation"
group: "Structure"
tags: ["nav"]
kind: "native"
capability: "structure"
purpose: "Major navigation block."
treatment: "Use Native Fallback. Navigation arrangement belongs to its owning component or section."
contextGuidance: "Use nav for a major set of links that navigates within or beyond the document. Give navigation landmarks with different content or purpose distinct short labels; repeated navigation with the same links and purpose should reuse the same label. Keep link arrangement, gaps, and responsive behavior in the owning component."
use: ["Use for major menus, tables of contents, or indexes; label navigation landmarks by their content and purpose."]
avoid: "Wrap every small link group in nav or add a redundant navigation role."
constraints: ["Keep landmark names concise; distinguish different navigation purposes, but reuse the same name for repeated navigation with identical links and purpose.","Do not force lists, flex, grid, or page positioning from Element CSS."]
accessibility: ["Ensure keyboard users can reach every link and landmark names accurately communicate whether navigation regions are the same or different."]
variants: []
semanticHtml: "<nav aria-label=\"Example\"><a href=\"/overview\">Overview</a></nav>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav", checkedAt: "2026-07-23" }
deprecated: false
order: 20
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav"
---

<div class="native-demo"><nav aria-label="Example"><a href="/overview">Overview</a></nav></div>
