---
title: "Dialog"
group: "Disclosure"
tags: ["dialog"]
kind: "dialog"
capability: "dialog"
purpose: "Modal or non-modal dialog with browser-owned top-layer, modality, focus, and dismissal behavior."
treatment: "Use semantic text and surface colors, a one-pixel boundary, large token radius and padding, and a readable maximum inline size without styling the backdrop or controlling visibility."
use: ["Use showModal() for modal interactions; use show() or the open attribute only when interaction must remain non-modal."]
avoid: "Use a generic element with role=dialog when native dialog works, or build a manual focus trap."
constraints: ["Use showModal() for modal behavior and include a visible close action.","The open specimen is intentionally non-modal so its CSS remains visible in the reference.","Do not add tabindex to dialog.","Do not set display, position, visibility, or pointer behavior in the Element Treatment."]
accessibility: ["Choose initial focus deliberately, preserve native Escape for modal dialogs, and restore focus to the invoker when the dialog closes.","Keep the visible close action reachable by keyboard and touch.","The native backdrop remains unstyled; if a product customizes it later, verify sufficient distinction and contrast against surrounding content."]
variants: []
semanticHtml: "<dialog open aria-labelledby=\"promotion-title\"><h2 id=\"promotion-title\">Confirm Promotion</h2><form method=\"dialog\"><button value=\"cancel\">Cancel</button><button value=\"confirm\">Promote</button></form></dialog>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog", checkedAt: "2026-07-23" }
activationEvidence:
  definition: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  baseline: { status: "pass", reference: "docs/specs/disclosure-dialog-treatments.md#dialog", checkedAt: "2026-07-23" }
  nativeBehavior: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  keyboard: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  focus: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
  parity: { status: "pass", reference: "tests/disclosure-dialog-treatments.test.mjs", checkedAt: "2026-07-23" }
deprecated: false
order: 700
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog"
---

<div class="native-demo"><dialog open aria-labelledby="promotion-title"><h2 id="promotion-title">Confirm Promotion</h2><form method="dialog"><button value="cancel">Cancel</button><button value="confirm">Promote</button></form></dialog></div>
