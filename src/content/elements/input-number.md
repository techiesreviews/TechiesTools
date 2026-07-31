---
title: "Input: number"
group: "Forms"
tags: ["input[type=\"number\"]"]
kind: "native"
capability: "form-control"
purpose: "Numeric value with stepper semantics."
treatment: "Use the shared form-control surface, body type, padded touch size, semantic boundary, and inset focus outline. Preserve the native spinbutton, stepper controls, validation, and numeric keyboard behavior."
use: ["Use for quantities where increment and decrement are meaningful."]
avoid: "Use for credit cards, postal codes, phone numbers, identifiers, or any value where accidental spinbutton changes are unacceptable."
constraints: ["Set min, max, and step from domain rules; validate again on the server.","Do not remove native stepper controls or replace spinbutton semantics."]
accessibility: ["Associate a visible label and specific validation message.","Preserve native spinbutton keyboard behavior and consider text plus inputmode when incrementing is not useful."]
variants: []
semanticHtml: "<label for=\"ticket-count\">Ticket count</label><input id=\"ticket-count\" name=\"ticket-count\" type=\"number\" min=\"0\" max=\"20\" step=\"1\" value=\"2\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#input-number", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 770
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number"
---

<div class="native-demo"><label for="ticket-count">Ticket count</label><input id="ticket-count" name="ticket-count" type="number" min="0" max="20" step="1" value="2"></div>
