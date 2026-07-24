---
title: "Input: month"
group: "Forms"
tags: ["input[type=\"month\"]"]
kind: "native"
capability: "form-control"
purpose: "Month and year."
contextGuidance: "Use month only with an explicit text-input fallback because support remains Limited availability. Preserve the native month picker, normalized YYYY-MM value, min, max, step, validation, keyboard, and touch behavior where supported."
treatment: "Draft the shared form-control surface around the platform month control. Preserve picker and text-fallback behavior; exclude this Treatment from portable export while Baseline remains Limited availability."
use: ["Use for month-granularity values and provide fallback expectations."]
avoid: "Use when exact day is required."
constraints: ["Validate YYYY-MM on the server and supply input-format guidance for text fallbacks.","Do not assume a picker exists or replace native supported behavior."]
accessibility: ["Associate a visible label and describe the required month-year format when fallback text entry may appear.","Test keyboard, touch, zoom, validation, and assistive technology in the target browser matrix."]
variants: []
semanticHtml: "<label for=\"billing-month\">Billing month</label><input id=\"billing-month\" name=\"billing-month\" type=\"month\" min=\"2026-01\" max=\"2026-12\">"
version: "0.1.0"
baseline: { status: "limited-availability", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month", checkedAt: "2026-07-23" }
deprecated: false
order: 820
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month"
---

<div class="native-demo"><label for="billing-month">Billing month</label><input id="billing-month" name="billing-month" type="month" min="2026-01" max="2026-12"></div>
