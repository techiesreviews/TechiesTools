# Forms numeric and temporal Treatments

## Decision

Promote `input[type="number"]`, date, time, and datetime-local to Active `1.0.0`. Keep month and week as Draft `0.1.0` while MDN Baseline remains Limited availability. Keep range and color Native `0.0.0`.

These Treatments reuse shared form-control declarations and add only exact selectors, specimens, and semantic guidance. They exclude disabled, read-only, and invalid states. They do not set `appearance` or target browser pseudo-elements, so native steppers, pickers, constraints, validation, and platform keyboard behavior remain intact.

Draft month/week Treatments render only in isolated Element Reference specimens and emit zero portable CSS. Native range and color controls keep zero emitted CSS.

## Input number

MDN records number inputs as Baseline Widely available. They provide built-in numeric validation, may expose stepper controls, and have an implicit `spinbutton` role. MDN warns that accidental increments are possible and recommends text plus `inputmode="numeric"` when spinbutton behavior is not useful.

The Active Treatment owns only a token-backed surface, type, boundary, logical padding, minimum touch size, maximum measure, and inset focus outline. Its specimen retains `min`, `max`, and `step`.

## Temporal fields

Date, time, and datetime-local now use the same restrained field shell as textual and numeric inputs. Border, background, typography, logical padding, minimum block size, and focus outline may change. Native segmented editing, picker affordances, locale display, normalized values, min/max/step behavior, validation, keyboard input, touch input, and browser pseudo-elements remain untouched.

Month and week use the same definition as Draft evidence only. Limited availability blocks Active lifecycle and portable export.

## Native and Draft decisions

- `range`: Widely available, but track/thumb presentation and some subfeatures vary. Native preserves the platform slider, constraints, keyboard increments, touch input, and selected value.
- `month`: Draft because unsupported browsers can degrade to text, requiring format guidance and server validation.
- `week`: Draft because unsupported browsers can degrade to text, and ISO week conventions need explicit domain guidance.
- `color`: the exact MDN page has no overall Baseline badge. The browser and operating system own the picker; users also need a non-color representation of the selected value.

## Evidence

Checked 2026-07-23 against current MDN pages:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color>

Automated coverage verifies lifecycle parity, exact locked selectors, shared CSS box, absence of appearance replacement, retained constraints and picker semantics, zero portable CSS for Draft/Native entries, Context guidance, inset focus, and non-blocking contrast repairs.
