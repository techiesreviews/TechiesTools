# Forms numeric and temporal Treatments

## Decision

Promote `input[type="number"]` to Active `1.0.0`. Keep range, date, time, datetime-local, month, week, and color inputs Native `0.0.0`.

The number Treatment reuses the shared form-control declarations and adds only its exact selector, specimen, and numeric guidance. It excludes disabled, read-only, and invalid states. It does not set `appearance` or target browser pseudo-elements, so native spinbutton controls, min/max/step constraints, validation, and platform keyboard behavior remain intact.

Compatibility-sensitive sliders and pickers keep zero emitted CSS. Their decision-helpful guidance appears only under Native Element Decisions in `context.md`.

## Input number

MDN records number inputs as Baseline Widely available. They provide built-in numeric validation, may expose stepper controls, and have an implicit `spinbutton` role. MDN warns that accidental increments are possible and recommends text plus `inputmode="numeric"` when spinbutton behavior is not useful.

The Active Treatment owns only a token-backed surface, type, boundary, logical padding, minimum touch size, maximum measure, and inset focus outline. Its specimen retains `min`, `max`, and `step`.

## Native decisions

- `range`: Widely available, but track/thumb presentation and some subfeatures vary. Native preserves the platform slider, constraints, keyboard increments, touch input, and selected value.
- `date`: Widely available with varying parts. Picker appearance depends on browser and operating system; display is localized while the submitted value is normalized.
- `time`: Widely available with varying parts. The platform owns segmented editing and picker UI; normalized values and periodic min/max behavior remain native.
- `datetime-local`: Widely available. Browser UI varies, the value intentionally has no timezone, and implementations can differ in how pickers expose bounds and stepping.
- `month`: Limited availability. Unsupported browsers can degrade to text, requiring format guidance and server validation.
- `week`: Limited availability. Unsupported browsers can degrade to text, and ISO week conventions need explicit domain guidance.
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

Automated coverage verifies lifecycle parity, exact locked selectors, the shared CSS box, absence of appearance replacement, retained numeric constraints in the specimen, zero CSS for Native entries, Context guidance, inset focus, and non-blocking contrast repairs.
