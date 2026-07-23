---
title: "Datalist"
group: "Forms"
tags: ["datalist"]
kind: "native"
capability: "form-control"
purpose: "Suggested values for a compatible input."
contextGuidance: "Use datalist only as optional suggestions for a compatible labeled input, never as a required-choice select replacement. Keep free entry available, provide a typed-input fallback, and verify the target browser and assistive-technology combination."
treatment: "Keep Native Fallback. Datalist remains Limited availability; popup zoom, high-contrast styling, and some screen-reader announcements are not reliably controllable."
use: ["Treat as enhancement with typed-input fallback; test browser/AT support."]
avoid: "Use as required select replacement; support remains limited."
constraints: ["Match the input list attribute to a unique datalist id and provide option values as suggestions.","Do not imply that suggestions constrain the submitted value; validate the associated input separately."]
accessibility: ["Retain a labeled editable input and test zoom, high contrast, keyboard selection, and screen-reader announcements in the target support matrix."]
variants: []
semanticHtml: "<label for=\"browser\">Browser</label><input id=\"browser\" name=\"browser\" list=\"browser-options\"><datalist id=\"browser-options\"><option value=\"Firefox\"></option><option value=\"Vivaldi\"></option></datalist>"
version: "0.0.0"
baseline: { status: "limited-availability", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist", checkedAt: "2026-07-23" }
deprecated: false
order: 660
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist"
---

<div class="native-demo"><label for="datalist-demo">Browser</label><input id="datalist-demo" list="browser-options"><datalist id="browser-options"><option value="Firefox"></option><option value="Vivaldi"></option></datalist></div>
