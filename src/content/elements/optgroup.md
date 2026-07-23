---
title: "Option group"
group: "Forms"
tags: ["optgroup"]
kind: "native"
capability: "form-option"
purpose: "Labeled group of related options."
contextGuidance: "Use optgroup only inside select to label related options. Supply its required label, never nest groups, and preserve native disabled-group and picker rendering."
treatment: "Keep Native Fallback. Option-group rendering lives inside the platform picker and varies by browser and operating system; no portable Element-owned visual treatment is established."
use: ["Use label and place within select."]
avoid: "Nest optgroup or make it selectable."
constraints: ["Use a required concise label and place only option children inside a traditional select.","Never nest optgroup elements or treat the group label as a selectable value."]
accessibility: ["Preserve the native group relationship and disabled-group behavior; do not add a redundant or conflicting ARIA role."]
variants: []
semanticHtml: "<select aria-label=\"Element\"><optgroup label=\"Actions\"><option value=\"link\">Link</option><option value=\"button\">Button</option></optgroup></select>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup", checkedAt: "2026-07-23" }
deprecated: false
order: 620
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup"
---

<div class="native-demo"><label for="optgroup-demo">Element</label><select id="optgroup-demo"><optgroup label="Actions"><option>Link</option><option>Button</option></optgroup></select></div>
