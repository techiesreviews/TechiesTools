---
title: "Output"
group: "Forms"
tags: ["output"]
kind: "form"
capability: "form-control"
purpose: "Result of a calculation or user action."
treatment: "Use the body family at the base size with bold emphasis and readable line height so a calculated result is distinct without changing its native status semantics."
use: ["Use for the result of a calculation or user action and associate contributing controls with for."]
avoid: "Use for static text, assume its value is submitted, or add an unnecessary competing live region."
constraints: ["The for attribute lists the ids of contributing controls when applicable.","Do not rely on output content as submitted form data.","Update only when the represented result changes."]
accessibility: ["Preserve the native status semantics and avoid forcing focus to routine updates.","Use an explicit accessible name when surrounding context does not identify the result."]
variants: []
semanticHtml: "<form><label for=\"quantity\">Quantity</label><input id=\"quantity\" type=\"number\" value=\"2\"> <output name=\"total\" for=\"quantity\">€24.00</output></form>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-composition-treatments.md#output", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 670
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output"
---

<div class="native-demo"><form><label for="first">First value</label><input id="first" type="number" value="2"> + <label for="second">Second value</label><input id="second" type="number" value="3"> = <output name="result" for="first second">5</output></form></div>
