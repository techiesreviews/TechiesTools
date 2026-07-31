---
title: "Input: password"
group: "Forms"
tags: ["input[type=\"password\"]"]
kind: "form"
capability: "form-control"
purpose: "Password."
treatment: "Use the shared text-field surface and focus outline while preserving native obscuring, password-manager integration, secure-context warnings, paste, and editing."
use: ["Use current-password or new-password autocomplete as appropriate."]
avoid: "Disable paste or expose value without intentional control."
constraints: ["Use autocomplete=\"current-password\" or autocomplete=\"new-password\" according to the task.","Do not disable paste or password-manager autofill.","Any reveal control is a separate labeled button and must not change the submitted name/value contract."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain obscuring, paste, password-manager, autofill, and secure-context behavior."]
variants: []
semanticHtml: "<label for=\"current-password\">Password</label><input id=\"current-password\" name=\"password\" type=\"password\" autocomplete=\"current-password\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#password", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 760
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password"
---

<div class="native-demo"><label for="input-password-demo">Input: password</label><input id="input-password-demo" type="password" ></div>
