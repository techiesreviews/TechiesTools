# Forms file and action Treatments

## Decision

Promote submit, reset, and button inputs to Active `1.0.0`. Keep file, image-submit, and hidden inputs Native `0.0.0`.

The canonical action-control factory now creates the existing `button` Treatment and each button-like input Treatment. Every call expands fresh rule and declaration objects with an exact selector and independent Rule Paths. Editing `input-submit/base` therefore cannot alter `button/base`, `input-reset/base`, or another sibling.

The base box also applies while disabled. Disabled colors and boundary are explicit, while hover, active, focus, and secondary selectors exclude disabled controls. The inset focus outline and base, secondary, disabled, boundary, and focus-adjacency pairs all participate in non-blocking contrast checks with existing-token repairs.

## Button-like inputs

Submit, reset, and button inputs are Baseline Widely available and render as push buttons. Each receives the shared action color, boundary, spacing, hover, focus, active, disabled, contrast, and secondary intent without changing native behavior:

- submit retains validation, form association, submission, and form override attributes;
- reset retains reset-to-initial-values behavior and is strongly discouraged unless that outcome is genuinely helpful;
- button retains its lack of default behavior and requires an explicit value plus a real declarative or scripted action. The self-contained specimen uses the longstanding click-handler model and writes its harmless result to a polite live status.

The input value remains the visible and accessible label. Rich label content remains a reason to prefer the `button` element.

## Native decisions

- `file`: the browser and operating system own file selection, capture, cancellation, privacy, and picker behavior. `accept` is only a hint; server validation remains mandatory.
- `image`: this is a replaced graphical submit control that submits click coordinates. It requires non-empty alt text and does not share the text-button box.
- `hidden`: mandatory Native with no visual Definition. It is not rendered, cannot receive focus, and all submitted values remain untrusted client input.

## Evidence

Checked 2026-07-23 against current MDN pages:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/image>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden>

Automated coverage verifies lifecycle parity, exact non-overlapping selectors, independent rule objects, shared canonical action intent, zero CSS for Native entries, hidden-input exclusion, visible specimen parity, Context guidance, and compilation.
