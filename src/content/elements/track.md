---
title: "Timed text track"
group: "Media"
tags: ["track"]
kind: "native"
capability: "non-rendered"
purpose: "Captions, subtitles, descriptions, chapters, or metadata for media."
treatment: "Use Native Fallback. Track is non-rendered and emits no Element CSS."
contextGuidance: "Use track inside audio or video for reviewed WebVTT captions, subtitles, descriptions, or chapters. Declare kind, src, srclang for language-bearing tracks, and a human-readable label. Use default on at most one track and respect user language preferences."
use: ["Declare kind, src, language, and label accurately; provide reviewed captions for spoken video."]
avoid: "Treat auto-generated captions as unreviewed final copy or mark multiple tracks default."
constraints: ["Use valid WebVTT and at most one default track per media element.","Distinguish captions from subtitles and descriptions according to their actual content."]
accessibility: ["Synchronize captions, include meaningful non-speech audio, and verify selection and display in target browsers."]
variants: []
semanticHtml: "<video controls src=\"overview.mp4\"><track default kind=\"captions\" srclang=\"en\" label=\"English\" src=\"captions.vtt\">Download the <a href=\"overview.mp4\">video overview</a>.</video>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track", checkedAt: "2026-07-23" }
deprecated: false
order: 450
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track"
---

<div class="native-demo"><video controls src="overview.mp4"><track default kind="captions" srclang="en" label="English" src="captions.vtt">Download the <a href="overview.mp4">video overview</a>.</video></div>
