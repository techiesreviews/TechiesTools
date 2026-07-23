---
title: "Input: checkbox"
group: "Forms"
tags: ["input[type=\"checkbox\"]"]
kind: "native"
capability: "form-control"
purpose: "Independent boolean or multi-select choice."
contextGuidance: "Use the native checkbox for an independent boolean or each item in a multi-select set. Preserve its platform checkmark, checked and indeterminate states, value submission, label hit area, validation, disabled state, keyboard behavior, and focus indicator."
treatment: "Keep the complete checkbox widget Native. No reviewed token treatment can recolor or resize its platform rendering while proving checked, indeterminate, disabled, high-contrast, and focus behavior across user agents."
use: ["Use checked state with visible label; group related choices."]
avoid: "Use radio when exactly one option is allowed."
constraints: ["Unchecked checkboxes submit no name/value pair; handle that contract deliberately.","Use the same name for related multi-select values and distinct truthful values."]
accessibility: ["Associate a visible label so its text expands the hit area; group related choices with fieldset and legend.","Preserve Space activation, checked and indeterminate announcements, validation, and native focus."]
variants: []
semanticHtml: "<label><input name=\"updates\" type=\"checkbox\" value=\"email\"> Email updates</label>"
version: "0.0.0"
baseline: { status: "unknown/not-applicable", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox", checkedAt: "2026-07-23", note: "The exact MDN page has no overall Baseline badge because it also documents the experimental switch attribute; native checkbox behavior remains required." }
deprecated: false
order: 840
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox"
---

<div class="native-demo"><label for="input-checkbox-demo">Input: checkbox</label><label><input id="input-checkbox-demo" type="checkbox"> Enable preference</label></div>
