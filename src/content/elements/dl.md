---
title: "Description list"
group: "Lists"
tags: ["dl"]
kind: "native"
capability: "list"
purpose: "Term-description or name-value groups."
treatment: "Use token-backed block rhythm while preserving native term-description grouping and source order."
use: ["Order one or more dt then one or more dd."]
avoid: "Use for visual indentation."
constraints: ["Keep each dt group immediately associated with its following dd group.","Do not use dl solely for two-column visual layout."]
accessibility: ["Preserve source-order term-description relationships at zoom and narrow reflow."]
variants: []
semanticHtml: "<dl><dt>Status</dt><dd>Active</dd><dt>Source</dt><dd>MDN and Framework evidence</dd></dl>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 330
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl"
---

<div class="native-demo"><dl><dt>Status</dt><dd>Active</dd><dt>Source</dt><dd>MDN and Framework evidence</dd></dl></div>
