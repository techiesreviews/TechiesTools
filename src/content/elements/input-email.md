---
title: "Input: email"
group: "Forms"
tags: ["input[type=\"email\"]"]
kind: "form"
capability: "form-control"
purpose: "Email address."
treatment: "Use the shared text-field surface and focus outline while preserving the email keyboard, syntax validation, multiple-value behavior, and autofill."
use: ["Use email type, autocomplete=email, and server validation."]
avoid: "Assume browser validation proves deliverability."
constraints: ["Use autocomplete=\"email\" when collecting the person's email address.","Use multiple only when the field genuinely accepts a list.","Browser syntax validation never proves ownership or deliverability; validate on the server."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain the email keyboard, autofill, and syntax validation."]
variants: []
semanticHtml: "<label for=\"account-email\">Email address</label><input id=\"account-email\" name=\"email\" type=\"email\" autocomplete=\"email\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#email-url-and-tel", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 720
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email"
---

<div class="native-demo"><label for="input-email-demo">Input: email</label><input id="input-email-demo" type="email" ></div>
