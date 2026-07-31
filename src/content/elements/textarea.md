---
title: "Textarea"
group: "Forms"
tags: ["textarea"]
kind: "form"
capability: "form-control"
purpose: "Multi-line plain-text input."
treatment: "Use the shared text-field surface with an eight-rem minimum block size and a token-backed focus outline. Leave invalid, disabled, and read-only states native; preserve multi-line editing, wrapping, scrolling, and resizing."
use: ["Provide a label, name, rows, and expected format or length guidance."]
avoid: "Use a value attribute for initial content, disable resizing without need, or replace native editing."
constraints: ["Initial content belongs between the opening and closing tags.","Use rows and cols as intrinsic hints; allow the field to reflow within its container.","Preserve disabled, readonly, maxlength, and required behavior."]
accessibility: ["Associate a visible label and error/help text.","Preserve keyboard selection, scrolling, zoom, and native resize behavior."]
variants: []
semanticHtml: "<label for=\"message\">Message</label><textarea id=\"message\" name=\"message\" rows=\"5\"></textarea>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#shared-input-and-textarea", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-text-entry-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-text-entry-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 600
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea"
---

<div class="native-demo"><label for="textarea-demo">Message</label><textarea id="textarea-demo" rows="4"></textarea></div>
