# Forms choice Element Treatments

Status: implemented

Date: 2026-07-23

Issue: #28

## Derivation

| Entry | Version | Decision | Rationale |
| --- | --- | --- | --- |
| `select` | `1.0.0` | Active | A collapsed single-select receives the shared form-control surface while native appearance, arrow, picker, value, and keyboard behavior remain. |
| `input[type=checkbox]` | `0.0.0` | Native | Platform checkmark, indeterminate, disabled, high-contrast, validation, and focus behavior remain more valuable than unproven recoloring or resizing. |
| `input[type=radio]` | `0.0.0` | Native | Platform group selection, arrow-key movement, checked state, disabled state, high contrast, and focus remain authoritative. |
| `optgroup` | `0.0.0` | Native | It renders inside a platform picker; portable styling is inconsistent and group semantics matter more than visual coverage. |
| `option` | `0.0.0` | Native | Traditional popup styling varies by browser and operating system; customizable select needs a separate reviewed contract. |
| `datalist` | `0.0.0` | Native | MDN reports Limited availability plus zoom, high-contrast, and screen-reader limitations. It remains optional enhancement guidance only. |

## Select

MDN records `select` as Baseline Widely available, with varying support for newer customization. The Active selector deliberately covers only a collapsed select without `multiple` or `size`. It excludes `:disabled` and `:invalid`, retaining those native states, and never sets `appearance`.

The Treatment owns text and surface colors, body type, semantic boundary, radius, logical padding, a 2.75rem minimum touch size, a 30rem maximum measure, and an inset focus outline. The negative two-pixel outline offset makes the immediately adjacent inner surface and outer boundary measurable without assuming a component background.

## Native choice controls

MDN records radio, select, optgroup, and option as Widely available. The exact checkbox page has no overall Baseline badge because it also documents the experimental `switch` attribute, so its Baseline field remains unknown with a note rather than inventing a status. Datalist remains Limited availability.

Native entries emit no CSS and retain decision-helpful Context guidance. Checkbox and radio preserve their platform widget states and interaction. Optgroup and option preserve platform picker rendering. Datalist guidance requires a labeled editable input, free-entry fallback, and target browser/assistive-technology testing.

## Evidence

- Definition: `select/base` and `select/focus-visible` use immutable locked selectors and the shared CSS box.
- Native behavior: no rule changes appearance, selected value, picker mechanics, disabled/invalid state, multiple/listbox behavior, or submission.
- Keyboard and touch: native select navigation and picker remain; the Active collapsed control has a 2.75rem minimum block size. Native checkboxes and radios retain Space, arrow-key, and label-hit-area behavior.
- Contrast: select text, boundary, and both sides of its inset focus indicator are declared. Failed checks warn without blocking and offer two existing-token AA repairs where available.
- Zoom and reflow: logical padding, no fixed inline size, a 30rem maximum measure, and native popup/listbox behavior prevent Treatment-owned overflow.
- Parity: the Catalog compiles the same Active select into Element CSS and Context; every Native choice entry emits zero CSS and contributes only reviewed guidance.

## Sources

- MDN checkbox: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox>
- MDN radio: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio>
- MDN select: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select>
- MDN optgroup: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup>
- MDN option: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option>
- MDN datalist: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist>
