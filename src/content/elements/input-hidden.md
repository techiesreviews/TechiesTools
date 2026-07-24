---
title: "Input: hidden"
group: "Forms"
tags: ["input[type=\"hidden\"]"]
kind: "native"
capability: "non-rendered"
purpose: "Hidden submitted value."
contextGuidance: "Use hidden only for non-sensitive submitted values that need no user interaction. Treat every value as editable client input, validate it on the server, and never expect visual, focus, input, or change behavior."
treatment: "Keep Native Fallback with no visual Definition. Hidden inputs are not rendered and cannot be focused."
use: ["Use for non-sensitive data that must submit with form."]
avoid: "Store secrets or trust client-controlled values."
constraints: ["Set a meaningful name and validate the submitted value on the server.","Do not use hidden inputs for secrets, authorization, or trusted state."]
accessibility: ["Do not attach labels, focus behavior, or user instructions to hidden inputs; expose any user-relevant value elsewhere."]
variants: []
semanticHtml: "<input type=\"hidden\" name=\"context-id\" value=\"example\">"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden", checkedAt: "2026-07-23" }
deprecated: false
order: 920
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden"
---

<div class="native-demo"><input id="input-hidden-demo" type="hidden" name="context-id" value="example"><code>&lt;input type="hidden" name="context-id" value="example"&gt;</code><p>Hidden values submit with the form but provide no visible or focusable control.</p></div>
