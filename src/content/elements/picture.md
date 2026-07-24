---
title: "Responsive picture"
group: "Media"
tags: ["picture"]
kind: "native"
capability: "media"
purpose: "Art direction or format alternatives around one img."
treatment: "Use Native Fallback. Browser source selection and the final image fallback remain authoritative."
contextGuidance: "Use picture for art direction or alternative image formats. Order source candidates intentionally and keep one img as the final child; that img owns src fallback, intrinsic width and height, and purpose-based alt text. Style the img, not non-rendered sources."
use: ["Use for art direction or format alternatives with a final img fallback."]
avoid: "Use without a final img or place alt text on source."
constraints: ["Place zero or more source elements before exactly one final img.","Keep media and type conditions truthful and avoid downloading decorative variants without benefit."]
accessibility: ["Keep equivalent meaning across selected sources; the final img alt contract applies to every visual candidate."]
variants: []
semanticHtml: "<picture><source media=\"(min-width: 40rem)\" srcset=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E\"><img width=\"480\" height=\"240\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E\" alt=\"Responsive blue geometric placeholder\"></picture>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture", checkedAt: "2026-07-23" }
deprecated: false
order: 390
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture"
---

<div class="native-demo"><picture><source media="(min-width: 40rem)" srcset="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E"><img width="480" height="240" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E" alt="Responsive blue geometric placeholder"></picture></div>
