# Data Element Treatments

## Decision

Promote `table`, `caption`, `th`, and `td` to Active `1.0.0`. Keep `thead`, `tbody`, `tfoot`, `tr`, `data`, `meter`, and `progress` Native `0.0.0`.

The Active Definitions own intrinsic table typography, table rhythm, caption emphasis, and cell breathing room. Every Definition uses one exact low-specificity CSS box. No rule changes display, table relationships, row grouping, widths, overflow, wrapping, or responsive layout.

A wide table still requires an authored wrapper or higher-layer composition that provides horizontal overflow and an accessible narrow-screen strategy. Element CSS does not claim to solve that context-free. Native row groups and rows preserve their structural relationships without visual preferences. `data` remains visually ordinary machine-readable content. `meter` and `progress` retain platform widgets, state, value semantics, and fallback content.

## Evidence

Checked 2026-07-23. MDN marks all eleven Data Elements Baseline Widely available:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress>

Automated coverage verifies lifecycle and visible/exported parity, locked CSS boxes, forbidden responsive-layout properties, caption and header relationships, truthful meter/progress attributes, Context inclusion, and zero CSS for Native entries.
