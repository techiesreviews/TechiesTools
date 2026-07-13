---
title: "Figure caption"
group: "Media"
tags: ["figcaption"]
kind: "native"
purpose: "Visible caption for its parent figure."
treatment: "Keep native figcaption semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Keep caption concise; retain img alt for image purpose."]
avoid: "Assume figcaption replaces alt text."
constraints: ["Place as first or last child of figure.","Caption explains context; it does not replace img alt."]
accessibility: ["Keep caption visible and retain purpose-based alternative text on media."]
variants: []
semanticHtml: "<figure><img src=\"chart.svg\" alt=\"Quarterly trend rises\"><figcaption>Quarterly trend.</figcaption></figure>"
status: "supported"
order: 420
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption"
---

<div class="native-demo"><figure><img width="320" height="120" alt="Blue sample chart rising from left to right" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='120'%3E%3Crect width='320' height='120' fill='%23dbeafe'/%3E%3Cpath d='M20 100 L120 70 L200 78 L300 20' stroke='%232563eb' stroke-width='8' fill='none'/%3E%3C/svg%3E"><figcaption>Quarterly trend. Caption does not replace image alt.</figcaption></figure></div>
