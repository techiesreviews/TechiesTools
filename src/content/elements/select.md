---
title: "Select"
group: "Forms"
tags: ["select"]
kind: "native"
capability: "form-control"
purpose: "Native single-choice or multi-choice option control."
treatment: "For a collapsed single-select without size or multiple, use the shared form-control surface, body type, padded touch size, semantic boundary, and inset focus outline. Keep the native picker arrow and menu; disabled, invalid, listbox, and multi-select states remain native."
use: ["Provide a visible label; group long option sets with labeled optgroup entries when useful."]
avoid: "Remove native appearance or replace the picker without equivalent keyboard, touch, and assistive-technology behavior."
constraints: ["Use for constrained choices with concise labels and truthful values.","Keep multiple or size-based listboxes native; their interaction and layout differ materially from a collapsed select."]
accessibility: ["Associate a visible label and specific validation message.","Preserve selected value, disabled and invalid states, native keyboard navigation, picker behavior, zoom, and reflow."]
variants: []
semanticHtml: "<label for=\"intent\">Intent</label><select id=\"intent\" name=\"intent\"><option value=\"\">Choose an intent</option><option value=\"browse\">Browse</option><option value=\"act\">Act</option></select>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-choice-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-choice-treatments.md#select", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "docs/specs/forms-choice-treatments.md#evidence", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "docs/specs/forms-choice-treatments.md#evidence", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-choice-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-choice-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 610
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select"
---

<div class="native-demo"><label for="select-demo">Intent</label><select id="select-demo"><option>Browse</option><option>Compare</option><option>Act</option></select></div>
