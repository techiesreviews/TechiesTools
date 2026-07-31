---
title: "Input"
group: "Forms"
tags: ["input"]
kind: "form"
capability: "form-control"
purpose: "Native single-value form control selected by type."
treatment: "For an input with no type attribute, use the shared text-field surface, readable body type, padded minimum touch size, semantic boundary, and token-backed focus outline. Leave invalid, disabled, and read-only states native."
use: ["Choose an explicit type, name, autocomplete value, and programmatic label; omitted type is treated as text."]
avoid: "Use text for every input or remove native focus."
constraints: ["Choose a type matching the data; provide name and autocomplete where meaningful.","Validation must also run on the server."]
accessibility: ["Every visible input needs a programmatic label and associated error/help text when needed.","Preserve native invalid, disabled, and read-only presentation, focus, keyboard editing, zoom, and reflow."]
variants: []
semanticHtml: "<label for=\"default-name\">Name</label><input id=\"default-name\" name=\"name\" autocomplete=\"name\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#shared-input-and-textarea", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 590
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input"
---

<div class="native-demo"><code>&lt;input&gt;</code><p>Input uses native browser semantics as fallback.</p></div>
