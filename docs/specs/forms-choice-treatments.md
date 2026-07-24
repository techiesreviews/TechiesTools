# Forms choice Element Treatments

Status: implemented

Date: 2026-07-23

Issue: #28

## Derivation

| Entry | Version | Decision | Rationale |
| --- | --- | --- | --- |
| `select` | `1.0.0` | Active | A collapsed single-select receives the shared form-control surface while native appearance, arrow, picker, value, and keyboard behavior remain. |
| `input[type=checkbox]` | `0.1.0` | Draft | `accent-color` can map the semantic action token into the browser-owned widget without replacing its appearance, but the CSS property remains Limited availability. |
| `input[type=radio]` | `0.1.0` | Draft | `accent-color` can map the semantic action token into the browser-owned widget without replacing group selection or keyboard behavior, but the CSS property remains Limited availability. |
| `optgroup` | `0.0.0` | Native | It renders inside a platform picker; portable styling is inconsistent and group semantics matter more than visual coverage. |
| `option` | `0.0.0` | Native | Traditional popup styling varies by browser and operating system; customizable select needs a separate reviewed contract. |
| `datalist` | `0.0.0` | Native | MDN reports Limited availability plus zoom, high-contrast, and screen-reader limitations. It remains optional enhancement guidance only. |

## Select

MDN records `select` as Baseline Widely available, with varying support for newer customization. The Active selector deliberately covers only a collapsed select without `multiple` or `size`. It excludes `:disabled` and `:invalid`, retaining those native states, and never sets `appearance`.

The Treatment owns text and surface colors, body type, semantic boundary, radius, logical padding, a 2.75rem minimum touch size, a 30rem maximum measure, and an inset focus outline. The negative two-pixel outline offset makes the immediately adjacent inner surface and outer boundary measurable without assuming a component background.

## Draft and Native choice controls

MDN records radio, select, optgroup, and option as Widely available. The exact checkbox page has no overall Baseline badge because it also documents the experimental `switch` attribute, so its Baseline field remains unknown with a note rather than inventing a status. Datalist remains Limited availability.

Draft checkbox and radio Definitions expose one `accent-color` declaration through the shared CSS box. They preserve platform widget states and interaction, and emit no portable CSS or Context entry until activation evidence and property availability pass the lifecycle gate. Native optgroup and option preserve platform picker rendering. Datalist guidance requires a labeled editable input, free-entry fallback, and target browser/assistive-technology testing.

## Evidence

- Definition: `select/base`, `select/focus-visible`, `input-checkbox/base`, and `input-radio/base` use immutable locked selectors and the shared CSS box.
- Native behavior: no rule changes appearance, selected value, picker mechanics, disabled/invalid state, multiple/listbox behavior, or submission.
- Keyboard and touch: native select navigation and picker remain; the Active collapsed control has a 2.75rem minimum block size. Draft checkboxes and radios retain Space, arrow-key, and label-hit-area behavior.
- Contrast: select text, boundary, and both sides of its inset focus indicator are declared. Failed checks warn without blocking and offer two existing-token AA repairs where available.
- Zoom and reflow: logical padding, no fixed inline size, a 30rem maximum measure, and native popup/listbox behavior prevent Treatment-owned overflow.
- Parity: the Catalog compiles the same Active select into Element CSS and Context; Draft choice entries stay isolated in the Element Reference; Native entries emit zero CSS and contribute only reviewed guidance.

## Sources

- MDN checkbox: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox>
- MDN radio: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio>
- MDN select: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select>
- MDN optgroup: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup>
- MDN option: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option>
- MDN datalist: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist>
- MDN accent-color: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/accent-color>
