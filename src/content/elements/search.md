---
title: "Search"
group: "Structure"
tags: ["search"]
kind: "native"
capability: "structure"
purpose: "Search or filtering controls and related suggestions."
treatment: "Use Native Fallback. Search-control arrangement belongs to the owning form or component."
contextGuidance: "Use search as the native landmark around controls, suggestions, and actions that perform search or filtering. Keep results in main content, not inside search. Do not duplicate role=search; use a labeled form role=search only when a legacy support target requires the fallback."
use: ["Use the native search landmark around search or filter controls and related suggestions."]
avoid: "Put results inside search, duplicate role=search, or use search for unrelated form controls."
constraints: ["Keep result content outside search and associate every control with a visible label.","Do not force form layout, gaps, width, or positioning from Element CSS."]
accessibility: ["Label multiple search landmarks distinctly and preserve native form-control keyboard, focus, validation, and submission behavior."]
variants: []
semanticHtml: "<search><form><label for=\"query\">Search</label><input id=\"query\" type=\"search\"></form></search>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search", checkedAt: "2026-07-23" }
deprecated: false
order: 90
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search"
---

<div class="native-demo"><search><form><label for="query">Search</label><input id="query" type="search"></form></search></div>
