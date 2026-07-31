---
title: "Machine-readable data"
group: "Data"
tags: ["data"]
kind: "native"
capability: "data"
purpose: "Visible value paired with machine-readable value."
treatment: "Use Native Fallback. Machine-readable identity does not imply a portable visual treatment."
contextGuidance: "Use data when visible content needs a machine-readable value, such as a product name linked to an internal identifier. Keep the visible text understandable and the value truthful. Use time for dates, times, and durations."
use: ["Provide a value attribute that accurately translates the visible content."]
avoid: "Use for dates, times, or durations; use time instead."
constraints: ["Keep the machine value stable and meaningful to the consuming system.","Do not reveal identifiers with generated content as the only human explanation."]
accessibility: ["Keep visible content understandable without machine parsing."]
variants: []
semanticHtml: "<data value=\"sku-1042\">Framework starter</data>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data", checkedAt: "2026-07-23" }
deprecated: false
order: 540
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data"
---

<div class="native-demo"><data value="sku-1042">Framework starter</data></div>
