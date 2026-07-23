---
title: "Preformatted text"
group: "Typography"
tags: ["pre"]
kind: "native"
capability: "text"
purpose: "Whitespace-preserved text."
treatment: "Keep native pre semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Control overflow and provide alternatives for ASCII art."]
avoid: "Use for layout alignment."
constraints: ["Preserve authored whitespace; never use preformatted text for page layout."]
accessibility: ["Provide alternatives for ASCII art; preserve horizontal overflow without clipping or page-wide overflow."]
variants: []
semanticHtml: "<pre><code>const ready = true;</code></pre>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#code-and-preformatted-content", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 270
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre"
---

<div class="native-demo"><pre><code>.card {
  display: grid;
}</code></pre></div>
