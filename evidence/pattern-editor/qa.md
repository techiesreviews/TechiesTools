# Pattern editor typing and color previews

Request: annotation_3 on `#pattern-css-source`. Typing a semicolon sometimes loses the character and moves the caret to the next line. Colors should have visual previews like Framework Element CSS editors.

## Reproduction and diagnosis

The initial browser harness ran against the real Advanced HTML & CSS drawer with four minimal CSS inputs. Command: `/tmp/stacked-panel-tools/node_modules/node/bin/node /tmp/stacked-panel-review/editor-repro.mjs`. It exited 1 with four failures: typing `;` caused compiled CSS to replace the authored text. Two-space indentation became a tab; a missing terminator had already been inserted by compilation; duplicate punctuation disappeared. The caret was restored by its old numeric offset into different text.

Ranked hypotheses were live formatting, Preview-to-editor resynchronization, and autocomplete punctuation handling. Inspection confirmed the second invoked the first: `applyState({syncEditors:false})` still called `markSelectedElement`, which unconditionally projected compiled HTML/CSS into both editors. Autocomplete only intercepts Enter/Tab/arrows/Escape and does not handle semicolons.

The minimized real-browser loop is retained in `browser-check.mjs`. Syntax overlay text is read line by line because the highlighter intentionally uses block spans rather than newline text nodes. The unchanged typing cases passed after the selection restoration honored `syncEditors:false`.

## Implementation boundaries

The controller keeps source, selection, and caret intact during live edits while updating compiled Preview and selection metadata. Explicit selection and controls can still synchronize editors. Color previews are visual hints only; they must preserve source text and geometry and must not restrict valid authored CSS. The full editor/Preview path is the regression seam; pure compiler tests cannot catch this controller bug.

GPT-5.6 Luna investigated the Element editor's color-marker implementation. GPT-5.6 Terra owns production edits. The primary agent owns browser reproduction, verification, integration review, and the already-authorized shared preview deployment.

## Color preview behavior

Pattern CSS opts into the shared editor's inline markers. Declaration ranges come from CSS Tree; values resolve against the selected Preview element's computed custom properties. Markers cover literal colors, local and Framework variables, fallbacks, mixed colors, and `currentColor`. Unknown/cyclic variables, dimensions, and CSS-wide keywords receive no guessed color. These markers describe color values, not declaration validity; CSS acceptance remains the compiler's responsibility. Shorthand lists containing both a color and non-color terms are not expanded into separate markers.

Primary visual review corrected leading whitespace in custom-property ranges, which initially positioned a marker at the beginning of the line. Independent review identified uppercase `VAR()` resolution; the resolver now accepts case-insensitive function names while keeping custom-property names case-sensitive. SVG markers are absolute, aria-hidden, and non-interactive. Their addition/removal does not change source-line geometry, textarea text, or selection.

Browser checks cover four semicolon insertion cases, live CSS output, rejection recovery, HTML source preservation, local variables, missing-variable fallbacks, multi-line color-mix, uppercase VAR, non-color/cyclic exclusion, and desktop/mobile typing. The retained harness runs with `QA_PLAYWRIGHT_MODULE`, optional `QA_CHROMIUM`, and optional `QA_BASE_URL` (defaults to localhost:4321). It uses an isolated browser context, so authored fixtures do not change the user's saved Pattern.

## Verification results

- Full repository test suite: 252 passed, zero failures. The final uppercase-variable follow-up also passed its targeted utility test and the real-browser harness.
- `npm run check`: zero errors, zero warnings, eight existing hints.
- `npm run build -- --mode preview`: passed.
- `git diff --check` and the task-graph validator: passed.
- Desktop and 390px mobile screenshots inspected. Semicolon insertion, caret position, source preservation, resolved swatches, and absence of page horizontal overflow passed.

Prevention: selection restoration should honor the existing source-synchronization contract. The retained browser regression tests the complete selection/input/Preview cycle, where the bug occurred, rather than only testing the formatter.

Shared preview deployment: `739d7881-8449-4336-9376-9bf6f4b58335`, worker `techies-tools-preview`, https://preview.techies.tools/patterns/stacked-scroll-panel. The complete browser regression passed again against the published site, and the collaborative browser showed 11 inline color markers in the default CSS. Production was not deployed.

## Final declaration semicolons (2026-09-15)

The user requested the missing CSS semicolons. The collaborative browser contained twelve final declarations without terminators in nested rules; those were inserted directly while preserving the user's current `--stacked-scroll-panel-reveal: var(--space-xl)` setting and other CSS. The editor accepted the correction.

The source Pattern already included terminators. A compile → `setPatternStylesheet` → compile reproduction demonstrated that CSS Tree's compact serialization omitted final semicolons from nested rules, and the shared formatter did not restore them. A regression assertion for `transform-origin: center top;` failed on this path. The fix belongs to formatted output, not the live input handler, so normal typing continues to preserve raw text and caret position. The retained browser harness now checks terminators again after reloading persisted CSS.

The formatter now adds a terminator only when the buffer before a closing rule brace is a declaration. Regression coverage checks top-level and nested final declarations, existing semicolons, and that closing rules receive no semicolons. Thirty focused formatter/Pattern tests passed; the original edit/compile assertion is green, the full editor browser harness (including reload) passed locally, and the preview build passed.

Published preview version `b66690f1-a4c5-4144-9525-1506f9c4897c`. Reloaded the user's existing public-preview session and reopened the CSS editor: zero missing final semicolons, and the user's `space-xl` stack gap remained intact. Production was not deployed.
