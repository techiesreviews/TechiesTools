---
title: "Input: radio"
group: "Forms"
tags: ["input[type=\"radio\"]"]
kind: "native"
capability: "form-control"
purpose: "One choice from a set."
contextGuidance: "Use native same-named radio controls for one mutually exclusive choice. Preserve automatic group selection, checked value submission, arrow-key movement, label hit areas, validation, disabled state, platform focus, and fieldset/legend grouping."
treatment: "Keep the complete radio widget Native. No reviewed token treatment can recolor or resize its platform rendering while proving group selection, checked, disabled, high-contrast, arrow-key, and focus behavior across user agents."
use: ["Share name, group in fieldset, and provide legend."]
avoid: "Render isolated unlabeled radio buttons."
constraints: ["Every radio in one choice set shares a name and has a distinct truthful value.","Use fieldset and legend when the group needs a shared question or instruction."]
accessibility: ["Associate every radio with a visible label and preserve arrow-key group navigation, Space selection, validation, disabled state, and native focus."]
variants: []
semanticHtml: "<fieldset><legend>Contact method</legend><label><input name=\"contact\" type=\"radio\" value=\"email\"> Email</label><label><input name=\"contact\" type=\"radio\" value=\"phone\"> Phone</label></fieldset>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio", checkedAt: "2026-07-23" }
deprecated: false
order: 850
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio"
---

<div class="native-demo"><label for="input-radio-demo">Input: radio</label><fieldset><legend>Choose one</legend><label><input id="input-radio-demo" type="radio" name="radio-demo" checked> First</label><label><input type="radio" name="radio-demo"> Second</label></fieldset></div>
