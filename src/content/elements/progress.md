---
title: "Progress"
group: "Data"
tags: ["progress"]
kind: "native"
capability: "data"
purpose: "Completion progress for a task."
treatment: "Use Native Fallback. Preserve determinate and indeterminate platform progress behavior."
contextGuidance: "Use progress for task completion. Provide a visible label and max; include value only when progress is determinate, and remove the value attribute to represent indeterminate progress. Preserve the platform widget and update related status text when people need the exact state."
use: ["Use for task completion with a visible label; omit value for an indeterminate state."]
avoid: "Use as a generic meter, rating, decorative bar, or fake indeterminate state with value=0."
constraints: ["Keep max greater than zero and determinate value within range.","Remove the value attribute, rather than setting an empty or zero value, to switch to indeterminate."]
accessibility: ["Associate a visible label and describe important progress updates without relying on the bar alone."]
variants: []
semanticHtml: "<label for=\"export-progress\">Export progress</label><progress id=\"export-progress\" max=\"100\" value=\"68\">68%</progress>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress", checkedAt: "2026-07-23" }
deprecated: false
order: 560
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress"
---

<div class="native-demo"><label for="export-progress">Export progress</label><progress id="export-progress" max="100" value="68">68%</progress></div>
