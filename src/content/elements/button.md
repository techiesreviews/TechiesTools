---
title: "Button"
group: "Actions"
tags: ["button"]
kind: "native"
purpose: "Submit or execute an action in current interface."
treatment: "Keep native button semantics; style with Framework tokens without removing browser fallback behavior."
use: ["Set explicit type and accessible name; preserve visible focus."]
avoid: "Use for navigation or omit type inside form."
constraints: ["Set an explicit type; button submits by default inside forms.","Use for actions, not navigation."]
accessibility: ["Provide an accessible name, including icon-only buttons.","Preserve visible focus and native keyboard activation."]
variants: [{ name: "secondary", when: "Use for a valid lower-priority action beside one primary action." }]
defaultVariant: "default"
semanticHtml: "<button type=\"button\">Save preference</button>"
version: "1.0.0"
baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button", checkedAt: "2026-07-16" }
deprecated: false
promoted: false
accessibilityPassed: false
treatmentDefinition:
  schemaVersion: 1
  rules:
    - id: base
      kind: base
      selector: ':where(button:not([disabled]))'
      declarations:
        color: { label: "Text color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: surface }, { family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: surface } }
        background-color: { label: "Background", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: action }, { family: semantic, name: primary }] }, starter: { kind: token, family: semantic, name: action } }
        font-size: { label: "Font size", control: { kind: token, families: [typography], options: [{ family: typography, name: m }] }, starter: { kind: token, family: typography, name: m } }
        border-color: { label: "Border color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: border }] }, starter: { kind: token, family: semantic, name: border } }
        border-style: { label: "Border style", control: { kind: choice, options: [{ value: solid, label: "Solid" }, { value: dashed, label: "Dashed" }, { value: dotted, label: "Dotted" }, { value: double, label: "Double" }, { value: groove, label: "Groove" }, { value: ridge, label: "Ridge" }, { value: inset, label: "Inset" }, { value: outset, label: "Outset" }] }, starter: { kind: choice, value: solid } }
        border-width: { label: "Border width", control: { kind: length, keywords: [thin, medium, thick] }, starter: { kind: length, value: 1px } }
        border-radius: { label: "Border radius", control: { kind: token, families: [radius], options: [{ family: radius, name: m }] }, starter: { kind: token, family: radius, name: m } }
        margin-block-start: { label: "Block start margin", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: omit }, allowOmit: true }
        margin-block-end: { label: "Block end margin", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: omit }, allowOmit: true }
        margin-inline-start: { label: "Inline start margin", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: omit }, allowOmit: true }
        margin-inline-end: { label: "Inline end margin", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: omit }, allowOmit: true }
        padding-block-start: { label: "Block start padding", control: { kind: token, families: [spacing], options: [{ family: spacing, name: 3xs }] }, starter: { kind: token, family: spacing, name: 3xs } }
        padding-block-end: { label: "Block end padding", control: { kind: token, families: [spacing], options: [{ family: spacing, name: 3xs }] }, starter: { kind: token, family: spacing, name: 3xs } }
        padding-inline-start: { label: "Inline start padding", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: token, family: spacing, name: s } }
        padding-inline-end: { label: "Inline end padding", control: { kind: token, families: [spacing], options: [{ family: spacing, name: s }] }, starter: { kind: token, family: spacing, name: s } }
    - id: hover
      kind: state
      state: hover
      selector: ':where(button:not([disabled]):hover)'
      declarations:
        background-color: { label: "Hover background", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: primary }, { family: semantic, name: action }] }, starter: { kind: token, family: semantic, name: primary } }
    - id: focus-visible
      kind: state
      state: focus-visible
      selector: ':where(button:focus-visible)'
      declarations:
        outline-color: { label: "Focus color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: focus }] }, starter: { kind: token, family: semantic, name: focus } }
        outline-style: { label: "Focus style", control: { kind: choice, options: [{ value: auto, label: "Auto" }, { value: dotted, label: "Dotted" }, { value: dashed, label: "Dashed" }, { value: solid, label: "Solid" }, { value: double, label: "Double" }, { value: groove, label: "Groove" }, { value: ridge, label: "Ridge" }, { value: inset, label: "Inset" }, { value: outset, label: "Outset" }] }, starter: { kind: choice, value: solid } }
        outline-width: { label: "Focus width", control: { kind: length, keywords: [thin, medium, thick] }, starter: { kind: length, value: 2px } }
        outline-offset: { label: "Focus offset", control: { kind: length, allowNegative: true }, starter: { kind: length, value: 2px } }
    - id: active
      kind: state
      state: active
      selector: ':where(button:not([disabled]):active)'
      declarations:
        background-color: { label: "Active background", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: action }] }, starter: { kind: token, family: semantic, name: action } }
    - id: disabled
      kind: state
      state: disabled
      selector: ':where(button:disabled)'
      declarations:
        color: { label: "Disabled text", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: text } }
    - id: secondary
      kind: variant
      variant: secondary
      when: "Use for a valid lower-priority action beside one primary action."
      selector: ':where(button[data-variant="secondary"])'
      declarations:
        color: { label: "Text color", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: text }] }, starter: { kind: token, family: semantic, name: text } }
        background-color: { label: "Background", control: { kind: token, families: [semantic, color], options: [{ family: semantic, name: surface }] }, starter: { kind: token, family: semantic, name: surface } }
  specimens:
    - { id: default, label: "Button", semanticHtml: '<button type="button">Save preference</button>', demonstrates: [base, hover, focus-visible, active, disabled] }
    - { id: secondary, label: "Secondary button", semanticHtml: '<button type="button" data-variant="secondary">Cancel</button>', demonstrates: [secondary] }
order: 370
sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button"
---

<div class="native-demo">
  <button type="button">Save preference</button>
  <button type="button" data-variant="secondary">Cancel</button>
  <button type="button" disabled>Unavailable</button>
</div>
