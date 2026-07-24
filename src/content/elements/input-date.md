---
title: "Input: date"
group: "Forms"
tags: ["input[type=\"date\"]"]
kind: "native"
capability: "form-control"
purpose: "Calendar date."
treatment: "Use the shared form-control surface, readable body type, semantic boundary, logical padding, and inset focus outline. Preserve the platform date picker, min, max, step, locale display, normalized value, validation, keyboard, and touch behavior."
use: ["Provide visible label and robust server-side parsing."]
avoid: "Assume locale display format equals submitted value."
constraints: ["Store and validate the normalized yyyy-mm-dd value independently of the localized display.","Do not replace the native picker without equivalent keyboard, touch, zoom, and assistive-technology support."]
accessibility: ["Associate a visible label and explain meaningful date bounds.","Preserve native focus, picker, validation, and error messaging behavior."]
variants: []
semanticHtml: "<label for=\"start-date\">Start date</label><input id=\"start-date\" name=\"start-date\" type=\"date\" min=\"2026-01-01\" max=\"2026-12-31\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  baseline: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#temporal-fields", checkedAt: "2026-07-24" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  keyboard: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  focus: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  parity: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
deprecated: false
order: 790
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date"
---

<div class="native-demo"><label for="start-date">Start date</label><input id="start-date" name="start-date" type="date" min="2026-01-01" max="2026-12-31"></div>
