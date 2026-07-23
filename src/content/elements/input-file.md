---
title: "Input: file"
group: "Forms"
tags: ["input[type=\"file\"]"]
kind: "native"
capability: "form-control"
purpose: "File upload."
treatment: "Use native input type=file behavior; apply Framework control tokens while preserving focus, label, and validation semantics."
use: ["State accepted formats and size; validate on server."]
avoid: "Rely only on accept for security validation."
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file", checkedAt: "2026-07-16" }
deprecated: false
order: 860
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file"
---

<div class="native-demo"><label for="input-file-demo">Input: file</label><input id="input-file-demo" type="file" accept="image/*"></div>
