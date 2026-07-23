---
title: "Input: url"
group: "Forms"
tags: ["input[type=\"url\"]"]
kind: "form"
capability: "form-control"
purpose: "Web address."
treatment: "Use the shared text-field surface and focus outline while preserving the URL keyboard and native absolute-URL syntax validation."
use: ["Use url type for absolute URLs and clarify expected format."]
avoid: "Use for free-form text."
constraints: ["Use for absolute URLs and explain any required scheme or domain restriction.","Use autocomplete=\"url\" when collecting the person's website.","Validate business rules and reachability separately from browser syntax validation."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain the URL keyboard, autofill, and native syntax validation."]
variants: []
semanticHtml: "<label for=\"website\">Website</label><input id=\"website\" name=\"website\" type=\"url\" autocomplete=\"url\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/url", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#email-url-and-tel", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 740
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/url"
---

<div class="native-demo"><label for="input-url-demo">Input: url</label><input id="input-url-demo" type="url" ></div>
