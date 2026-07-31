# Lists Treatments

## Decision

Promote `ul`, `ol`, `li`, `dl`, `dt`, and `dd` to Active `1.0.0`.

Each Definition owns one exact base selector and only the rhythm, logical indentation, or term emphasis appropriate to that Element. No Definition emits `list-style`, generated content, counters, display, flex, grid, position, or overflow. Native bullets, numbering, authored `start`, `reversed`, and `value`, nesting, and term-description relationships remain intact.

The Treatments do not compose columns, cards, navigation, or surrounding page layout. Those decisions belong to later Component or Section Guidance.

## Treatment scope

- `ul` and `ol`: block rhythm plus logical marker indentation.
- `li`: small item rhythm without marker ownership.
- `dl`: block rhythm only.
- `dt`: bounded term weight plus term-group rhythm.
- `dd`: logical description indentation plus group rhythm.

All values come from existing spacing Tokens or closed font-weight choices. Logical properties preserve right-to-left direction and narrow reflow.

## Evidence

Checked 2026-07-23. MDN marks all six Elements Baseline Widely available:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd>

Automated coverage verifies lifecycle parity, locked CSS boxes, forbidden marker/layout properties, native nested and numbered specimens, description relationships, compilation, and artifact inclusion.
