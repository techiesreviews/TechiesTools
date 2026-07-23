---
title: "Input: range"
group: "Forms"
tags: ["input[type=\"range\"]"]
kind: "native"
capability: "form-control"
purpose: "Approximate numeric value."
contextGuidance: "Use the native range widget for an approximate bounded value. Keep the platform track, thumb, keyboard increments, min, max, and step behavior; expose the current value in text when users need to perceive it."
treatment: "Keep Native Fallback. Cross-browser track and thumb styling varies, and replacing their appearance risks losing platform input behavior."
use: ["Provide accessible label and visible current value when precision matters."]
avoid: "Use when exact typed value is required."
constraints: ["Set min, max, and step from domain rules and keep the native track and thumb.","If showing the current value separately, update that text on every input event; do not ship a static output that becomes stale.","Do not use appearance replacement or pseudo-element styling as a portable base Treatment."]
accessibility: ["Associate a visible label and expose the current value when its exact value matters.","Preserve arrow-key, touch, focus, disabled, and constraint behavior."]
variants: []
semanticHtml: "<label for=\"volume\">Volume</label><input id=\"volume\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"5\" value=\"50\">"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range", checkedAt: "2026-07-23" }
deprecated: false
order: 780
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range"
---

<div class="native-demo"><label for="volume">Volume</label><input id="volume" name="volume" type="range" min="0" max="100" step="5" value="50"></div>
