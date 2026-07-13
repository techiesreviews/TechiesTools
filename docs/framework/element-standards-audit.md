# Element standards audit

## Scope

The version-one Element inventory was checked against current MDN HTML element guidance and the WHATWG HTML Living Standard in July 2026. The Website Specification MCP was not connected in this harness, so its verification remains open rather than being reported as complete.

## Result

The inventory contains 92 typed Markdown entries across eight intent groups, including 22 `input` type subentries. Fifteen previously exercised hard cases remain `supported`; all newly added guidance is `draft` and therefore not eligible for future Context Export yet.

Browser-native semantics remain fallback for every draft. Styling may use Framework tokens but must not remove keyboard behavior, focus indication, accessible naming, or native validation without an equivalent replacement.

## Corrections applied

- Added `source` and `track` because responsive images and timed media alternatives depend on them.
- Kept `datalist` draft because support and assistive-technology behavior remain uneven; typed input stays the fallback.
- Clarified that `figcaption` does not replace purpose-based `img` alternative text.
- Split native `details`/`summary` behavior from modal `dialog` requirements. Disclosure does not inherit dialog focus restoration or Escape rules.
- Required visible quotation attribution because the `cite` attribute is not sufficient user-facing evidence.
- Required real `href` links, explicit button types, accessible icon-button names, and no nested interactive content in anchors.
- Recorded `search` as a native landmark with a labeled `form role="search"` fallback only for legacy compatibility; roles must not be duplicated.

## Sources

- MDN HTML elements reference: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements>
- WHATWG HTML Living Standard: <https://html.spec.whatwg.org/multipage/>
- Website Specification MCP: <https://mcp.specification.website/mcp> — unavailable during this audit; recheck required before claiming complete platform-wide verification.
