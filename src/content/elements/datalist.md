---
title: "Datalist"
group: "Forms"
tags: ["datalist"]
kind: "native"
purpose: "Suggested values for a compatible input."
treatment: "Keep native datalist semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Treat as enhancement with typed-input fallback; test browser/AT support."]
avoid: "Use as required select replacement; support remains limited."
status: "draft"
order: 660
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist"
---

<div class="native-demo"><label for="datalist-demo">Browser</label><input id="datalist-demo" list="browser-options"><datalist id="browser-options"><option value="Firefox"></option><option value="Vivaldi"></option></datalist></div>
