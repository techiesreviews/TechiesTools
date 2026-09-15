# Stacked scroll panel

## Request and reference analysis

Recreate the interaction in the supplied `floating.mp4` as a reusable TechiesTools Framework Pattern using HTML and CSS only. The user explicitly requested lower-model implementation and primary-agent review. This is a direct Pattern addition, not an exploration of competing Framework defaults.

Reference: https://www.details.so/vault/stacked-scroll-panel-2 (retrieved 2026-09-13). The public page identifies the example but gates its interactive source. Implementation is based on the user-supplied video, not gated code.

The supplied video is 10.60 seconds, 742 × 492 pixels, 30 fps. Sampled frames show three landscape panels on a white canvas. Each has a pale surface, a title and number at the upper left, short copy and a pill link at the lower left, and a tall nature photograph on the right. The approximate text/image split is 62/38. As the next panel rises, it covers the earlier panel, which recedes in width. At the third panel, the two previous top edges remain visible. Reverse scrolling restores earlier states. The final seconds return to a scroll prompt.

## Implementation criteria

- Discoverable through the existing Pattern registry and dynamic authoring route.
- Exported interaction requires only semantic HTML and CSS; Framework tokens and the declared Button component supply presentation.
- Sticky positioning provides basic stacking; scroll-driven scale is progressive enhancement.
- Reduced motion and constrained layouts retain accessible content in normal flow.
- Keyboard users can scroll and reach meaningful links. No hidden focus targets behind overlapping panels.
- HTML/CSS editing, renamed exports, and package generation retain the interaction.
- No independent palette or Framework default changes.

Technical references: [MDN sticky positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position), [MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline). Scroll animation compatibility is narrower than sticky positioning; enhancement must be support-gated.

## Implementation and review

GPT-5.6 Luna investigated the existing Pattern integration. GPT-5.6 Terra owned production implementation; the primary agent independently reviewed the code and rendered results. Primary review caught and returned inactive view-timeline scaling, insufficient trailing scroll space, covered keyboard focus, oversized reference typography, and fallback selector specificity problems. These were corrected before final verification.

The package is available at `/patterns/stacked-scroll-panel`. It offers Stacked/Flow, Stack gap, and Radius controls through the existing authoring UI. Its source contains only HTML and CSS; the surrounding authoring application continues to use its existing JavaScript. The compiler now accepts namespaced keyframes and rewrites their names and animation references alongside renamed Pattern selectors. Unowned keyframes and unrelated selectors remain rejected.

## Verification

Primary-agent Chromium checks passed with the final package:

- Renamed standalone export (`feature-stack`) rendered with JavaScript disabled and zero script elements. The generated [portable HTML](./stacked-scroll-panel/portable.html) includes Framework starter tokens and the shared Button CSS for convenient inspection.
- At scroll end, panel widths measured approximately 591, 616, and 642 pixels: 92%, 96%, and 100%. The third panel was wholly visible. Reverse scrolling restored the initial widths and scroll position.
- PageDown scrolled the focusable region. All three links passed visible hit testing after keyboard focus, including previously covered cards.
- At 390 and 320 pixel window widths, cards used normal flow without horizontal page overflow. Reduced motion also removed stacking and animations. Focus did not restore sticky positioning or animation in these fallbacks.
- The in-app narrow Preview used normal-flow cards without internal horizontal overflow. The desktop authoring Preview reproduced the same final width progression as the standalone export.
- Flow selection survived reload; switching back to Stacked worked. Stack gap controls updated the computed CSS value. No browser page errors occurred.
- All three remote images loaded during verification.

Recoverable evidence: [browser results](./stacked-scroll-panel/browser-results.json), [desktop stack](./stacked-scroll-panel/authoring-stack.png), [mobile export](./stacked-scroll-panel/mobile.png), and [browser check script](./stacked-scroll-panel/browser-check.mjs). Run the browser script from the repository root with a server on port 4321, a TypeScript-capable Node, `QA_PLAYWRIGHT_MODULE` pointing to an installed Playwright module, and optional `QA_CHROMIUM` pointing to Chromium.

Automated verification:

- `npm test`: 250 passed, 0 failed.
- `npm run check`: 0 errors, 0 warnings; 8 existing hints.
- `npm run build`: passed.
- `git diff --check`: passed.

The system Node build lacked TypeScript stripping; verification used the official Node 22.22.1 binary installed outside the repository. No project dependency changes were required.

## Practical limits

This reproduces the reference's interaction and composition through Framework preferences, with Pexels technology photographs and Techies-focused copy. It does not copy the gated source or change Framework typography to the reference's serif face. Shrinking is a progressive enhancement for browsers supporting CSS scroll timelines; basic sticky overlap remains the fallback. Browser verification here covers Chromium, not a full cross-browser matrix. The full-canvas composition uses its nearest scrolling ancestor (the existing Preview scroll area in the app, or the document in standalone HTML). Remote images need network access, and demonstration links should be replaced with destination content when reusing the Pattern. The shipped composition has three cards; adding cards requires corresponding index and animation-range updates.

## Public preview deployment

The user approved publishing to the shared preview site after explaining that they could not access localhost from their current device. The preview-mode build and Wrangler dry run passed before approval. Deployment used the generated preview configuration (`wrangler deploy`, without an additional environment flag).

- Worker: `techies-tools-preview`.
- Version: `f123556d-b8e9-458d-8677-77b517f2afca`.
- Source: working tree based on `c558437870a44c52984205d18486c167be3c1b87`, including the uncommitted Pattern changes documented above.
- Public URL: https://preview.techies.tools/patterns/stacked-scroll-panel.
- Post-deployment verification: HTTP 200, expected Pattern title and animation CSS present, browser navigation loaded the Pattern.
- Production was not deployed.


## Full-canvas revision

The user requested that the Pattern use the entire Preview instead of a smaller embedded preview. This supersedes the initial finite-scroll-region design and its deployment above.

- `previewLayout: "canvas"` opts this Pattern into a full-width, zero-padding Preview wrapper; Button and Listing card retain their existing specimen layouts.
- Pattern CSS no longer owns a fixed height, maximum section width, border, rounded frame, or nested scrollport. Responsive cards and scroll runway belong to the full-width composition.
- The existing Preview scroll area drives sticky positioning and CSS scroll timelines. Standalone HTML uses document scrolling with JavaScript disabled.
- Storage version 2 prevents persisted version 1 authoring styles from restoring the removed inner scrollbox.
- Primary browser checks measured identical Pattern/Preview widths of 920px, `overflow-y: visible` on the Pattern, and zero wrapper padding. Final card widths were approximately 687px, 717px, and 747px. Keyboard exposure, reverse scroll, 320px/390px layouts, reduced motion, narrow Preview, and persisted controls passed. The other two Pattern routes retained compact layouts.
- `npm test`: 251 passed. `npm run check`: zero errors/warnings. Preview-mode build passed. Updated screenshots, portable HTML, browser script, and JSON results are in `evidence/stacked-scroll-panel/`.

Updated shared preview deployed as version `c68ed885-34e7-48ee-980a-9096ee05d28c`. Public route returned HTTP 200 and included the full-canvas layout. Production was not deployed.


## Techies copy and Pexels images

The user requested new titles using one heading tag rather than separate spans, and Pexels images matching the Techies brand. GPT-5.6 Luna made the bounded content edit; the primary agent selected and inspected the actual images, checked crops, corrected descriptive alt text, and verified the rendered results.

Each heading now contains text only, without nested spans or redundant accessible-name overrides:

- Build better interfaces.
- Understand your hardware.
- Upgrade your workspace.

Body copy now describes interface tools, computer hardware, and productive workspaces. Storage version 3 prevents cached previous demo HTML from restoring the nature content.

Image sources and credits:

- [Coding laptop — Danny Meneses, Pexels](https://www.pexels.com/photo/photo-of-turned-on-laptop-computer-943096/). Delivered at 960 × 640, cropped toward the code screen.
- [Processor on motherboard — Andrey Matveev, Pexels](https://www.pexels.com/photo/close-up-photo-of-computer-processor-mounted-on-a-motherboard-18338405/). Delivered at 960 × 720.
- [Computer workspace — Fotografia Eles Dois, Pexels](https://www.pexels.com/photo/photo-of-a-computer-setup-12369901/). Delivered at 960 × 1438.

Verification: each live `h2` has zero child elements; all images load from `images.pexels.com`; desktop crops inspected; the existing browser checks pass for full-canvas scrolling, renamed JavaScript-disabled export, mobile, reduced motion, keyboard visibility, and authoring controls. All 23 focused Pattern tests and the preview-mode build pass. Screenshots, portable HTML, and browser results were refreshed.

Published and verified the Techies content revision on the shared preview as Worker version `7c204a03-4279-4697-b6ee-cf6be6812985`.

## Curated image revision

The user requested more aesthetically pleasing images. The primary agent inspected thirteen Pexels candidates as contact sheets, then selected simpler portrait compositions with muted green, mauve, and pale neutral tones. This replaces the previous code laptop, motherboard, and dark desk photographs. GPT-5.6 Luna applied the bounded markup and storage-version edit.

Current photo credits:

- [Mikael Blomkvist — desktop computer against a green wall](https://www.pexels.com/photo/close-up-of-a-computer-on-a-table-6483591/).
- [Pavel Danilyuk — headphones on a stand](https://www.pexels.com/photo/close-up-photo-of-a-purple-headphone-display-on-a-stand-8038334/).
- [Darina Belonogova — minimalist home workspace](https://www.pexels.com/photo/a-laptop-on-a-table-8003998/).

The photos retain their original colors. Individual object positions keep the subjects visible in both portrait desktop panels and landscape mobile panels. Storage version 4 refreshes saved default markup. Single-tag headings, full-canvas Preview, and HTML/CSS-only behavior remain intact.

Primary verification: inspected desktop and mobile screenshots, including the final stacked state. All three photos loaded at desktop, 390px, 320px, and reduced-motion settings. Existing browser checks passed, 23 focused Pattern tests passed, preview-mode build passed, and `git diff --check` passed. Updated screenshots and portable HTML include the new photo set.

Shared preview deployed as version `f29228df-7e7a-49a3-b556-2c01b8c3f85f` to `techies-tools-preview`. Post-deployment browser verification confirmed the three new Pexels photos loaded and all headings still contain text only at https://preview.techies.tools/patterns/stacked-scroll-panel. Production was not deployed.
