# Layered Pattern export verification

Specification: [ADR 0022](../../docs/adr/0022-self-contained-pattern-exports.md). User clarified that HTML must remain separate from CSS. Save the two exported files together; HTML links the matching CSS filename.

- `npm test`: 263 passed, zero failures. New coverage exercises all thirteen bundled sources, current token aliases/fluid values, validated font imports, renamed roots/stylesheet links, separate CSS strings, and exact ZIP bytes. The added explicit renamed-link assertion also passed its final targeted run.
- `npm run check`: zero errors, zero warnings, nine pre-existing deprecation hints.
- `browser-check.mjs`: all thirteen exported pairs opened from local files in Chromium at 1100px and 390px with JavaScript disabled. Shared Tokens/defaults/buttons applied, body margin reset, no horizontal overflow.
- Live authoring checks: current theme included even with blocked storage writes; theme reset and cross-tab theme events refresh the open export dialog; direct copy, dialog copy, individual downloads and ZIP contain identical bytes. Downloaded HTML loads its sibling CSS and receives configured custom tokens.
- `npm run build -- --mode preview`: passed.
- Cross-tab Pattern renaming refreshes the open dialog after state updates, including the HTML stylesheet link.
- Visual inspection: stacked-scroll-panel mobile rendering and export dialog captures checked. Source images remain external resources.
- Independent Standards review: no blocking findings. Suggested ADR index update applied, including the missing prior accepted entries.
- Independent Spec review: no blocking findings against the clarified two-file contract. Review agents' test commands hit the system Node TypeScript limitation; the implementation verification above used the supported Node binary on PATH and passed.

Reproduce from the repository root:

```sh
PATH=/tmp/stacked-panel-tools/node_modules/node/bin:$PATH \
QA_PLAYWRIGHT_MODULE=/tmp/stacked-panel-tools/node_modules/playwright/index.mjs \
QA_CHROMIUM=/home/ubulex/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node --experimental-strip-types evidence/pattern-export-bundle/browser-check.mjs
```

Set `QA_BASE_URL` to test another authoring deployment. Portable artifacts are generated from the current checkout and opened as separate local files.
