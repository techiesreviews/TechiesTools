# Disclosure and Dialog Element Treatments

## Decision

Promote `details`, `summary`, and `dialog` to Active `1.0.0`. Each owns a locked low-specificity CSS box for safe visual treatment only.

### Details and summary

`details` owns a semantic surface and boundary, token radius, logical padding, and block rhythm. `summary` owns emphasis, compact logical padding, and a visible token-backed focus outline. Neither changes the native list-item marker, generated content, `open` state, click, keyboard, focus, or touch behavior. A summary remains the first child. Disclosure does not inherit dialog focus restoration or Escape-to-close requirements.

### Dialog

`dialog` owns semantic text and surface colors, a boundary, token radius and padding, and a readable maximum inline size. It does not own display, position, visibility, pointer behavior, focus trapping, modality, dismissal, or `::backdrop`. The visible reference specimen uses `open` intentionally as a non-modal preview. Production modal interaction uses `showModal()`, deliberately selects initial focus, preserves native Escape, provides a visible close action, and restores focus to the invoker.

Boundary contrast is checked against the semantic surface. Export remains available when improvement is possible; the interface offers exactly two compatible existing-token repairs with calculated AA results, or cancel to continue unchanged. Backdrop styling remains a product-level concern and requires manual distinction and contrast verification if customized later.

## Evidence

Checked 2026-07-23. MDN marks all three elements Baseline Widely available:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog>

MDN documents `summary` as the disclosure label and native list-item marker, `open` as a boolean attribute, and native click/keyboard disclosure behavior. MDN documents `showModal()` as modal/top-layer behavior, native Escape dismissal for modal dialogs, intentional initial focus, a visible close mechanism, and avoidance of `tabindex` on `dialog`.

Automated coverage verifies lifecycle, exact visible/exported specimen parity, locked CSS boxes, marker preservation, open-state truth, modal versus non-modal guidance, close actions, focus duties, Context inclusion, summary focus contrast, and two AA-rated existing-token boundary repairs.
