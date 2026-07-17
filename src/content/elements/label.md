---
title: "Label"
group: "Forms"
tags: ["label"]
kind: "native"
purpose: "Accessible label for a form control."
treatment: "Keep native label semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Associate explicitly with for/id or wrap the control."]
avoid: "Use placeholder as label."
constraints: ["Associate label explicitly with a unique control id or wrap the control.","Do not use placeholder text as the label."]
accessibility: ["Keep labels visible and descriptive; avoid unrelated interactive content inside."]
variants: []
semanticHtml: "<label for=\"email\">Email address</label><input id=\"email\" type=\"email\">"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label", checkedAt: "2026-07-16" }
deprecated: false
order: 580
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label"
---

<div class="native-demo"><label for="label-demo">Email address</label><input id="label-demo" type="email" autocomplete="email"></div>
