---
title: "Form"
group: "Forms"
tags: ["form"]
kind: "native"
capability: "form-control"
purpose: "Controls that submit or process related user data."
treatment: "Use Native Fallback. Form layout belongs to components or page composition, not global Element CSS."
contextGuidance: "Use form as the native submission and validation boundary for related controls. Choose the correct action and method, keep browser validation available, and never nest forms. Arrange controls through component or page composition rather than styling every form globally."
use: ["Use meaningful action and method values with logical control grouping."]
avoid: "Nest forms, disable native validation without an equivalent, or use form as a styling wrapper."
constraints: ["Do not nest form elements.","Use GET for retrieval and POST for state-changing submission unless the target protocol requires otherwise.","Keep form layout outside Element Treatment CSS."]
accessibility: ["Give every control an accessible name and preserve native validation and submission behavior.","Ensure errors are associated with their controls and remain perceivable without color alone."]
variants: []
semanticHtml: "<form action=\"/subscribe\" method=\"post\"><label for=\"subscriber-email\">Email address</label><input id=\"subscriber-email\" name=\"email\" type=\"email\" autocomplete=\"email\" required><button type=\"submit\">Subscribe</button></form>"
version: "0.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form", checkedAt: "2026-07-23" }
deprecated: false
order: 570
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form"
---

<div class="native-demo"><form><label for="form-name">Name</label><input id="form-name" name="name" autocomplete="name"><button type="submit">Submit</button></form></div>
