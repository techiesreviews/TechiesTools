---
title: "Description term"
group: "Lists"
tags: ["dt"]
kind: "native"
capability: "list"
purpose: "Term or name within a description list."
treatment: "Use token-backed term emphasis and group rhythm while preserving the relationship to following dd descriptions."
use: ["Place inside dl before associated dd."]
avoid: "Use outside dl."
constraints: ["Place inside dl before its associated dd group; consecutive dt elements may share the following description.","Do not use dt as a generic bold label."]
accessibility: ["Preserve source-order association with following descriptions at zoom and reflow."]
variants: []
semanticHtml: "<dl><dt>Token</dt><dd>A named design decision.</dd></dl>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 340
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt"
---

<div class="native-demo"><dl><dt>Token</dt><dd>A named design decision.</dd></dl></div>
