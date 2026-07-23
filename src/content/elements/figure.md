---
title: "Figure"
group: "Media"
tags: ["figure"]
kind: "figure"
capability: "media"
purpose: "Self-contained media or illustration referenced as one unit."
treatment: "Keep native figure semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use when content can move independently from prose."]
avoid: "Wrap every image regardless of relationship."
constraints: ["Use for self-contained content that can move independently.","Include no more than one figcaption."]
accessibility: ["Give embedded media its own required alternative text; figure grouping does not replace it."]
variants: []
semanticHtml: "<figure><img src=\"chart.svg\" alt=\"Quarterly trend rises\"><figcaption>Quarterly trend.</figcaption></figure>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure", checkedAt: "2026-07-16" }
deprecated: false
order: 410
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure"
---

<div class="native-demo"><code>&lt;figure&gt;</code><p>Figure uses native browser semantics as fallback.</p></div>
