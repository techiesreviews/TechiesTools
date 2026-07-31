---
title: "Unordered list"
group: "Lists"
tags: ["ul"]
kind: "native"
capability: "list"
purpose: "Items whose order has no meaning."
treatment: "Use token-backed block rhythm and marker indentation while preserving native bullets, nesting, and list semantics."
use: ["Keep li as direct semantic children; nest lists inside owning li."]
avoid: "Use only for indentation."
constraints: ["Keep li as semantic children and place a nested list inside its owning li.","Do not remove markers or change display solely to achieve visual layout."]
accessibility: ["Preserve the native list role and visible markers at zoom and narrow reflow."]
variants: []
semanticHtml: "<ul><li>Semantic structure</li><li>Nested guidance<ul><li>Preserve the marker</li></ul></li></ul>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 300
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul"
---

<div class="native-demo"><ul><li>Semantic structure</li><li>Nested guidance<ul><li>Preserve the marker</li></ul></li></ul></div>
