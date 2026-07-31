---
title: "Address"
group: "Structure"
tags: ["address"]
kind: "native"
capability: "structure"
purpose: "Contact information for nearest article or page owner."
treatment: "Use token-backed contact typography and logical block rhythm while preserving address ownership and contents."
use: ["Include the referenced person or organization with contact details for the nearest article or page owner."]
avoid: "Use for arbitrary postal text, publication dates, or contact information unrelated to the nearest article or page owner."
constraints: ["Keep content limited to relevant contact information and its owner.","Do not nest address, headings, sectioning content, header, or footer inside address."]
accessibility: ["Keep contact links descriptive and preserve native link focus and activation."]
variants: []
semanticHtml: "<address>Techies Tools<br><a href=\"mailto:hello@example.test\">hello@example.test</a></address>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/structure-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/structure-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/structure-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/structure-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/structure-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/structure-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 80
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address"
---

<div class="native-demo"><address>Techies Tools<br><a href="mailto:hello@example.test">hello@example.test</a></address></div>
