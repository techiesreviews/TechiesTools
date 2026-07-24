---
title: "Figure"
group: "Media"
tags: ["figure"]
kind: "figure"
capability: "media"
purpose: "Self-contained media or illustration referenced as one unit."
treatment: "Use token-backed logical block rhythm and remove user-agent inline indentation while preserving figure grouping."
use: ["Use when content and its optional caption form a self-contained unit that can move independently."]
avoid: "Wrap every image regardless of its relationship to surrounding prose."
constraints: ["Include no more than one figcaption, as the first or last child.","Keep media-specific alternatives on the embedded media; figure grouping does not replace them."]
accessibility: ["Give embedded media its required alternative and keep the figure meaningful as one unit at zoom and reflow."]
variants: []
semanticHtml: "<figure><img width=\"480\" height=\"240\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E\" alt=\"Line chart showing quarterly trend rising overall\"><figcaption>Quarterly trend.</figcaption></figure>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/media-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 410
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure"
---

<div class="native-demo"><figure><img width="480" height="240" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%23dbeafe'/%3E%3Cpath d='M40 200 L160 140 L280 155 L440 40' stroke='%232563eb' stroke-width='12' fill='none'/%3E%3C/svg%3E" alt="Line chart showing quarterly trend rising overall"><figcaption>Quarterly trend.</figcaption></figure></div>
