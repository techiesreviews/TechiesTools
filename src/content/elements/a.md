---
title: "Link"
group: "Actions"
tags: ["a"]
kind: "actions"
purpose: "Navigation to a real URL or destination."
treatment: "Keep native a semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Provide real href and label destination clearly out of context."]
avoid: "Use # or javascript URLs for actions; nest interactive controls."
constraints: ["Use a real href destination; no nested interactive content.","Link label must describe destination out of context."]
accessibility: ["Preserve native focus and Enter activation.","Announce new-tab or download behavior before activation."]
variants: [{ name: "quiet", when: "Use for lower-emphasis supporting links." }]
defaultVariant: "default"
semanticHtml: "<a href=\"/elements\">Browse element guidance</a>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a", checkedAt: "2026-07-16" }
deprecated: false
promoted: false
accessibilityPassed: false
treatmentDefinition:
  schemaVersion: 1
  rules:
    - id: base
      kind: base
      selector: ':where(a[href])'
      declarations:
        color: { label: "Text color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: text } }
        text-decoration-line: { label: "Underline", control: { kind: choice, options: [{ value: underline, label: "Show" }, { value: none, label: "Hide" }] }, starter: { kind: choice, value: underline } }
    - id: hover
      kind: state
      state: hover
      selector: ':where(a[href]:hover)'
      declarations:
        color: { label: "Hover color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: text } }
    - id: focus-visible
      kind: state
      state: focus-visible
      selector: ':where(a[href]:focus-visible)'
      declarations:
        outline-color: { label: "Focus color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: focus }] }, starter: { kind: token, family: semantic, name: focus } }
        outline-style: { label: "Focus style", control: { kind: choice, options: [{ value: auto, label: "Auto" }, { value: dotted, label: "Dotted" }, { value: dashed, label: "Dashed" }, { value: solid, label: "Solid" }, { value: double, label: "Double" }, { value: groove, label: "Groove" }, { value: ridge, label: "Ridge" }, { value: inset, label: "Inset" }, { value: outset, label: "Outset" }] }, starter: { kind: choice, value: solid } }
        outline-width: { label: "Focus width", control: { kind: length, keywords: [thin, medium, thick] }, starter: { kind: length, value: 2px } }
        outline-offset: { label: "Focus offset", control: { kind: length, allowNegative: true }, starter: { kind: length, value: 2px } }
    - id: active
      kind: state
      state: active
      selector: ':where(a[href]:active)'
      declarations:
        color: { label: "Active color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: text } }
    - id: quiet
      kind: variant
      variant: quiet
      when: "Use for lower-emphasis supporting links."
      selector: ':where(a[href][data-variant="quiet"])'
      declarations:
        text-decoration-line: { label: "Underline", control: { kind: choice, options: [{ value: none, label: "Hide" }] }, starter: { kind: choice, value: none } }
  relationships:
    - id: link-in-navigation
      elements: [a, nav]
      when: "A link names a destination in navigation."
      semanticHtml: '<nav aria-label="Primary"><a aria-current="page" href="/elements">Elements</a></nav>'
      rules:
        - id: current
          kind: base
          targetElement: a
          selector: ':where(nav a[aria-current="page"])'
          declarations:
            text-decoration-line: { label: "Current page mark", control: { kind: choice, options: [{ value: underline, label: "Underline" }] }, starter: { kind: choice, value: underline } }
  specimens:
    - { id: default, label: "Link", semanticHtml: '<a href="/elements">Browse element guidance</a>', demonstrates: [base, hover, focus-visible, active] }
    - { id: navigation, label: "Current navigation link", relationship: link-in-navigation, semanticHtml: '<nav aria-label="Primary"><a aria-current="page" href="/elements">Elements</a></nav>', demonstrates: [link-in-navigation/current] }
order: 360
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a"
---

<div class="native-demo">
  <a href="#a">Browse element guidance</a>
  <a href="#a" data-variant="quiet">Supporting details</a>
</div>
