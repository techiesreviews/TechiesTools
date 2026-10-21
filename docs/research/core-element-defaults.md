# Core Element defaults in leading design systems

Checked: 2026-10-22

Answers [#73](https://github.com/techiesreviews/TechiesTools/issues/73) for the map [#72](https://github.com/techiesreviews/TechiesTools/issues/72). This report records evidence and recommended Default Treatments. It does not change any Treatment Definition, lifecycle, or Semantic Role; each recommendation is a proposal for the style-decision tickets, which the user approves or rejects while looking at the Element Overview.

## Question

What do leading design systems and CSS baselines style by default for the core Elements — text, links, lists (including marker colour), quotes, code, image and caption, tables, divider, details, buttons, and form fields — and where do the Treatment Definitions on `main` fall short?

## Method

Six systems were read from their own source on their `main` branches, not from secondary write-ups:

| Key | System | Source read |
| --- | --- | --- |
| SH | shadcn/ui (new-york-v4) | [registry](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4) `ui/*.tsx` and `examples/typography-*.tsx`; tokens in [`neutral.json`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/public/r/colors/neutral.json) |
| RX | Radix Themes | [`src/components`](https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes/src/components) and [`typography.css`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/typography.css) |
| TT | Tailwind Typography `prose` | [`src/styles.js`](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js) |
| PICO | Pico CSS v2.1.1 | [`css/pico.css`](https://github.com/picocss/pico/blob/main/css/pico.css) |
| OP | Open Props normalize | [`normalize.src.css`](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css), with [`theme.light.css`](https://github.com/argyleink/open-props/blob/main/src/extra/theme.light.css) and [`brand.css`](https://github.com/argyleink/open-props/blob/main/src/extra/brand.css) |
| GV | GOV.UK Frontend v6.6.0 | [`packages/govuk-frontend/src/govuk`](https://github.com/alphagov/govuk-frontend/tree/main/packages/govuk-frontend/src/govuk) |

Two scopes differ from ours and must be read with care. Radix Themes and shadcn/ui style only their own components; bare HTML Elements receive nothing. GOV.UK ships with `$govuk-global-styles: false` ([`settings/_global-styles.scss`](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/settings/_global-styles.scss)), so its styles attach to `.govuk-*` classes. Tailwind Typography, Pico, and Open Props style bare Elements and are the closest analogues to Element Treatments.

Real-product evidence came from the Mobbin MCP (`search_screens`, `search_sections`, web platform): long-form and document screens, marketing feature lists, FAQ sections, settings forms, and billing tables. Screens are cited inline by Mobbin link.

The current Framework was read from `main` at `aad31d7`: `src/framework/treatments/*`, `src/framework/starter/index.ts`, `src/framework/model/index.ts`, `docs/specs/*`, `docs/framework/element-standards-audit.md`, and ADR 0017.

## Short answer

- **List markers use the text colour almost everywhere.** Five of six systems inherit the text colour; Tailwind Typography alone gives markers a separate colour, and it is a muted grey, not an accent. No system uses the brand or accent colour. Coloured markers appear in real products only when a marketing component replaces bullets with check icons, which is Component work, not an Element default.
- **Three current Treatments look unfinished against every reference:** tables have no row lines, inline `code` has no background, and `pre` shares the page surface with no boundary.
- **Links are the largest visible departure:** our default link is text-coloured with a text-coloured hover. Four of six systems colour links with the brand or link colour.
- **Form fields and the Starter `semantic.border` value conflict with WCAG 1.4.11:** `#c7d2fe` on `#ffffff` is about 1.5:1, below the 3:1 non-text minimum for a field boundary.
- **Several recommendations cannot be expressed in today's Treatment model.** Rule states cover only `hover`, `focus-visible`, `active`, and `disabled`, and there is no pseudo-element rule. `::marker`, `:visited`, `:user-invalid`, `[open]`, and `::placeholder` therefore need a model decision before a Default Treatment can own them.
- **The current Semantic Roles have no muted text, subtle surface, or danger role.** Captions, hints, code backgrounds, table headers, and invalid fields all need one. Map #72 asks to keep the current roles, so the recommendations below derive these tones with `color-mix()` from Text and Surface, which ADR 0017 permits in Treatment CSS. A dedicated role remains the cleaner long-term answer and is listed as an open decision.

## List marker colour

| System | Marker colour | Evidence |
| --- | --- | --- |
| shadcn/ui | Text colour. No `::marker` rule or `marker:` utility; markers inherit foreground `oklch(0.145 0 0)`. | [`typography-list.tsx`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/examples/typography-list.tsx) |
| Radix Themes | Not applicable. No list component; browser default (`currentColor`). | [`src/components`](https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes/src/components) |
| Tailwind Typography | Muted grey. `ul > li::marker` uses `--tw-prose-bullets` (gray-300, `#d1d5db` in v3); `ol > li::marker` uses `--tw-prose-counters` (gray-500, `#6b7280`) at weight 400. Inverted mode uses gray-600 and gray-400. | [`styles.js` L1470–L1477](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1470-L1477), [L1099–L1138](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1099-L1138) |
| Pico | Text colour (`--pico-color`, `#373c44`); square bullets. | [`pico.css` L778–L791, L853–L864](https://github.com/picocss/pico/blob/main/css/pico.css#L853-L864) |
| Open Props | Text colour (`--text-1`). | [`normalize.src.css` L187](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L187) |
| GOV.UK | Text colour; `.govuk-list` sets `#0b0c0c`. | [`core/_lists.mixin.scss`](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/core/_lists.mixin.scss) |

Real products agree. Plain bullets are text-coloured in long-form and document views — [Plane](https://mobbin.com/screens/d33456c2-9ade-41cc-9839-05490de1b705), [hilos](https://mobbin.com/screens/d14c0601-1276-452c-85c7-c923f769ee82), [Basecamp](https://mobbin.com/screens/59e74298-e555-490f-8761-4a675a6e2c8d), [Microsoft Copilot](https://mobbin.com/screens/912d3f16-c2fb-40ed-8543-83bf5eca8fb3), [Mintlify](https://mobbin.com/screens/0009ec65-be9e-4065-ad21-9d6aef32d94c) — and in marketing feature lists — [Intercom](https://mobbin.com/sites/sections/7265b5c5-3eb1-4d55-9e81-fd166eb31e96), [Runway](https://mobbin.com/sites/sections/f361cef0-7c43-4fb2-ba90-61a644f98462). Colour appears only where the bullet is replaced by an icon: green checks at [Craft](https://mobbin.com/sites/sections/f7f5aeeb-f623-42d9-b642-8f74a1bba3ec), per-card colours at [Duolingo](https://mobbin.com/sites/sections/a9e77bf2-6806-484d-9713-6b5f4e335951), yellow check badges at [PayPal](https://mobbin.com/sites/sections/34ae7183-8cf1-49c5-9767-f6e84613de0e).

**Recommendation:** keep markers in the text colour as the Default Treatment. This needs no change today: the Lists spec already forbids marker properties, and the `li` rule's locked `:where(li)` selector cannot reach `::marker` without also recolouring item text. An accent-coloured or icon list should be a later Component or a named list variant, where the brand choice is deliberate. If the user prefers a quieter marker, the evidenced alternative is Tailwind Typography's muted grey, which needs a `::marker` rule kind first.

## Gap checklist by Element family

Each item names the current state on `main`, the recommended default, the reason, and the sources. "Model" marks items that need a Treatment model or Semantic Role decision before they can ship.

### Text: headings and paragraph

Current: headings use the heading family, sizes `4xl`–`m`, weight 700, line height 1.1, margins `xl`/`s`. Paragraph uses 1.6 line height, a 65ch measure, and margins `s`/`m`.

- [ ] **Keep the paragraph measure at 65ch and line height at 1.6.** Tailwind Typography uses 65ch and 1.75; Open Props uses 60ch and 1.5; Radix and Pico use 1.5. Our values sit inside the evidenced range. Sources: [TT L1414](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1414), [OP L16–L70](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L16-L70).
- [ ] **Loosen line height for `h4`–`h6` to 1.25 and keep 1.1–1.2 for `h1`–`h3`.** A 1.1 line on body-sized headings crowds wrapped lines. Pico steps from 1.125 at `h1` to 1.25 at `h6`; Open Props uses 1.25; Radix pairs 24px with a 30px line. Sources: [PICO L15–L134](https://github.com/picocss/pico/blob/main/css/pico.css#L15-L134), [RX typography.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/typography.css).
- [ ] **Add `text-wrap: balance` to headings.** shadcn/ui (`text-balance` on `h1`) and Open Props (all headings) both balance heading lines; it is progressive and harmless where unsupported. Sources: [SH typography-demo.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/examples/typography-demo.tsx), [OP L16–L70](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L16-L70).
- [ ] **Collapse the first heading's top margin inside a container.** `margin-block-start: xl` on a heading that opens a card or section creates a gap the author did not ask for. Tailwind Typography removes the first child's top margin. This is a relationship rule, not a heading base change. Source: [TT styles.js](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js).

### Links

Current: `a[href]` is `semantic.text` with an underline; hover and active are also `semantic.text`; focus is a 2px `focus` outline at 2px offset; a `quiet` variant removes the underline.

- [ ] **Colour links with `semantic.action`.** Pico (`#0172ad`), Open Props (brand or `--link`), GOV.UK (`#1a65a6`), Radix (`accent-a11`), and shadcn/ui (`text-primary`) all colour links. Tailwind Typography is the only text-coloured exception (gray-900). A text-coloured link that is identified only by its underline is valid, but it is the minority choice and hides the Action role the Framework already defines for links. Sources: [PICO L913–L938](https://github.com/picocss/pico/blob/main/css/pico.css#L913-L938), [OP L72–L101](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L72-L101), [GV helpers/_links.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/helpers/_links.scss), [RX link.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/link.css), [TT L1419](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1419). Mobbin: [The New York Times](https://mobbin.com/screens/be94f2e1-e50f-43ca-bc20-eaa938f1e57b) uses a blue underlined link; [GetYourGuide](https://mobbin.com/screens/1e654ccf-6ad7-4821-8ea6-20b86cd353b8) and [Copilot](https://mobbin.com/screens/912d3f16-c2fb-40ed-8543-83bf5eca8fb3) use text-coloured underlined links, so both are credible.
- [ ] **Keep the underline in running text and tune it.** Pico, GOV.UK, and Tailwind Typography underline always; Radix and Open Props underline on hover only. Recommend `text-underline-offset: 0.15em` (GOV.UK uses 0.1578em, Pico 0.125em) and `text-decoration-thickness: max(1px, 0.0625rem)` (GOV.UK). Sources as above.
- [ ] **Give hover a visible change.** Today hover equals base. Recommend hover colour `semantic.primary` (the darker starter blue) and a thicker underline, matching GOV.UK's darker hover and `max(3px, 0.1875rem, 0.12em)` hover thickness and Pico's darker hover. Source: [GV settings/_links.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/settings/_links.scss).
- [ ] **Model: decide on a visited state.** Open Props (purple-7) and GOV.UK (`#54319f`) style `:visited`; shadcn/ui, Radix, Pico, and Tailwind Typography do not. The rule-state list has no `visited`. Recommend leaving visited native for now; content-heavy sites can add it later.

### Lists

Current: `ul`/`ol` own block rhythm `m` and `padding-inline-start: l`; `li` owns `margin-block-end: 3xs`; `dl`/`dt`/`dd` own rhythm, term weight 600, and indentation. Marker properties are forbidden by the Lists spec.

- [ ] **Keep markers in the text colour** (see [List marker colour](#list-marker-colour)).
- [ ] **Keep native disc and decimal markers.** shadcn/ui, Tailwind Typography, and GOV.UK use disc and decimal; Pico alone switches `ul` to square. Sources: [TT L330–L352](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L330-L352), [PICO L853–L864](https://github.com/picocss/pico/blob/main/css/pico.css#L853-L864), [GV core/_lists.mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/core/_lists.mixin.scss).
- [ ] **Check item spacing against an 8px reference.** shadcn/ui uses `mt-2` (8px) and Tailwind Typography 8px between items; Pico 4px; GOV.UK 5px. Confirm in the Element Overview that `3xs` reads as roughly 4–8px at the current Primitives; if it is tighter, step to `2xs`.
- [ ] **Add a small top margin to nested lists.** Tailwind Typography uses 12px, Pico 4px, GOV.UK 10px. Today a nested list inherits the container's `m` rhythm, which is too loose inside an item. This is a relationship rule (`li > ul`, `li > ol`).
- [ ] **Model: a `::marker` rule kind** only if the user later chooses muted or accent markers.

### Quotes

Current: `blockquote` uses size `l`, line height 1.5, a 0.25rem inline-start rule in `semantic.action`, padding `m`, and margins `l`. `q` is Native.

- [ ] **Use a neutral rule colour.** shadcn/ui (border token), Tailwind Typography (gray-200), Pico (muted border), and GOV.UK inset text (`#cecece`) use neutral rules; only Radix uses a soft accent (`accent-a6`). Recommend `semantic.border`, keeping `action` as the offered alternative. Sources: [SH typography-blockquote.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/examples/typography-blockquote.tsx), [TT L1485–L1498](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1485-L1498), [PICO L873–L885](https://github.com/picocss/pico/blob/main/css/pico.css#L873-L885), [RX blockquote.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/blockquote.css). Mobbin: [hilos](https://mobbin.com/screens/bcddefee-b741-4ca9-b4fa-33d52ff02cf6) and [Shopify](https://mobbin.com/screens/282eb11a-9a6d-4ec1-a978-e619c67a1c1e) use thin grey rules.
- [ ] **Keep the quote at body size (`m`) rather than `l`.** None of the six enlarges a block quotation by default; a large quote reads as a pull quote, which is a separate Component. Weight and italics split: shadcn/ui and Tailwind Typography italicise; Radix, Pico, and Open Props do not. Recommend upright text at body size, with italics offered as a choice.
- [ ] **Do not insert quotation marks.** Only Tailwind Typography generates curly quotes; inserted marks duplicate authored ones and are announced inconsistently.
- [ ] **Style the attribution.** The audit requires visible attribution. Pico mutes a `blockquote footer`; recommend a relationship rule for `blockquote footer` or `figure > blockquote + figcaption` with size `s` and the muted tone below. Source: [PICO L873–L885](https://github.com/picocss/pico/blob/main/css/pico.css#L873-L885).

### Code

Current: `code` owns the code family and size `s` only. `pre` owns text and background both set to `semantic.text` on `semantic.surface`, padding `m`, radius `m`, `white-space: pre`, and `overflow-x: auto`. `kbd` has a 1px border.

- [ ] **Give inline `code` a subtle background, padding, and radius.** shadcn/ui (`bg-muted`, 0.2rem/0.3rem, `rounded`), Pico (light grey, 0.375rem, 0.25rem), Open Props (gray-2, 0.25rem/0.5rem, 5px), and Radix (`accent-a3`) all do; Tailwind Typography instead adds backticks and weight 600. Recommend background `color-mix(in oklch, var(--semantic-text) 6%, var(--semantic-surface))`, padding `0.15em 0.3em`, radius `xs`, and size `0.875em` so it tracks the surrounding text. Sources: [SH typography-inline-code.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/examples/typography-inline-code.tsx), [PICO L1192–L1246](https://github.com/picocss/pico/blob/main/css/pico.css#L1192-L1246), [OP L157–L173](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L157-L173), [RX code.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/code.css). Mobbin: [Mintlify](https://mobbin.com/screens/0009ec65-be9e-4065-ad21-9d6aef32d94c) uses bordered grey pills.
- [ ] **Separate `pre` from the page.** With `surface` on `surface` and no border, a code block is indistinguishable from paragraph text except for its font. Pico uses the same light grey as inline code; Tailwind Typography uses a dark block (gray-800 with gray-200 text). Recommend the same subtle tint as inline code, which keeps contrast close to body text in both light and dark themes. Mobbin: [Plane](https://mobbin.com/screens/c95e77f9-e60c-4bcb-8443-170cdc8a3945) and [hilos](https://mobbin.com/screens/bcddefee-b741-4ca9-b4fa-33d52ff02cf6) use tinted blocks.
- [ ] **Reset inline styling inside `pre`.** Once `code` has a background and padding, `pre > code` must reset them, or each line gains a pill. Tailwind Typography and Pico both reset nested code. This is a relationship rule.
- [ ] **Keep `kbd` as is.** None of the six styles `kbd` by default except as a Component; our bordered key is reasonable.

### Image and caption

Current: `img` is responsive (`max-inline-size: 100%`, `block-size: auto`) with radius `m`. `figure` resets inline margins and has block rhythm `m`. `figcaption` uses size `s`, line height 1.5, and a `2xs` gap.

- [ ] **Mute the caption colour.** Tailwind Typography (`--tw-prose-captions`, gray-500) and Pico (muted) both do; real products agree — [The New York Times](https://mobbin.com/screens/be94f2e1-e50f-43ca-bc20-eaa938f1e57b) and [Basecamp](https://mobbin.com/screens/4e93830c-4c98-4281-bd40-7656f265db06). Recommend `color-mix(in oklch, var(--semantic-text) 70%, var(--semantic-surface))`, checked to stay at or above 4.5:1. Sources: [TT L410–L421](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L410-L421), [PICO L1251–L1259](https://github.com/picocss/pico/blob/main/css/pico.css#L1251-L1259).
- [ ] **Keep captions start-aligned.** Tailwind Typography and Pico leave alignment to the writing direction; Open Props centres the whole figure. Start alignment keeps long captions readable.
- [ ] **Decide image corner radius as a visible choice.** No reference rounds bare images (Tailwind Typography, Pico, Open Props leave them square), but product screens such as [Plane](https://mobbin.com/screens/d33456c2-9ade-41cc-9839-05490de1b705) and [Basecamp](https://mobbin.com/screens/4e93830c-4c98-4281-bd40-7656f265db06) round media. Keeping radius `m` is a brand choice, not a gap; offer "square" beside it.

### Tables

Current: `table` owns family, size `s`, line height 1.5, and rhythm. `caption` is weight 700 at size `m`. `th` is weight 700 with cell padding; `td` has cell padding only. `thead`, `tbody`, `tfoot`, and `tr` are Native. There are no borders, no collapse, and no width.

- [ ] **Add row lines.** Every bare-element system with a table style draws horizontal lines between rows and none between columns: Tailwind Typography (1px gray-200, header gray-300), Pico (1px muted, 3px under the header), GOV.UK (1px `#cecece`), Radix (1px `gray-a5`), and the shadcn/ui Table component. Recommend `border-collapse: collapse` on `table` and `border-block-end: 1px solid var(--semantic-border)` on `th` and `td`. Sources: [TT L1602–L1631](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1602-L1631), [PICO L1124–L1151](https://github.com/picocss/pico/blob/main/css/pico.css#L1124-L1151), [GV components/table/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/table/_mixin.scss), [RX table.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/table.css), [SH ui/table.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/table.tsx). Mobbin: [Klaviyo](https://mobbin.com/screens/882a39b1-f46f-448f-bed2-8bd6b4c88c1a), [Supabase](https://mobbin.com/screens/98eeca6e-afae-4d62-9193-f49022b56cfd), and [Perplexity](https://mobbin.com/screens/f7c8fc94-6c05-4234-8075-5c7a35aa7066) all use row lines only.
- [ ] **Start-align header cells.** Browsers centre `th`; Tailwind Typography, Pico, GOV.UK, and Radix all start-align. Recommend `text-align: start` and `vertical-align: top` on `th`, and `vertical-align: top` on `td`.
- [ ] **Fill the available width.** Tailwind Typography and Pico set `width: 100%`. Recommend `inline-size: 100%` on `table`; a wide table still needs a scroll wrapper, which stays a Component concern.
- [ ] **Mark the header boundary.** Recommend a stronger line under the header row (Pico's 3px, Tailwind Typography's darker gray-300), or a tinted header background as in [Base44](https://mobbin.com/screens/909420e7-06b1-4526-9d6c-bda5f3c4dd01) and [Shopify](https://mobbin.com/screens/86fd45f0-3e04-4bdf-8d8e-ff1be539182e). The line is the more common default. Because `thead` is Native, this is a relationship rule on `thead th`.
- [ ] **Lower header weight to 600.** Tailwind Typography and Pico use 600; shadcn/ui 500; GOV.UK and Radix bold. 700 at size `s` is heavy beside 400 body cells.
- [ ] **No zebra striping by default.** Only the shadcn/ui typography example stripes; Pico stripes only with `.striped`.
- [ ] **Model: numeric alignment.** GOV.UK right-aligns numeric cells through a class. This belongs to a variant, not the base.

### Divider

Current: `hr` sets only `border-block-start` colour (`border`), style, and 1px width, with margins `xl`.

- [ ] **Reset the user-agent border before drawing the line.** Browsers draw `hr` with a 1px `inset` border on all four sides. Setting only the block-start edge leaves the other three edges in the browser's grey, so the line can render 2px tall in two colours. Add `border: 0` (or zero the other edges) ahead of the block-start border, and set `block-size: 0`. Verify in the Element Overview in light and dark themes.
- [ ] **Keep a 1px neutral line.** shadcn/ui, Radix, Tailwind Typography, Pico, and GOV.UK all use 1px in a light neutral; only Open Props uses 2px. Sources: [TT L1481](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js#L1481), [PICO L1264](https://github.com/picocss/pico/blob/main/css/pico.css#L1264), [OP L202](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L202), [SH ui/separator.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/separator.tsx).
- [ ] **Keep generous margins.** Tailwind Typography uses 48px and Open Props `clamp(4rem, 5vw, 5rem)`; Pico uses 1rem. `xl` matches the long-form references.

### Details

Current: `details` is a bordered box (`border`, 1px, radius `m`, padding `xs`, rhythm `m`); `summary` is weight 600 with compact padding and a 2px focus outline. The native marker, open state, and behaviour are preserved by spec.

- [ ] **Keep the native marker.** Our spec requires it, and GOV.UK (a 14px triangle) and Open Props keep a visible marker. Pico replaces it with an inline-end chevron, as do the FAQ sections on Mobbin — [OpenPhone](https://mobbin.com/sites/sections/16077091-516c-4e22-b6d2-c6ad86b01432), [Savor](https://mobbin.com/sites/sections/357638fb-dbbb-4067-8f40-1f142e921a38), [ClickUp](https://mobbin.com/sites/sections/6a2b0113-03c5-4f13-85a8-030633f92443). That is an accordion Component, not the Element default. Sources: [PICO L1917–L1979](https://github.com/picocss/pico/blob/main/css/pico.css#L1917-L1979), [OP L235–L253](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L235-L253), [GV components/details/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/details/_mixin.scss).
- [ ] **Add `cursor: pointer` to `summary`.** Pico, GOV.UK, and Open Props signal that the summary is interactive.
- [ ] **Consider dropping the box for a lighter default.** Real FAQ sections split evenly between divider rows (OpenPhone, Savor, [TIDAL](https://mobbin.com/sites/sections/e06c0694-0e7d-4134-995e-d55d0991a8ee)) and cards (ClickUp, [Pangram](https://mobbin.com/sites/sections/962b30a4-f4ca-49c0-8ee7-4047b75170b1), [Superpower](https://mobbin.com/sites/sections/0a40c24c-b30f-45ee-b6e4-76187306e2aa)); among systems, Open Props boxes, Pico draws nothing, and GOV.UK indents the open content with a 5px left rule. The current box is defensible; show the user both.
- [ ] **Model: an open state.** Pico adds space under an open summary and GOV.UK indents open content. Neither can be expressed without an `[open]` rule state. Recommend adding it before the details defaults are finalised.

### Buttons

Current: `button` (and `input` types `submit`, `reset`, and `button` through the same factory) uses an `action` background, `surface` text, a 1px `semantic.border` border, radius `m`, size `m`, padding `3xs` by `s`, margins `s` on all four sides, `primary` hover, a `secondary` variant on `surface`, and a disabled state that uses `text` on `surface`.

- [ ] **Match the border to the fill.** A light indigo `semantic.border` edge around a blue fill draws a visible halo. The Framework's own button Component already uses `--btn-border-color` defaulting to the background (`src/framework/component-catalog/index.ts`), and Pico and shadcn/ui do the same. Recommend `border-color: var(--semantic-action)` for the base and `semantic.border` only for the secondary variant.
- [ ] **Set a minimum height.** References range from 32px (Radix) and 36px (shadcn/ui) to about 40px (GOV.UK) and 48px (Pico). Recommend `min-block-size: 2.75rem` to match the current field height, so a button sits level with an input on one row.
- [ ] **Set weight 500–600.** Browser buttons default to 400. Radix and shadcn/ui use 500; GOV.UK and Pico use regular weight. Recommend 600 to separate the label from body text at size `m`, with 500 offered.
- [ ] **Remove default outer margins.** No reference adds margin to bare buttons; margins on all four sides break toolbars and form rows. Spacing belongs to the container.
- [ ] **Add `cursor: pointer`** (Pico, Open Props).
- [ ] **Make disabled look disabled.** Today a disabled button looks like the secondary variant. Pico and shadcn/ui use reduced opacity (0.5); recommend `opacity: 0.5` and `cursor: not-allowed`, keeping the text contrast check advisory because disabled controls are exempt from WCAG 1.4.3.
- [ ] **Keep the 2px focus outline.** Radix (2px solid, 2px offset) and our current outline agree; GOV.UK's yellow treatment is distinctive but brand-specific. Recommend moving the offset from `-2px` to `2px` so the ring sits outside the filled shape and stays visible against the action fill. Source: [RX _internal/base-button.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.css).

### Form fields

Current: text-entry inputs, `textarea`, and `select` share a shell: `text` on `surface`, a 1px `semantic.border` boundary, radius `s`, padding `3xs` by `xs`, `min-block-size: 2.75rem` (`8rem` for textarea), `max-inline-size: 30rem`, and a 2px inset focus outline. The subject excludes `:disabled`, `:read-only`, and `:invalid`. `label` is size `s`, weight 600. `fieldset` is a bordered surface box; `legend` is weight 700. Checkbox and radio are Draft `accent-color` Treatments.

- [ ] **Raise the field boundary to at least 3:1.** WCAG 1.4.11 requires 3:1 for the visual boundary that identifies a field. The Starter `semantic.border` (`#c7d2fe` on `#ffffff`) measures about 1.5:1. References differ: GOV.UK uses a 2px black border; shadcn/ui (`border-input`), Pico (`#cfd5e2`), and Radix (`gray-a7`) use light greys that also fall below 3:1. Recommend `border-color: color-mix(in oklch, var(--semantic-text) 45%, var(--semantic-surface))`, tuned until the existing contrast check passes, rather than changing the shared Border role that dividers and tables rely on. Sources: [GV components/input/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/input/_mixin.scss), [SH ui/input.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/input.tsx), [PICO L1361–L1640](https://github.com/picocss/pico/blob/main/css/pico.css#L1361-L1640).
- [ ] **Make fields fill their column.** Without `inline-size`, a text input renders at the browser's roughly 20-character width so the `30rem` maximum never comes into play. Pico sets fields to full width; Mobbin settings forms ([Dribbble](https://mobbin.com/screens/5e165e7e-4a41-47e9-ac00-63a7c68d9979), [Uxcel](https://mobbin.com/screens/c05dcdb7-2cc0-4d7b-9907-f64e6bc98538), [Magnific](https://mobbin.com/screens/23106449-1ff8-48cf-a9ce-5e37b21ef503)) use column-width fields. Recommend `inline-size: 100%` with the existing `max-inline-size: 30rem`.
- [ ] **Place the label above its field.** `label` is inline today, so a label and input share a line. Pico, GOV.UK, shadcn/ui (`FieldLabel`), and every Mobbin settings form above put labels above fields. Recommend a relationship rule — `label` immediately followed by a text field or `select` — with `display: block` and `margin-block-end: 3xs`; a label that wraps a checkbox or radio stays inline. Sources: [PICO L1361–L1640](https://github.com/picocss/pico/blob/main/css/pico.css#L1361-L1640), [GV components/label/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/label/_mixin.scss).
- [ ] **Lower label weight to 500.** shadcn/ui uses `text-sm font-medium`; Pico and GOV.UK use regular weight. Weight 600 at size `s` competes with section headings in dense forms such as [Customer.io](https://mobbin.com/screens/833d622a-c30d-4471-946a-34db846e254f).
- [ ] **Add hint text.** shadcn/ui (`FieldDescription`, `text-sm` muted), Pico (`input + small`, muted), and GOV.UK (`.govuk-hint`, `#484949`) all style hint text; Mobbin's Dribbble, Uxcel, and Customer.io place a muted line under the field. There is no hint Element, so recommend a relationship rule for `small` adjacent to a field, using the muted tone from the caption item and linked by `aria-describedby`.
- [ ] **Model: style invalid fields.** The shell excludes `:invalid`, so an invalid field falls back to bare browser styling and loses the Framework look entirely. Every reference styles an invalid state: shadcn/ui (`aria-invalid` with a destructive border and ring), Pico (red border and icon), GOV.UK (red border, bold red message, red group rule). Two decisions are needed: an `invalid` rule state, preferably on `:user-invalid` so fields are not red before interaction, and a danger colour, which no current Semantic Role provides. Sources: [SH ui/input.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/input.tsx), [GV components/error-message/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/error-message/_mixin.scss).
- [ ] **Keep the 2.75rem field height.** References range from 32px (Radix) to about 50px (Pico); 44px meets the touch-target guidance the Framework already follows.
- [ ] **Model: placeholder colour.** Open Props mutes placeholders (gray-7 at 75%). Our model has no `::placeholder` rule; the browser default is acceptable until one exists.
- [ ] **Promote checkbox and radio with `accent-color: semantic.action`, and size them.** shadcn/ui (primary), Radix (accent indicator), Pico (`#0172ad`), and Open Props (brand) all fill checked controls with the brand or action colour; GOV.UK alone uses black. Recommend keeping `action`, adding `inline-size` and `block-size` of `1.125rem` (Pico uses 1.25em, shadcn/ui and Radix 16px), and promoting once the `accent-color` evidence gate passes. Sources: [SH ui/checkbox.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/checkbox.tsx), [RX _internal/base-checkbox.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-checkbox.css), [OP L255](https://github.com/argyleink/open-props/blob/main/src/extra/normalize.src.css#L255).
- [ ] **Drop the fieldset box by default.** Pico removes the fieldset border, GOV.UK draws none, and Mobbin settings forms group fields with headings and dividers rather than boxes. Open Props alone keeps a 1px border. Recommend `border: 0`, zero inline padding, and the `legend` styled as a small heading; show the boxed version as the alternative. Sources: [PICO L1361–L1640](https://github.com/picocss/pico/blob/main/css/pico.css#L1361-L1640), [GV components/fieldset/_mixin.scss](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/fieldset/_mixin.scss).

## Model and role decisions this research depends on

These are not style choices; they decide whether some recommended defaults can exist at all.

| Decision | Needed by | Recommendation |
| --- | --- | --- |
| A muted text tone | captions, hints, blockquote attribution, optional list markers | Use `color-mix()` from Text and Surface now, as #72 keeps the current roles; reconsider a Muted Text Semantic Role when the colour system is revisited. |
| A subtle surface tone | inline code, `pre`, optional table header | Same approach: `color-mix()` from Text and Surface. |
| A danger colour | invalid fields and error messages | Required before invalid styling can ship. The current six roles have no candidate. |
| More rule states | `:visited` (links), `:user-invalid` (fields), `[open]` (details) | Add `invalid` and `open` first; `visited` can wait. |
| Pseudo-element rules | `::marker`, `::placeholder` | Not needed for the recommended defaults; needed only if the user wants muted or accent markers or styled placeholders. |
| Relationship rules for core Elements | first-heading margin, nested lists, `pre > code`, `thead th`, label-above-field, hint text, blockquote attribution | The relationship mechanism exists for links; extend it to these pairs. |

## Unverified and caveats

- Radix Themes' default accent being indigo, and the colour values behind `--accent-indicator` and `--focus-8`, were not read from the Theme source.
- Tailwind CSS v4 expresses the grey names in OKLCH; the hex values above are the v3 equivalents.
- GOV.UK's 5px red left border on error groups comes from `objects/_form-group.scss`, which was not opened.
- GOV.UK line length comes from its grid, not its type CSS, and was not checked.
- GOV.UK colours are from v6.6.0; earlier releases differ.
- shadcn/ui `rounded-md` is about 8px on the docs site (`--radius: 0.625rem`); a project theme may map it differently. The shadcn/ui `h4` example was not read.
- The `hr` double-edge finding and the 20-character default input width follow from browser default styles and should be confirmed visually in the Element Overview before the decision ticket closes.
- Mobbin observations are visual readings of screenshots, not CSS values.
