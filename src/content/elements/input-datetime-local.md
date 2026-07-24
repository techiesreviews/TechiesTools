---
title: "Input: datetime-local"
group: "Forms"
tags: ["input[type=\"datetime-local\"]"]
kind: "native"
capability: "form-control"
purpose: "Local date and time."
treatment: "Use the shared form-control surface, readable body type, semantic boundary, logical padding, and inset focus outline. Preserve the platform picker, locale display, normalized value, min, max, step, validation, keyboard, and touch behavior."
use: ["Use only when timezone is intentionally absent."]
avoid: "Represent a global instant without timezone guidance."
constraints: ["Treat the submitted YYYY-MM-DDTHH:mm value as timezone-free and collect timezone separately when the domain needs an instant.","Do not replace the picker or assume every browser enforces step and bounds identically."]
accessibility: ["Associate a visible label and explain date, time, and timezone context.","Preserve native focus, picker, segmented editing, constraints, and error behavior."]
variants: []
semanticHtml: "<label for=\"meeting-time\">Meeting date and time</label><input id=\"meeting-time\" name=\"meeting-time\" type=\"datetime-local\" min=\"2026-01-01T09:00\" max=\"2026-12-31T18:00\" step=\"900\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  baseline: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#temporal-fields", checkedAt: "2026-07-24" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  keyboard: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  focus: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  parity: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
deprecated: false
order: 810
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local"
---

<div class="native-demo"><label for="meeting-time">Meeting date and time</label><input id="meeting-time" name="meeting-time" type="datetime-local" min="2026-01-01T09:00" max="2026-12-31T18:00" step="900"></div>
