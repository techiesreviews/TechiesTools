---
title: "Output"
group: "Forms"
tags: ["output"]
kind: "native"
capability: "form-control"
purpose: "Result of a calculation or user action."
treatment: "Keep native output semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Associate inputs with for and announce updates only when needed."]
avoid: "Use for static text."
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output", checkedAt: "2026-07-16" }
deprecated: false
order: 670
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output"
---

<div class="native-demo"><form><label for="first">First value</label><input id="first" type="number" value="2"> + <label for="second">Second value</label><input id="second" type="number" value="3"> = <output name="result" for="first second">5</output></form></div>
