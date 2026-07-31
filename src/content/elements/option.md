---
title: "Option"
group: "Forms"
tags: ["option"]
kind: "native"
capability: "form-option"
purpose: "Selectable choice within select, optgroup, or datalist."
contextGuidance: "Use option for one concise value inside select, optgroup, or datalist. Preserve its selected, disabled, label, and submitted-value semantics; popup rendering remains platform-owned."
treatment: "Keep Native Fallback. Legacy option styling is inconsistent across browsers and operating systems, and customizable select behavior requires a separate reviewed capability."
use: ["Use clear concise label and value."]
avoid: "Put arbitrary interactive content inside."
constraints: ["Use a truthful value and concise text label; only one initial selected option belongs in a single-select.","Do not put nested interactive controls or presentation-only markup in a traditional option."]
accessibility: ["Preserve native selected and disabled state announcements and the owning control's keyboard navigation."]
variants: []
semanticHtml: "<select aria-label=\"Status\"><option value=\"draft\">Draft</option><option value=\"active\">Active</option></select>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option", checkedAt: "2026-07-23" }
deprecated: false
order: 630
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option"
---

<div class="native-demo"><label for="option-demo">Status</label><select id="option-demo"><option>Draft</option><option>Supported</option></select></div>
