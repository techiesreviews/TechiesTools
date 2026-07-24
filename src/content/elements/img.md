---
title: "Image"
group: "Media"
tags: ["img"]
kind: "native"
capability: "media"
purpose: "Image with meaningful alternative contract."
treatment: "Use a responsive maximum and token-backed corner radius while preserving intrinsic dimensions and image semantics."
use: ["Write purpose-based alt text, use empty alt only for truly decorative images, and provide intrinsic width and height."]
avoid: "Use a filename as alt text, omit alt, or omit known intrinsic dimensions."
constraints: ["Provide src or srcset and an alt attribute appropriate to the image purpose.","Provide width and height when known to reserve aspect ratio and reduce layout shift."]
accessibility: ["Keep essential information available in text and avoid embedding important text only inside the image."]
variants: []
semanticHtml: "<img width=\"480\" height=\"240\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E\" alt=\"Blue geometric placeholder showing image proportions\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img", checkedAt: "2026-07-23" }
deprecated: false
activationEvidence:
  definition: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/media-treatments.md#evidence", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/media-treatments.test.mjs", checkedAt: "2026-07-23" }
order: 380
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img"
---

<div class="native-demo"><img width="480" height="240" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='240'%3E%3Crect width='480' height='240' fill='%232563eb'/%3E%3Ccircle cx='240' cy='120' r='72' fill='%23dbeafe'/%3E%3C/svg%3E" alt="Blue geometric placeholder showing image proportions"></div>
