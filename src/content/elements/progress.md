---
title: "Progress"
group: "Data"
tags: ["progress"]
kind: "native"
capability: "data"
purpose: "Completion progress for a task."
treatment: "Keep native progress semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide max/value or omit value for indeterminate state; label it."]
avoid: "Use as generic meter or decorative bar."
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress", checkedAt: "2026-07-16" }
deprecated: false
order: 560
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress"
---

<div class="native-demo"><label for="progress-demo">Export progress</label><progress id="progress-demo" max="100" value="68">68%</progress></div>
