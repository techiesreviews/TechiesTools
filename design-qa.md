# Curated homepage prototype QA

## Scope

- Route: `/?variant=B`
- Direction: one homepage assembled from the sections approved in the browser annotations.
- The previous B, C, and D exploration has been consolidated; the old C and D components are removed.

## Approved section composition

- Compact framework-driven navigation and asymmetrical editorial hero.
- Four-column proof/statistics bar.
- Reusable icon cards using the preferred card treatment.
- Alternating image-and-copy sections.
- Three editorial news cards.
- Dark trust/testimonial band.
- Large split CTA plus the overlapping pill CTA.
- Multi-column footer.

## Framework use

- Color: semantic framework variables.
- Type: `--text-*` scale plus the configured framework font.
- Spacing: `--space-*` variables.
- Radius: `--radius-*` variables.
- Focus: semantic focus variable with visible outlines.

## Verification

- Astro production build passes.
- Only prototype view B remains alongside the design-system view.
- All seven Unsplash images load successfully.
- All four service items render as bordered, rounded cards.
- No browser console warnings or errors.
- Mobile breakpoint switches the hero to one column; service cards retain their reusable auto-fit grid.
- Color picker and design-system preview both render the complete seven-step relative scale.
- CSS export includes `lightest`, `lighter`, `light`, base, `dark`, `darker`, and `darkest`; legacy `ultra-*` names are absent.
- DTCG export uses the same seven semantic shade names.
- Curated homepage aliases the complete seven-step palette and uses it for component surfaces, actions, focus, shadows, and text.
- Homepage component inventory: 13 nested `.btn` instances, 11 `.card` instances, 5 `.badge` instances, and 7 shared `.section` instances.
- Nested modifiers exercised in context: `.btn.small`, `.btn.ghost`, `.btn.secondary`, `.btn.no-bg`, `.card.primary`, `.card.secondary`, and `.badge.secondary`.
- Desktop prototype reports equal client and scroll widths at 1440px after component integration.
- Sidebar color bar renders exactly seven equal-width swatches in one row; each exposes its semantic name and generated OKLCH value.
- Relative palette chroma now tapers toward both light and dark extremes, keeping the selected hue while avoiding oversaturated near-white colors.
- The three light relationships are calibrated from the supplied reference: a `#4444EE` base resolves to `#FBFBFE` (lightest), `#EEEEFE` (lighter), and `#D4D4FC` (light).
- Typography rows no longer receive a state-dependent blue inset border; current values sit directly beside their token names while the min/max range remains right-aligned.
- Radius specimens use an 18px grid gap and increased label spacing.
- Spacing specimens now use the same bordered-card language as the other foundations, with the generated spacing value visualized as bar thickness.
- Curated homepage logo includes a primary-color Lucide mark.
- Floating proof bar is capped at 64rem (1024px at the tested desktop state) within the 1440px homepage.
- Four `card-icon` and three `card-blog` instances use a stretched child-link pattern. `.clickable-parent` exists only on the seven anchors, each anchor is `position:absolute; inset:0`, containing cards become relative through `:has()`, and whole-card activation was verified.
- Blog cards now mirror the Elementor Blueprint reference component: zero outer padding, `space-m` media/content gap, `space-3xs` content start, `space-l` inline/end padding, `space-xs` internal rhythm, and the same lifted shadow. The leaking news-article border/padding is neutralized.
- Split CTA content now uses `space-2xl` inline padding on desktop and `space-l` on mobile.
- Editorial quote uses the generated darkest color as a full dark visual break, with lightest text, light accent icon, and token-driven border/shadow.
- News-header action now uses the reusable nested `.btn.link.small` modifier: transparent background and border, zero padding, aligned icon, and retained focus/hover behavior.
- Icon cards now mirror the supplied Elementor Blueprint XPath component: `space-m` block-start padding, `space-l` inline/end padding, `space-xs` internal gap, `radius-m`, reference shadow, 50px icon slot, two-line title clamp, and three-line body clamp. The redundant visible link label and staggered-card transform were removed; the stretched accessible child link remains and whole-card activation was verified.
- Footer brand now reuses the primary-color HeartHandshake logo and includes semantic fictional contact details in an `address`, with working `mailto:` and `tel:` links. Desktop remains a five-column grid with no horizontal overflow.
- Icon-card spacing is visually calibrated to the reference despite the framework's smaller default scale: cards now use `space-l` start padding, `space-xl` inline/end padding, `space-s` internal rhythm, and `space-xl` grid gaps. At the tested default this resolves to 26.7px / 35.5px / 15px and produces 315.6px cards, closely matching the 309px reference specimens without fixed pixel spacing.
- Regular homepage paragraphs now default to `var(--text-m)` (18px at the tested state), including hero, cards, stories, CTAs, and testimonials. Intentional hierarchy exceptions remain: eyebrows use `text-xs` and the editorial quote retains its larger display size.
- Footer now uses `var(--primary-darkest)` as its background, `primary-lightest` for primary text, and `primary-light` for the logo and contact links. Computed colors update live with the chosen palette and the layout remains overflow-free.
- Added a responsive 1fr/2fr text-image feature section; it collapses to one column at the mobile breakpoint.
- Quote section now uses semantic `figure`, `blockquote`, and `figcaption` structure with restrained editorial styling.
- Testimonial cards use a subdued translucent dark surface so the following primary CTA retains hierarchy.
- Desktop and mobile states report no horizontal overflow; the complete homepage image set loads successfully.
- Preview address bar exposes `techies.local/design-system` and `techies.local/website` as autocomplete destinations. Mouse selection and exact-address Enter navigation both switch the visible preview and keep `?variant=B` synchronized for reloadable website links.
- Address suggestions support focus discovery, text filtering, Arrow Up/Down selection, Enter activation, Escape cancellation, and accessible combobox/listbox state. Production builds include both destinations.
- Removed the floating prototype switcher, its hidden variant metadata, click handlers, and global Left/Right keyboard shortcuts. The address bar is now the single preview-navigation control.

final result: passed

## Element Reference exploration

- Route: `/?variant=E&prototype=A|B|C`, exposed in the preview address bar as `techies.local/elements`.
- Three intentionally different read-only directions: reference manual, specimen gallery, split inspector.
- Shared representative fixtures cover typography, actions, forms, tables, media, and disclosure/dialog behavior.
- Accessibility status supports hover/focus explanation plus a persistent native popover; trigger and tooltip are programmatically related.
- Split-inspector tabs keep exactly one tab and one panel active; the native dialog specimen opens correctly.
- All three variants have no horizontal overflow at 1440px or 390px.
- `astro check` and production `astro build` pass.
- Prototype switcher remains temporary and must be removed after Promotion.

exploration result: ready for selection

### Iteration D — Guided gallery

- Combines A's persistent intent navigation with B's visual-first specimen treatment without duplicating always-visible guidance.
- Six full-width specimen entries; each keeps purpose and support status visible while Default Treatment, use/avoid rules, and Context excerpt remain progressively disclosed.
- Desktop keeps a sticky intent rail; mobile converts it to a normal-flow two-column index.
- Guidance disclosure, contextual accessibility popover, and D-to-A switcher wrap verified.
- No horizontal overflow at 1440px or 390px.
- `astro check` and production `astro build` pass.

iteration result: ready for comparison with A and B

### Promotion — Guided gallery

- D selected and rebuilt as production `ElementReference.astro`; prototype code was not promoted directly.
- Search moved into the sticky Browse by intent rail and filters title, group, tags, purpose, and Default Treatment.
- Group links and counts update with results; Escape clears search and restores all six entries.
- Inline fixture replaced by a schema-validated Astro content collection with six Markdown guidance sources.
- Prototype variants, switcher, `?prototype` state, and `.prototype` Element Reference files removed.
- Legacy prototype URLs normalize to `?variant=E`.
- Mobile rail returns to normal flow; 390px viewport has no horizontal overflow.
- `astro check` and production `astro build` pass.

promotion result: passed

### Full Element inventory expansion

- Replaced six family fixtures with 92 schema-validated Markdown sources: one canonical element per file plus 22 `input` type subentries.
- Added all eight intent groups to production browsing: Structure 9, Typography 20, Lists 6, Actions 2, Media 8, Data 11, Forms 33, Disclosure 3.
- Preserved 15 previously reviewed hard cases as `supported`; marked 77 newly exposed entries `draft` so future Context Export cannot misrepresent unreviewed guidance as stable preference.
- Added missing dependent media primitives `source` and `track`.
- Every entry has stable fragment ID, MDN source URL, purpose, default treatment, use rule, avoid rule, status, and native specimen or promoted hard-case specimen.
- Search `audio` narrows to relevant Media entries; search `checkbox` resolves exactly `input-checkbox`; Escape restores all 92 entries and eight groups.
- No duplicate entry IDs, desktop overflow, mobile overflow, console errors, or console warnings.
- Mobile QA at the app's 325px content viewport kept the reference single-column and retained all 92 entries.
- `astro check`: 0 errors, 0 warnings, one existing unused-`radius` hint in `DesignSystemPreview.astro`.
- Production Cloudflare build passes.
- Standards audit used current MDN and WHATWG guidance. Website Specification MCP was unavailable and remains explicitly open rather than falsely marked complete.
- Post-implementation two-axis review found and fixed incomplete Supported-entry schema, incomplete AI-context excerpts, false unmeasured AA claims, a dead link specimen target, dialog ownership, hidden-input labeling, noisy live-region scope, and filtered group links targeting hidden entries.
- Supported entries now require content constraints, accessibility behavior, variants metadata, and semantic HTML at schema validation time.
- Draft native specimens no longer receive Framework control/table styling; card spacing remains app chrome only.
- Accessibility controls now report manual verification required until computed ratios exist; no specimen claims an unmeasured pass.
- Dialog has its own live specimen, opens with native `showModal()`, and closes with native Escape behavior.
- Filtered intent links retarget the first visible result, and a dedicated polite status reports result count without placing the 92-entry tree in a live region.

inventory expansion result: passed
