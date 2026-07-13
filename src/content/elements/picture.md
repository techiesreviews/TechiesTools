---
title: "Responsive picture"
group: "Media"
tags: ["picture"]
kind: "native"
purpose: "Art direction or format alternatives around one img."
treatment: "Keep native picture semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Keep img fallback and alt as final child."]
avoid: "Use without img fallback."
status: "draft"
order: 390
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture"
---

<div class="native-demo"><picture><source media="(min-width: 40rem)" srcset="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='240'%3E%3Crect width='640' height='240' fill='%232563eb'/%3E%3C/svg%3E"><img width="480" height="240" alt="Responsive blue geometric placeholder" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%2360a5fa'/%3E%3C/svg%3E"></picture></div>
