# Ten video-inspired website sections

## Scope and source evidence

Requested: inspect videos on [Best Designs on X](https://bestdesignsonx.com) and recreate ten interesting reusable website sections in TechiesTools. Continue the existing Pattern conventions: portable HTML/CSS, Framework tokens, full-canvas Preview, single-element headings, and Pexels photography.

The site and public MP4s were accessible without authentication. References were selected from its Hero Section, scroll, section, and testimonials searches. Each selected MP4 was downloaded for inspection and sampled at 8%, 32%, 58%, and 85% of its duration. The adjacent contact sheets record the observed motion. `references.json` records the original post, gallery permalink, exact video source, duration, sampled timestamps, observed behavior, and intended adaptation for each section. Source videos remain outside the repository; source screenshots are evidence, not production assets.

The collection recreates section composition and CSS-expressible behavior using the existing Framework. It does not reproduce the source brands, illustrated scenes, WebGL rendering, or JavaScript search/drag systems. The directory uses native category filtering, the process panels use explicit native disclosure, and the testimonial rail uses native horizontal scrolling. Pricing and testimonial content is demonstrative.

## Acceptance criteria

- Ten distinct packages appear in the Pattern library, each with full-canvas authoring and at least two meaningful Appearance controls.
- Headings remain one semantic tag. Images have appropriate alternative text, and decorative images do not duplicate accessible labels.
- Every exported section works without JavaScript and uses Framework variables and declared shared Component dependencies.
- Category filtering, billing selection, portrait quotation selection, disclosure, and horizontal scrolling perform the stated actions with keyboard and touch access.
- HTML/CSS editing round-trips and exported namespace changes preserve behavior.
- Layouts remain readable at 320px, 390px, and desktop widths. Scroll effects have readable fallbacks and respect reduced motion.
- The primary agent independently inspects desktop/mobile renders and checks actual interactions before publishing the shared preview.

## Ownership

GPT-5.6 Terra implements the ten packages and registry integration. The primary agent owns reference selection, source evidence, independent browser verification, and preview publication. Work starts from `aad31d7` on `feat/ten-video-sections`. The task graph is `agent-graphs/ten-video-sections.json`.

## Verification

- `npm test`: 253 tests passed.
- `npm run check`: 0 errors, 0 warnings; 8 existing hints.
- Preview production build passed.
- `source-check.mjs`: all ten packages have valid source contracts, declared tokens, used controls, working fragments, and no nested main landmarks or scripts.
- `browser-check.mjs`: all ten renamed exports rendered with JavaScript disabled at 1100px, 390px, and 320px, plus reduced motion. All images loaded; no horizontal page overflow. Native category, billing, quotation, disclosure, and horizontal-scroll controls passed keyboard checks.
- `authoring-check.mjs`: all ten routes fill the full Preview canvas. Appearance controls persist across reloads, the 390px Preview preset fits, and Advanced HTML/CSS opens with complete sources. No browser errors.
- `motion-check.mjs`: the timeline perspective and image-panel parallax change with scrolling and restore their initial transform when scrolling back, with JavaScript disabled.
- Primary-agent visual review: inspected all ten desktop compositions, mobile layouts, interaction captures, and the overview. Corrected the initial drafts’ missing spacing tokens, CSS specificity, query-container ownership, image framing, dead controls, and reduced-motion treatment. A final read-only implementation-agent review found no blocking regressions.

The CSS view-timeline effects are progressive enhancements. Browsers without them retain readable static sections. The original videos’ JavaScript search overlay, pointer dragging, cloud illustration and 3D rendering are deliberately adapted as described in `references.json`. External Pexels photography requires an internet connection.

Review URL: https://preview.techies.tools/patterns

Published preview worker version: `d65b60af-02c8-4aaa-840c-be0af1fb5f48`. All ten public authoring routes loaded successfully; the live library reports 13 total Patterns.

Library verification: all 11 canvas thumbnails start at the top and fill their frame. Gallery previews now use `scopePatternPreviewCss`, including shared Button dependencies. Gallery scale affects only the library tile; the authoring Preview remains full canvas.
