---
title: "Media source"
group: "Media"
tags: ["source"]
kind: "native"
purpose: "Alternative resource for picture, audio, or video."
treatment: "Keep native source semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Place inside supported media parent; order candidates intentionally."]
avoid: "Use standalone or add alt to source instead of img."
status: "draft"
order: 400
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source"
---

<div class="native-demo"><code>&lt;picture&gt; &lt;source media="…" srcset="…"&gt; &lt;img alt="…"&gt; &lt;/picture&gt;</code><p>Source supplies candidates; img owns fallback and alternative text.</p></div>
