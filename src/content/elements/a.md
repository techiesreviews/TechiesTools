---
title: "Link"
group: "Actions"
tags: ["a"]
kind: "actions"
purpose: "Navigation to a real URL or destination."
treatment: "Keep native a semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide real href and label destination clearly out of context."]
avoid: "Use # or javascript URLs for actions; nest interactive controls."
constraints: ["Use a real href destination; no nested interactive content.","Link label must describe destination out of context."]
accessibility: ["Preserve native focus and Enter activation.","Announce new-tab or download behavior before activation."]
variants: []
semanticHtml: "<a href=\"/elements\">Browse element guidance</a>"
status: "supported"
order: 360
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a"
---

<div class="native-demo"><code>&lt;a&gt;</code><p>Link uses native browser semantics as fallback.</p></div>
