---
title: "Block quotation"
group: "Typography"
tags: ["blockquote"]
kind: "native"
purpose: "Extended quotation from another source."
treatment: "Keep native blockquote semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide visible attribution or source link when relevant."]
avoid: "Use for indentation alone or hide attribution in cite attribute."
constraints: ["Use only for extended quotations, never indentation.","Provide visible attribution or source link when relevant."]
accessibility: ["Do not rely on the cite attribute as user-visible attribution."]
variants: []
semanticHtml: "<blockquote><p>Quoted material.</p><footer>— <a href=\"/source\">Visible source</a></footer></blockquote>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote", checkedAt: "2026-07-16" }
deprecated: false
order: 230
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote"
---

<div class="native-demo"><blockquote><p>Good defaults reduce unnecessary decisions.</p><footer>— <a href="#blockquote">Visible source</a></footer></blockquote></div>
