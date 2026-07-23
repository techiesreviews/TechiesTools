---
title: "Input: date"
group: "Forms"
tags: ["input[type=\"date\"]"]
kind: "native"
capability: "form-control"
purpose: "Calendar date."
contextGuidance: "Use the native date control when a calendar date is required. Preserve the platform picker and min, max, step, locale display, normalized value, validation, keyboard, and touch behavior."
treatment: "Keep Native Fallback. Date-picker UI varies by browser and operating system; a portable visual Treatment would risk replacing behavior the platform owns."
use: ["Provide visible label and robust server-side parsing."]
avoid: "Assume locale display format equals submitted value."
constraints: ["Store and validate the normalized yyyy-mm-dd value independently of the localized display.","Do not replace the native picker without equivalent keyboard, touch, zoom, and assistive-technology support."]
accessibility: ["Associate a visible label and explain meaningful date bounds.","Preserve native focus, picker, validation, and error messaging behavior."]
variants: []
semanticHtml: "<label for=\"start-date\">Start date</label><input id=\"start-date\" name=\"start-date\" type=\"date\" min=\"2026-01-01\" max=\"2026-12-31\">"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date", checkedAt: "2026-07-23" }
deprecated: false
order: 790
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date"
---

<div class="native-demo"><label for="start-date">Start date</label><input id="start-date" name="start-date" type="date" min="2026-01-01" max="2026-12-31"></div>
