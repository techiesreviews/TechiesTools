---
title: "Audio"
group: "Media"
tags: ["audio"]
kind: "native"
capability: "media"
purpose: "Embedded audio playback."
treatment: "Use Native Fallback. Preserve platform controls, playback state, source fallback, and input behavior."
contextGuidance: "Use audio with native controls unless an equivalent custom-player contract has been separately reviewed. Provide compatible sources or src, useful download fallback, and a transcript when spoken content requires it. Avoid audible autoplay."
use: ["Provide controls, fallback download text, and a transcript for spoken content."]
avoid: "Autoplay audible media, hide controls without an equivalent, or omit alternative content."
constraints: ["Keep native keyboard, touch, volume, seek, speed, and playback behavior.","Do not rely on fallback child content as the transcript for browsers that support audio; provide a separate transcript link."]
accessibility: ["Keep controls keyboard and touch operable and provide an accurate transcript for speech and meaningful sounds."]
variants: []
semanticHtml: "<audio controls src=\"interview.mp3\">Download the <a href=\"interview.mp3\">audio interview</a>.</audio><a href=\"transcript.html\">Read the transcript</a>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio", checkedAt: "2026-07-23" }
deprecated: false
order: 430
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio"
---

<div class="native-demo"><audio controls src="interview.mp3">Download the <a href="interview.mp3">audio interview</a>.</audio><a href="transcript.html">Read the transcript</a></div>
