---
title: "Button"
group: "Actions"
tags: ["button"]
kind: "native"
purpose: "Submit or execute an action in current interface."
treatment: "Keep native button semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Set explicit type and accessible name; preserve visible focus."]
avoid: "Use for navigation or omit type inside form."
constraints: ["Set an explicit type; button submits by default inside forms.","Use for actions, not navigation."]
accessibility: ["Provide an accessible name, including icon-only buttons.","Preserve visible focus and native keyboard activation."]
variants: []
semanticHtml: "<button type=\"button\">Save preference</button>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button", checkedAt: "2026-07-16" }
deprecated: false
order: 370
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button"
---

<div class="native-demo"><button type="button">Run action</button></div>
