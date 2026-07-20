---
title: "Input"
group: "Forms"
tags: ["input"]
kind: "form"
purpose: "Native single-value form control selected by type."
treatment: "Keep native input semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Choose correct type, name, autocomplete, and label."]
avoid: "Use text for every input or remove native focus."
constraints: ["Choose a type matching the data; provide name and autocomplete where meaningful.","Validation must also run on the server."]
accessibility: ["Every visible input needs a programmatic label and associated error/help text when needed.","Preserve native focus and type-specific keyboard behavior."]
variants: []
semanticHtml: "<label for=\"email\">Email address</label><input id=\"email\" name=\"email\" type=\"email\" autocomplete=\"email\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input", checkedAt: "2026-07-16" }
deprecated: false
order: 590
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input"
---

<div class="native-demo"><code>&lt;input&gt;</code><p>Input uses native browser semantics as fallback.</p></div>
