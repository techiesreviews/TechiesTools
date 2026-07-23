---
title: "Code"
group: "Typography"
tags: ["code"]
kind: "native"
capability: "text"
purpose: "Short computer-code fragment."
treatment: "Keep native code semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Escape HTML-sensitive characters; combine with pre for blocks."]
avoid: "Use for generic monospace styling."
constraints: ["Use for computer-code fragments; escape HTML-sensitive characters."]
accessibility: ["Keep code readable at zoom and allow inline fragments to wrap with surrounding prose."]
variants: []
semanticHtml: "<p>Run <code>npm test</code> before export.</p>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#code-and-preformatted-content", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 260
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code"
---

<div class="native-demo"><p>Use <code>button type="button"</code> for interface actions.</p></div>
