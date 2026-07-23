---
title: "Input: tel"
group: "Forms"
tags: ["input[type=\"tel\"]"]
kind: "form"
capability: "form-control"
purpose: "Telephone number."
treatment: "Use the shared text-field surface and focus outline while preserving the telephone keypad hint and native text editing."
use: ["Use tel type and autocomplete=tel; describe accepted format."]
avoid: "Use number type for phone numbers."
constraints: ["Use autocomplete=\"tel\" for the person's telephone number.","Describe the accepted format and use pattern only when the format is genuinely constrained.","Do not assume built-in telephone-format validation; formats vary internationally."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain the telephone keypad hint without inventing universal format validation."]
variants: []
semanticHtml: "<label for=\"phone\">Telephone number</label><input id=\"phone\" name=\"phone\" type=\"tel\" autocomplete=\"tel\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#email-url-and-tel", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 730
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel"
---

<div class="native-demo"><label for="input-tel-demo">Input: tel</label><input id="input-tel-demo" type="tel" ></div>
