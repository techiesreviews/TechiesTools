---
title: "Details"
group: "Disclosure"
tags: ["details"]
kind: "disclosure"
capability: "disclosure"
purpose: "Native expandable disclosure."
treatment: "Keep native details semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use summary as first child with clear state-independent label."]
avoid: "Add custom keyboard handlers already supplied natively."
constraints: ["Use summary as first child with a clear state-independent label.","Do not add duplicate custom keyboard handling."]
accessibility: ["Preserve native focus, Enter, and Space behavior; Escape-to-close is not required."]
variants: []
semanticHtml: "<details><summary>Review guidance</summary><p>Disclosure content.</p></details>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details", checkedAt: "2026-07-16" }
deprecated: false
order: 680
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details"
---

<div class="native-demo"><code>&lt;details&gt;</code><p>Details uses native browser semantics as fallback.</p></div>
