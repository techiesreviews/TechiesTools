---
title: "Input: hidden"
group: "Forms"
tags: ["input[type=\"hidden\"]"]
kind: "native"
purpose: "Hidden submitted value."
treatment: "Use native input type=hidden submission behavior. It has no visible control, focus, label, or validation UI."
use: ["Use for non-sensitive data that must submit with form."]
avoid: "Store secrets or trust client-controlled values."
version: "0.1.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden", checkedAt: "2026-07-16" }
deprecated: false
order: 920
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden"
---

<div class="native-demo"><input id="input-hidden-demo" type="hidden" name="context-id" value="example"><code>&lt;input type="hidden" name="context-id" value="example"&gt;</code><p>Hidden values submit with the form but provide no visible or focusable control.</p></div>
