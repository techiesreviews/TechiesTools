# Forms text-entry Element Treatments

Status: implemented  
Date: 2026-07-23  
Issue: #27

## Derivation

| Entry | Version | Decision | Material behavior |
| --- | --- | --- | --- |
| `input` without `type` | `1.0.0` | Active | Exact omitted-type selector receives the shared text-field Treatment; it does not target sibling input types. |
| `textarea` | `1.0.0` | Active | Shared field Treatment plus a larger minimum block size; native multi-line editing, wrapping, scrolling, and resizing remain. |
| `input[type=text]` | `1.0.0` | Active | Independent normalized shared Treatment; native single-line text behavior remains. |
| `input[type=email]` | `1.0.0` | Active | Independent normalized shared Treatment; email keyboard, multiple mode, and syntax validation remain. |
| `input[type=tel]` | `1.0.0` | Active | Independent normalized shared Treatment; telephone keypad hint remains and no universal telephone validation is invented. |
| `input[type=url]` | `1.0.0` | Active | Independent normalized shared Treatment; URL keyboard and syntax validation remain. |
| `input[type=search]` | `1.0.0` | Active | Independent normalized shared Treatment; native search and clear affordances remain because appearance is untouched. |
| `input[type=password]` | `1.0.0` | Active | Independent normalized shared Treatment; obscuring, paste, password managers, and secure-context behavior remain. |

## Shared input and textarea

MDN records `input` and `textarea` as Baseline Widely available. The source factory produces complete independent Definitions at build time. There is no runtime inheritance, broad `:where(input)` selector, sibling override, or alternate compiler path.

The Treatment owns color, surface, typography, boundary, radius, logical padding, a minimum touch size, a bounded maximum inline measure, and focus outline. Base and focus rules exclude `:disabled`, `:read-only`, and `:invalid`, leaving those native visual and behavioral states untouched. It does not set appearance, display, position, white-space, overflow, resize, caret, selection, opacity, or interaction behavior.

## Text

MDN defines text inputs as single-line fields and records their validation and list attributes. The exact subtype selector preserves native values, editing, directionality, autocomplete, input mode, readonly, disabled, and constraint validation.

## Email, URL, and tel

MDN records all three exact subtypes as Baseline Widely available. Email and URL provide syntax validation and relevant virtual keyboards. Telephone inputs provide a telephone keypad hint but intentionally have no universal format validation.

## Search

MDN describes search as functionally equivalent to text input with possible user-agent styling and a clear affordance. The Treatment never sets `appearance`, so those platform affordances remain.

## Password

MDN records password as Baseline Widely available with some varying parts. The Treatment does not affect obscuring, secure-context warnings, paste, password managers, autocomplete, or editing.

## Evidence

- Definition: every entry owns explicit `base` and `focus-visible` rules under stable Rule Paths.
- Baseline: exact MDN pages checked 2026-07-23.
- Native behavior and error: state exclusions preserve native invalid, disabled, and read-only presentation; no declaration alters value, naming, validation, autocomplete, input mode, selection, or submission.
- Keyboard/touch: native editors and platform focus order remain; 2.75rem minimum block size supplies the Starter touch target without disabling zoom.
- Contrast: text, control boundary, and both sides of the inset focus outline use contextual checks. Its two-pixel negative offset keeps the indicator inside the control: the inner edge is adjacent to the field surface and the outer edge to its boundary, so both colors are declared and measurable. Warnings never block export; each failing boundary offers up to two existing-token AA remedies through the shared repair flow.
- Reflow and long content: a `30rem` maximum measure prevents overlong fields while native intrinsic sizing and textarea wrapping, scrolling, and resizing remain; no fixed inline size or overflow-hiding declaration exists.
- Parity: locked selectors and normalized Rule Paths pass through the shared Catalog, settings, specimen, persistence, Element CSS, and Context compilation seams.
