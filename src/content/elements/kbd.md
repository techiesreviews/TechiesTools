---
title: "Keyboard input"
group: "Typography"
tags: ["kbd"]
kind: "native"
capability: "text"
purpose: "User input from keyboard, voice, or another device."
treatment: "Keep native kbd semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Use for actual commands or keys."]
avoid: "Use for arbitrary monospace labels."
constraints: ["Use for actual user input or keys, not arbitrary monospace labels."]
accessibility: ["Keep commands understandable as text and readable at zoom."]
variants: []
semanticHtml: "<p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd>.</p>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/typography-treatments.md#code-and-preformatted-content", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/typography-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 280
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd"
---

<div class="native-demo"><p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search.</p></div>
