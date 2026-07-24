---
title: "Video"
group: "Media"
tags: ["video"]
kind: "native"
capability: "media"
purpose: "Embedded video playback."
treatment: "Use Native Fallback. Preserve platform controls, playback state, full-screen behavior, and timed tracks."
contextGuidance: "Use video with native controls unless an equivalent custom-player contract has been separately reviewed. Provide intrinsic dimensions, poster when useful, caption tracks for spoken content, audio description when needed, fallback download text, and a transcript. Avoid autoplay with sound."
use: ["Provide controls, captions, transcript, and audio description when the content requires them."]
avoid: "Autoplay with sound, hide controls without an equivalent, or rely on visuals or audio alone."
constraints: ["Keep native keyboard, touch, seek, volume, speed, full-screen, and picture-in-picture behavior.","Provide width and height to reserve aspect ratio when known."]
accessibility: ["Provide reviewed synchronized captions, audio description for otherwise unavailable visuals, and a transcript for durable access."]
variants: []
semanticHtml: "<video controls width=\"480\" height=\"270\" poster=\"preview.jpg\" src=\"overview.mp4\"><track default kind=\"captions\" srclang=\"en\" label=\"English\" src=\"captions.vtt\">Download the <a href=\"overview.mp4\">video overview</a>.</video><a href=\"transcript.html\">Read the transcript</a>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video", checkedAt: "2026-07-23" }
deprecated: false
order: 440
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video"
---

<div class="native-demo"><video controls width="480" height="270" poster="preview.jpg" src="overview.mp4"><track default kind="captions" srclang="en" label="English" src="captions.vtt">Download the <a href="overview.mp4">video overview</a>.</video><a href="transcript.html">Read the transcript</a></div>
