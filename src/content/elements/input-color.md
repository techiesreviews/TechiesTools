---
title: "Input: color"
group: "Forms"
tags: ["input[type=\"color\"]"]
kind: "native"
capability: "form-control"
purpose: "Color value."
contextGuidance: "Use the native color control only when a platform color picker is sufficient. Keep a visible text value or equivalent non-color identification, and preserve the picker, keyboard, focus, color-space, alpha, validation, and fallback behavior."
treatment: "Keep Native Fallback. The exact MDN page has no overall Baseline badge and the picker is browser- and operating-system-owned."
use: ["Use when native color selection is acceptable and provide textual value where needed."]
avoid: "Use as sole accessible representation of chosen color."
constraints: ["Provide a textual color value or equivalent name and validate the submitted color format; if showing the live value, update it on every input event.","Do not replace the native swatch and picker without equivalent keyboard, touch, zoom, high-contrast, and assistive-technology behavior."]
accessibility: ["Associate a visible label and never communicate the choice by color alone.","Test platform picker access, focus visibility, high contrast, and textual value exposure."]
variants: []
semanticHtml: "<label for=\"accent-color\">Accent color</label><input id=\"accent-color\" name=\"accent-color\" type=\"color\" value=\"#3366cc\">"
version: "0.0.0"
baseline: { status: "unknown/not-applicable", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color", checkedAt: "2026-07-23", note: "Exact MDN page has no overall Baseline badge; recheck before compatibility-dependent Promotion." }
deprecated: false
order: 870
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color"
---

<div class="native-demo"><label for="accent-color">Accent color</label><input id="accent-color" name="accent-color" type="color" value="#3366cc"></div>
