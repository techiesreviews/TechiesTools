---
title: "Link"
group: "Actions"
tags: ["a"]
kind: "actions"
capability: "interactive"
purpose: "Navigation to a real URL or destination."
treatment: "Keep native a semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide real href and label destination clearly out of context."]
avoid: "Use # or javascript URLs for actions; nest interactive controls."
constraints: ["Use a real href destination; no nested interactive content.","Link label must describe destination out of context."]
accessibility: ["Preserve native focus and Enter activation.","Announce new-tab or download behavior before activation."]
variants: [{ name: "quiet", when: "Use for lower-emphasis supporting links." }]
defaultVariant: "default"
semanticHtml: "<a href=\"/elements\">Browse element guidance</a>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a", checkedAt: "2026-07-16" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/element-catalog.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "src/content/elements", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/framework-elements.test.mjs", checkedAt: "2026-07-23" }
order: 360
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a"
---

<div class="native-demo">
  <a href="#a">Browse element guidance</a>
  <a href="#a" data-variant="quiet">Supporting details</a>
</div>
