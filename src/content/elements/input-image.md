---
title: "Input: image"
group: "Forms"
tags: ["input[type=\"image\"]"]
kind: "native"
capability: "form-control"
purpose: "Image submit control."
contextGuidance: "Use image-submit only when click coordinates are intentionally submitted. Keep a non-empty alt action label, intrinsic dimensions, native submission overrides, focus, keyboard, and touch behavior; prefer a text button for ordinary submission."
treatment: "Keep Native Fallback. This replaced element submits image coordinates and owns image sizing behavior that does not match the shared text-button Treatment."
use: ["Provide alt describing action and submit-coordinate behavior intentionally."]
avoid: "Use for decorative image buttons."
constraints: ["Set non-empty alt, src, width, and height, and handle the submitted x/y coordinate pair intentionally.","Prefer a text button when click position has no domain meaning."]
accessibility: ["Use alt as the complete action label and ensure the graphic has sufficient contrast.","Preserve focus visibility, keyboard submission, touch target, fallback text, and form override behavior."]
variants: []
semanticHtml: "<input type=\"image\" alt=\"Submit selection\" width=\"120\" height=\"44\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='44'%3E%3Crect width='120' height='44' rx='8' fill='%232563eb'/%3E%3Ctext x='60' y='28' text-anchor='middle' fill='white' font-family='Arial'%3ESubmit%3C/text%3E%3C/svg%3E\">"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/image", checkedAt: "2026-07-23" }
deprecated: false
order: 910
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/image"
---

<div class="native-demo"><input type="image" alt="Submit selection" width="120" height="44" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='44'%3E%3Crect width='120' height='44' rx='8' fill='%232563eb'/%3E%3Ctext x='60' y='28' text-anchor='middle' fill='white' font-family='Arial'%3ESubmit%3C/text%3E%3C/svg%3E"></div>
