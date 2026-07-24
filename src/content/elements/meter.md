---
title: "Scalar measurement"
group: "Data"
tags: ["meter"]
kind: "native"
capability: "data"
purpose: "Known scalar value within a bounded range."
treatment: "Use Native Fallback. Preserve the platform meter appearance, thresholds, and value-state behavior."
contextGuidance: "Use meter for a scalar measurement within a known range, not task progress. Provide a visible label, truthful min, max, value, and any meaningful low, high, and optimum thresholds. Preserve the platform widget and include understandable fallback text."
use: ["Use for a bounded measurement with a visible label and truthful thresholds."]
avoid: "Use as a task progress indicator or decorative rating bar."
constraints: ["Keep min ≤ low ≤ high ≤ max, keep optimum within min and max, and place optimum in the domain's genuinely preferred range; lower, middle, or higher values may be best.","Do not replace the native gauge without equivalent semantics, high-contrast behavior, and value-state communication."]
accessibility: ["Associate a visible label, keep fallback text meaningful, and never rely on color alone for low, high, or optimum state."]
variants: []
semanticHtml: "<label for=\"review-meter\">Accessibility review</label><meter id=\"review-meter\" min=\"0\" max=\"100\" low=\"60\" high=\"85\" optimum=\"100\" value=\"82\">82%</meter>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter", checkedAt: "2026-07-23" }
deprecated: false
order: 550
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter"
---

<div class="native-demo"><label for="review-meter">Accessibility review</label><meter id="review-meter" min="0" max="100" low="60" high="85" optimum="100" value="82">82%</meter></div>
