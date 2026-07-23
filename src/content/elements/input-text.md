---
title: "Input: text"
group: "Forms"
tags: ["input[type=\"text\"]"]
kind: "form"
capability: "form-control"
purpose: "Single-line plain text."
treatment: "Use the shared text-field surface, readable body type, padded minimum touch size, semantic boundary, and token-backed focus outline. Preserve native single-line editing."
use: ["Use for unconstrained short text; choose a specific autocomplete or inputmode value when it improves entry."]
avoid: "Use when a specialized input type communicates intent better."
constraints: ["Use for short unconstrained text only; use a specialized subtype when it communicates the expected value."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain single-line editing and selection."]
variants: []
semanticHtml: "<label for=\"profile-name\">Name</label><input id=\"profile-name\" name=\"name\" type=\"text\" autocomplete=\"name\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#text", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 710
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text"
---

<div class="native-demo"><label for="input-text-demo">Input: text</label><input id="input-text-demo" type="text" ></div>
