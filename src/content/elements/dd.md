---
title: "Description details"
group: "Lists"
tags: ["dd"]
kind: "native"
capability: "list"
purpose: "Description or value for preceding term group."
treatment: "Use token-backed description indentation and rhythm while preserving the relationship to preceding dt terms."
use: ["Place inside dl after associated dt."]
avoid: "Use outside dl or before its term."
constraints: ["Place inside dl after its associated dt group; consecutive dd elements may describe the same term group.","Keep indentation logical so right-to-left direction and reflow remain correct."]
accessibility: ["Preserve source-order association and readable reflow; do not rely on indentation alone to communicate meaning."]
variants: []
semanticHtml: "<dl><dt>Framework</dt><dd>Portable UI preference context.</dd></dl>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 350
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd"
---

<div class="native-demo"><dl><dt>Framework</dt><dd>Portable UI preference context.</dd></dl></div>
