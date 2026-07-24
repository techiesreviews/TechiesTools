---
title: "Media source"
group: "Media"
tags: ["source"]
kind: "native"
capability: "non-rendered"
purpose: "Alternative resource for picture, audio, or video."
treatment: "Use Native Fallback. Source is non-rendered and emits no CSS."
contextGuidance: "Use source only inside picture, audio, or video. In picture use srcset and optional media/type; in audio or video use src and type. Order candidates intentionally. Source owns no alternative text or visible fallback and must emit no CSS."
use: ["Place inside a supported media parent and order compatible candidates intentionally."]
avoid: "Use standalone, add alt to source, or omit the final img from picture."
constraints: ["Use srcset for picture sources and src for audio/video sources.","Supply MIME type when it helps the browser skip unsupported resources."]
accessibility: ["Keep alternatives and fallback content on the owning img, audio, or video element."]
variants: []
semanticHtml: "<picture><source type=\"image/avif\" srcset=\"image.avif\"><img width=\"480\" height=\"240\" src=\"image.jpg\" alt=\"Product overview\"></picture>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source", checkedAt: "2026-07-23" }
deprecated: false
order: 400
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source"
---

<div class="native-demo"><picture><source type="image/avif" srcset="image.avif"><img width="480" height="240" src="image.jpg" alt="Product overview"></picture></div>
