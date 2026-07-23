---
title: "Input: week"
group: "Forms"
tags: ["input[type=\"week\"]"]
kind: "native"
capability: "form-control"
purpose: "Week and year."
contextGuidance: "Use week only with an explicit text-input fallback because support remains Limited availability. Preserve the native week picker, normalized year-week value, min, max, step, validation, keyboard, and touch behavior where supported."
treatment: "Keep Native Fallback. Unsupported browsers degrade to text, picker UI differs, and week conventions require domain guidance."
use: ["Use only when week numbering matches domain needs."]
avoid: "Assume all locales share week conventions."
constraints: ["State the intended ISO week convention and validate the normalized value on the server.","Provide format guidance for text fallbacks and do not assume a picker exists."]
accessibility: ["Associate a visible label and explain the week-number convention.","Test keyboard, touch, zoom, validation, fallback entry, and assistive technology in the target browser matrix."]
variants: []
semanticHtml: "<label for=\"delivery-week\">Delivery week</label><input id=\"delivery-week\" name=\"delivery-week\" type=\"week\" min=\"2026-W01\" max=\"2026-W52\">"
version: "0.0.0"
baseline: { status: "limited-availability", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week", checkedAt: "2026-07-23" }
deprecated: false
order: 830
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week"
---

<div class="native-demo"><label for="delivery-week">Delivery week</label><input id="delivery-week" name="delivery-week" type="week" min="2026-W01" max="2026-W52"></div>
