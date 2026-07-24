---
title: "Figure caption"
group: "Media"
tags: ["figcaption"]
kind: "native"
capability: "media"
purpose: "Visible caption for its parent figure."
treatment: "Use token-backed caption typography and separation while preserving its figure association."
use: ["Place as the first or last child of figure and describe the figure concisely."]
avoid: "Assume figcaption replaces img alt text or other media alternatives."
constraints: ["Use no more than one figcaption per figure.","Describe the figure as a unit; keep purpose-based alternative text on embedded media."]
accessibility: ["Keep the caption visible and meaningful without duplicating alternative text mechanically."]
variants: []
semanticHtml: "<figure><img width=\"480\" height=\"240\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E\" alt=\"Line chart showing quarterly trend rising overall\"><figcaption>Quarterly trend.</figcaption></figure>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/media-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 420
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption"
---

<div class="native-demo"><figure><img width="480" height="240" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure></div>
