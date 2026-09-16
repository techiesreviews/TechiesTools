# DRY Pattern migration verification

Scope: all thirteen existing Patterns, their shared authoring engine, persisted drafts, scoped inspector, and portable Framework artifacts. The source migration retains the existing designs, native controls, and CSS motion.

## Checks

- `npm test`: 259 tests passed. Focused Pattern and editor tests also pass after review fixes.
- `npm run check`: zero errors, zero warnings; nine existing hints.
- `npm run build -- --mode preview`: passed.
- `browser-check.mjs`: all thirteen portable Patterns at 1100px, 390px, and 320px, plus reduced motion, with JavaScript disabled in the documents. Verifies image loading, no horizontal page overflow, semantic unsplit headings, native radio/disclosure/scroll controls, renamed exports, and CSS/HTML round trips. Results: `browser-results.json`; captures and portable documents: `renders/`.
- `authoring-check.mjs`: all thirteen routes, appearance controls, reload persistence, mobile Preview, scoped CSS edits with `--_columns`, and reload of edited source. Results: `authoring-results.json`.
- `scope-check.mjs`: nested component selector isolation, inherited color, independent nested grid defaults, Preview/portable parity, and preserved legacy Button hooks. Results: `scope-results.json`.
- `motion-check.mjs`: timeline, editorial image, and nested stacked-card motion responds to scroll and reverses without runtime JavaScript. Results: `motion-results.json`.
- `library-check.mjs`: all eleven canvas thumbnails fill their frames and include the shared Button treatment. Results: `library-results.json`.
- `export-check.mjs`: Framework dialog selects the generated utilities artifact; Context contains its exact CSS and declares the required stylesheet order. Results: `export-results.json`.

Browser scripts accept `QA_PLAYWRIGHT_MODULE` and `QA_CHROMIUM` for a locally installed Playwright/Chromium. Authoring and export scripts accept `QA_BASE_URL` (default `http://127.0.0.1:4321`). `QA_IDS` can narrow the portable check while retaining the other results.

The migration comparison exposed mobile custom-grid overrides, a helper name collision, and Button context rules crossing a new boundary. These were corrected before the passing captures. A transient development-server response prevented the first export-dialog lookup; its subsequent complete run passed.

## Independent review

Standards and Spec reviews used separate lower-model agents against the task's starting commit `5259e9e` and the user's DRY workflow.

- **Standards:** fixed underscore-variable completion replacement at mid-token carets; replaced three remaining list-reset copies with the shared helper. Re-review confirmed both fixes. A suspected baseline legacy Button boundary regression was withdrawn after reproducing migration with the actual old markup; the browser scope check confirms its contextual hooks still work.
- **Spec:** removed stale BEM pricing-period selectors. The current monthly/yearly markup already carries its correct period text; native radio switching remains verified.

Built-in Patterns use the new boundaries. Personal legacy drafts retain their authored values and migrate class references; custom markup that already introduced `_component` roots is subject to the new explicit scope boundaries.

No claim of whole-page accessibility conformance or older-browser fallback is made. Native `@scope` is required for the full visual treatment.
