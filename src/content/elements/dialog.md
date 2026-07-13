---
title: "Dialog"
group: "Disclosure"
tags: ["dialog"]
kind: "dialog"
purpose: "Modal or non-modal dialog requiring explicit user interaction."
treatment: "Keep native dialog semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Open modal with showModal, provide visible close action, support Escape, avoid tabindex on dialog."]
avoid: "Use div role=dialog when native dialog works or trap focus manually without need."
constraints: ["Open modal interactions with showModal; include a visible close action.","Do not add tabindex to dialog."]
accessibility: ["Preserve native Escape behavior for modal dialogs and restore focus to the invoker.","Move initial focus intentionally to the most relevant control."]
variants: []
semanticHtml: "<dialog><h2>Confirm Promotion</h2><form method=\"dialog\"><button>Close</button></form></dialog>"
status: "supported"
order: 700
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog"
---

<div class="native-demo"><code>&lt;dialog&gt;</code><p>Open with <code>showModal()</code>; include visible close action and native Escape behavior.</p></div>
