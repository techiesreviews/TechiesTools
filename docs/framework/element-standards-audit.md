# Element standards audit

## Scope

The version-one Element inventory was checked against current MDN HTML element guidance and the WHATWG HTML Living Standard in July 2026. The Website Specification MCP was not connected in this harness, so its verification remains open rather than being reported as complete.

## Result

The inventory contains 92 typed Markdown entries across eight intent groups, including 22 `input` type subentries. Current lifecycle truth is 57 Active, 6 Draft, and 29 Native after reviewed Actions, Typography, Forms, Lists, Structure, Data, Media, and Disclosure Treatments. Native and Draft entries are not eligible for portable CSS until lifecycle gates pass.

Browser-native semantics remain fallback for every Native or Draft entry. Styling may use Framework tokens but must not remove keyboard behavior, focus indication, accessible naming, or native validation without an equivalent replacement.

## Corrections applied

- Added `source` and `track` because responsive images and timed media alternatives depend on them.
- Kept `datalist` Native because support and assistive-technology behavior remain uneven; typed input stays the fallback.
- Drafted token-backed `accent-color` Treatments for checkbox, radio, range, and progress. They preserve browser-owned appearance and behavior, remain excluded from portable export while `accent-color` is Limited availability, and can become Active only after the lifecycle evidence gate passes.
- Promoted date, time, and datetime-local with shared field-shell styling that leaves `appearance`, picker pseudo-elements, constraints, keyboard, touch, fallback, and assistive-technology behavior native. Month and week remain Draft while Baseline is Limited availability.
- Kept file, image-submit, and hidden inputs Native because their picker, replaced-element, coordinate, privacy, or non-rendered behavior does not fit a portable visual Treatment.
- Promoted all six Lists entries with rhythm, logical indentation, and term emphasis only; marker removal, counters, and layout composition remain outside Element CSS.
- Promoted `address` with contact typography and logical rhythm only; all other Structure regions remain Native because their layout and presentation require an explicit page, section, or component owner.
- Promoted `table`, `caption`, `th`, and `td` for intrinsic typography, caption emphasis, and cell spacing; row-group presentation, responsive wrappers, and native value widgets remain outside Element CSS.
- Promoted `img`, `figure`, and `figcaption` for responsive bounds, token radius, logical figure rhythm, and caption typography; source selection, non-rendered tracks, and native media controls remain Native.
- Clarified that `figcaption` does not replace purpose-based `img` alternative text.
- Promoted `details`, `summary`, and `dialog` for safe visual treatment only; native markers, open state, keyboard/touch interaction, focus, Escape, modality, and backdrop behavior remain browser-owned.
- Split `details`/`summary` behavior from modal `dialog` requirements. Disclosure does not inherit dialog focus restoration or Escape rules.
- Required visible quotation attribution because the `cite` attribute is not sufficient user-facing evidence.
- Required real `href` links, explicit button types, accessible icon-button names, and no nested interactive content in anchors.
- Recorded `search` as a native landmark with a labeled `form role="search"` fallback only for legacy compatibility; roles must not be duplicated.

## Sources

- MDN HTML elements reference: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements>
- WHATWG HTML Living Standard: <https://html.spec.whatwg.org/multipage/>
- Website Specification MCP: <https://mcp.specification.website/mcp> — unavailable during this audit; recheck required before claiming complete platform-wide verification.
