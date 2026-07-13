---
title: "Select"
group: "Forms"
tags: ["select"]
kind: "native"
purpose: "Native single-choice or multi-choice option control."
treatment: "Keep native select semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide label; group long option sets when useful."]
avoid: "Replace native select without equivalent keyboard behavior."
constraints: ["Use for constrained choices; options need concise labels and truthful values.","Prefer native select unless custom behavior has a demonstrated need."]
accessibility: ["Associate a visible label and retain native keyboard/menu behavior."]
variants: []
semanticHtml: "<label for=\"intent\">Intent</label><select id=\"intent\"><option>Browse</option><option>Act</option></select>"
status: "supported"
order: 610
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select"
---

<div class="native-demo"><label for="select-demo">Intent</label><select id="select-demo"><option>Browse</option><option>Compare</option><option>Act</option></select></div>
