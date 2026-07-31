---
title: "Fieldset"
group: "Forms"
tags: ["fieldset"]
kind: "form"
capability: "form-control"
purpose: "Group of related form controls."
treatment: "Use a one-pixel semantic border, medium radius, and balanced logical padding and block margins to make related controls visibly coherent without defining their internal layout."
use: ["Group related controls and place a descriptive legend first."]
avoid: "Use only for a decorative border or replace grouping semantics with a generic container."
constraints: ["Use the first legend as the group caption.","Keep internal control arrangement in component composition.","Preserve the disabled attribute's native group behavior."]
accessibility: ["Keep the legend meaningful so assistive technology announces shared context.","Do not override disabled descendants or remove their native behavior."]
variants: []
semanticHtml: "<fieldset><legend>Preferred format</legend><label><input type=\"radio\" name=\"format\" value=\"html\"> HTML</label><label><input type=\"radio\" name=\"format\" value=\"react\"> React</label></fieldset>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/forms-composition-treatments.md#fieldset-and-legend", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/forms-composition-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 640
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset"
---

<div class="native-demo"><fieldset><legend>Preferred output</legend><label><input type="radio" name="output-demo" checked> HTML</label><label><input type="radio" name="output-demo"> React</label></fieldset></div>
