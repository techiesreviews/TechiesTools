---
title: "Input: time"
group: "Forms"
tags: ["input[type=\"time\"]"]
kind: "native"
capability: "form-control"
purpose: "Time of day."
treatment: "Use the shared form-control surface, readable body type, semantic boundary, logical padding, and inset focus outline. Preserve the platform time editor, picker, min, max, step, locale display, normalized value, validation, keyboard, and touch behavior."
use: ["Clarify timezone or locale context when relevant."]
avoid: "Use for durations."
constraints: ["Treat the submitted value as a normalized time string and state timezone context separately when relevant.","Do not replace the platform control without equivalent periodic min/max, keyboard, touch, and validation behavior."]
accessibility: ["Associate a visible label and explain allowed times.","Preserve native focus, segmented editing, picker, and constraint feedback."]
variants: []
semanticHtml: "<label for=\"appointment-time\">Appointment time</label><input id=\"appointment-time\" name=\"appointment-time\" type=\"time\" min=\"09:00\" max=\"18:00\" step=\"900\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  baseline: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#temporal-fields", checkedAt: "2026-07-24" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  keyboard: { status: "pass", reference: "docs/specs/forms-numeric-temporal-treatments.md#evidence", checkedAt: "2026-07-24" }
  focus: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
  parity: { status: "pass", reference: "tests/forms-numeric-temporal-treatments.test.mjs", checkedAt: "2026-07-24" }
deprecated: false
order: 800
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time"
---

<div class="native-demo"><label for="appointment-time">Appointment time</label><input id="appointment-time" name="appointment-time" type="time" min="09:00" max="18:00" step="900"></div>
