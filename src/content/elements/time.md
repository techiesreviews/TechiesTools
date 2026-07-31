---
title: "Time"
group: "Typography"
tags: ["time"]
kind: "native"
capability: "text"
purpose: "Machine-readable date, time, or duration."
treatment: "Keep native time semantics; style with Framework tokens without removing browser fallback behavior."
contextGuidance: "Use time when a date, time, or duration has an unambiguous machine-readable datetime value; otherwise use ordinary text."
use: ["Provide valid datetime value."]
avoid: "Encode ambiguous or invalid date strings."
constraints: ["Provide a valid datetime value that represents the visible date, time, or duration."]
accessibility: ["Keep the visible value understandable without machine parsing."]
variants: []
semanticHtml: "<time datetime=\"2026-07-23\">23 July 2026</time>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time", checkedAt: "2026-07-23" }
deprecated: false
order: 220
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time"
---

<div class="native-demo"><time datetime="2026-07-13">13 July 2026</time></div>
