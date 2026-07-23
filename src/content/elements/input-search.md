---
title: "Input: search"
group: "Forms"
tags: ["input[type=\"search\"]"]
kind: "form"
capability: "form-control"
purpose: "Search query."
treatment: "Use the shared text-field surface and focus outline while retaining the user agent's search affordances, clear control, and search keyboard hint."
use: ["Use search type inside a labeled search form."]
avoid: "Treat as results container."
constraints: ["Use inside a labeled search landmark or form when it performs search.","Keep the native clear affordance and line-break stripping behavior.","Choose autocomplete according to the search domain rather than disabling it reflexively."]
accessibility: ["Apply shared input naming, error, state, keyboard, zoom, reflow, and focus requirements; retain the search keyboard hint and clear affordance."]
variants: []
semanticHtml: "<search><form><label for=\"site-query\">Search</label><input id=\"site-query\" name=\"q\" type=\"search\" autocomplete=\"off\"></form></search>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#search", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 750
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search"
---

<div class="native-demo"><label for="input-search-demo">Input: search</label><input id="input-search-demo" type="search" ></div>
