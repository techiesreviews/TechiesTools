---
title: "List item"
group: "Lists"
tags: ["li"]
kind: "native"
capability: "list"
purpose: "Item within ul, ol, or menu."
treatment: "Use token-backed item rhythm while preserving the parent list's marker, numbering, and nesting behavior."
use: ["Place inside ul, ol, or menu."]
avoid: "Use outside a valid list parent."
constraints: ["Place inside ul, ol, or menu and nest child lists inside their owning li.","Do not change display or generated content in ways that remove the marker or list-item role."]
accessibility: ["Preserve marker and list-item semantics at zoom and narrow reflow."]
variants: []
semanticHtml: "<ul><li>One list item in its required parent</li></ul>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/lists-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "docs/specs/lists-treatments.md#decision", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/lists-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 320
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li"
---

<div class="native-demo"><ul><li>One list item in its required parent</li></ul></div>
