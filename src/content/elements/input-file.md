---
title: "Input: file"
group: "Forms"
tags: ["input[type=\"file\"]"]
kind: "native"
capability: "form-control"
purpose: "File upload."
contextGuidance: "Use the native file input and picker. State accepted formats and limits in visible text, preserve accept, capture, multiple, required, cancellation, focus, keyboard, touch, and selected-file behavior, and validate every file on the server."
treatment: "Keep Native Fallback. The browser and operating system own file selection, privacy, capture, and picker behavior; portable appearance replacement is unsafe."
use: ["State accepted formats and size; validate on server."]
avoid: "Rely only on accept for security validation."
constraints: ["Treat accept as a picker hint, not validation, and use multipart/form-data for uploads.","Never script a local path or hide the native control in a way that removes focus or assistive-technology access."]
accessibility: ["Associate a visible label and visible format or size instructions.","Preserve selected filenames, cancellation, keyboard, touch, focus, error, and high-contrast behavior."]
variants: []
semanticHtml: "<label for=\"profile-image\">Profile image</label><input id=\"profile-image\" name=\"profile-image\" type=\"file\" accept=\"image/png,image/jpeg\" aria-describedby=\"profile-image-help\"><p id=\"profile-image-help\">PNG or JPEG. Maximum 5 MB.</p>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file", checkedAt: "2026-07-23" }
deprecated: false
order: 860
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file"
---

<div class="native-demo"><label for="profile-image">Profile image</label><input id="profile-image" name="profile-image" type="file" accept="image/png,image/jpeg" aria-describedby="profile-image-help"><p id="profile-image-help">PNG or JPEG. Maximum 5 MB.</p></div>
