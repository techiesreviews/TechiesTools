# Element default styles: gap checklist

Research date: 2026-11-20

This note compares what leading design systems and CSS baselines style by default for the core Elements with the current Treatment Definitions in `src/framework/treatments/` on `main` (identical on `dev` at the time of writing). Each family ends with an unticked gap checklist. The style-decision cards work through these lists: TOOLS-76 to TOOLS-80 decide what changes, and this note only records the evidence.

Related cards: TOOLS-73 (this research), TOOLS-74 ([further Elements shortlist](further-elements-shortlist.md)), map TOOLS-72.

## Sources

Design systems and baselines (read from the published packages, not from screenshots):

| Source | Version read | What it is |
| --- | --- | --- |
| [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) | `@tailwindcss/typography` 0.5.16, `prose` default | Long-form content styles |
| [Pico CSS](https://picocss.com/) | `@picocss/pico` 2.1.1 | Classless baseline |
| [Open Props normalize](https://open-props.style/) | `open-props` 1.7.16, `normalize.css` | Token-driven baseline |
| [Radix Themes](https://www.radix-ui.com/themes) | `@radix-ui/themes` 3.2.1 | Component theme |
| [GOV.UK Frontend](https://design-system.service.gov.uk/) | `govuk-frontend` 5.11.0 | Public-service design system |
| [shadcn/ui](https://ui.shadcn.com/) | `new-york-v4` registry, typography examples | Copy-in component set |

Real products: 58 web screens from Mobbin across documentation, settings forms, pricing and FAQ pages, blog articles, data tables and marketing footers (Stripe, Plane, Mintlify, Productboard, Klaviyo, Customer.io, Sprig, Snowflake, Remote, The New York Times, Quartz, GetYourGuide, Xero, Dribbble, Etsy and others). The counts in this note are by eye from screenshots, so they are approximate. Example screens are linked where a point leans on them.

"Consensus" below means at least four of the six systems do the same thing, or every product screen that shows the Element does it.

## Cross-cutting gaps

These block fixes in several families, so they come first.

- [ ] **No muted text role.** Every system has a secondary text colour (Tailwind slate-500/600, Pico muted colour, Open Props `--text-2`, Radix gray-11, GOV.UK secondary text, shadcn `muted-foreground`). Captions, helper text, list markers, quote attribution and placeholders all use it. The semantic family has only `text`.
- [ ] **No subtle surface role.** Code blocks, inline code, table headers, striped rows and details panels sit on a second surface (Open Props `--surface-2`, shadcn `muted`, Radix gray-a3, Pico code background). The only surface token is the page surface, so `pre` and `details` cannot be set apart.
- [ ] **No danger or error role.** Invalid fields, error messages and destructive buttons use it in GOV.UK, shadcn, Pico and Radix. None exists.
- [ ] **No divider-strength border.** Systems use a lighter line for table rows and `hr` (Tailwind slate-200, Radix gray-a5/a6) than for field borders. The single `border` token (`#c7d2fe`, a tinted indigo) does both jobs.
- [ ] **Contract limits to check.** `cursor`, `text-wrap`, `text-underline-offset`, `text-decoration-thickness`, `text-decoration-color`, `font-variant-numeric`, `border-collapse` and longhand resets of other border sides are all used by the sources. Each fix below that needs one should confirm it is allowed by [the Treatment Definition contract](treatment-definition-contract.md); transitions stay banned.
- [ ] **No state rules for invalid, disabled, read-only or placeholder on form fields.** Today the field selectors exclude those states (`:not(:disabled):not(:read-only):not(:invalid)`), so such fields fall back to browser defaults instead of getting a designed state. The contract already allows `::placeholder`.

## Text

Current treatment (`typography/index.ts`): headings use the heading family, sizes 4xl to m, weight 700 or 800, line height 1.1 or 1.2. `p` uses size m, line height 1.6, max width 65ch. No text colour is set on headings or paragraphs; `strong` is 700, `small` is size s.

Consensus:

- Body text is a softer colour than headings (Tailwind slate-700 body on slate-900 headings; Open Props `--text-1`; shadcn muted for lead and secondary text).
- Long-form line height 1.6 to 1.75 and a 60 to 70ch measure (Tailwind 1.75 and 65ch, Open Props `--size-content-3`). The current values match.
- Headings get `text-wrap: balance` (Open Props, shadcn h1); paragraphs get `text-wrap: pretty` (Open Props).
- Large headings get slightly tighter letter spacing (shadcn `tracking-tight`); weights step down from h1 to h4 (Tailwind 800, 700, 600, 600).
- A lead paragraph and a muted small text style are standard (shadcn `lead` and `muted`; products show a muted description under almost every settings label: [Sprig](https://mobbin.com/screens/2bff8b12-5311-460e-aa87-7034c579e7bd), [Magnific](https://mobbin.com/screens/f8e0f368-7645-45a2-888c-287df1eaf87f)).
- `strong` is 600 in Tailwind and Radix; 700 is also common.

Gaps:

- [ ] No heading or body colour token, so text cannot be softened against headings.
- [ ] No muted option for `small` or helper text (needs the muted role).
- [ ] No `text-wrap: balance` on headings or `text-wrap: pretty` on paragraphs.
- [ ] No letter-spacing option on large headings.
- [ ] Heading weight is one value for all levels; no step-down from h1 to h4.

## Links

Current treatment (`actions/index.ts`): colour is the `text` token, underline on, hover colour is also `text`, active is `text`, focus is a 2px solid focus outline with 2px offset. A `quiet` variant removes the underline; `aria-current` in navigation adds it.

Consensus:

- Links have their own colour, different from body text (Pico primary, Open Props `--link`, Radix accent, GOV.UK link blue, shadcn `text-primary`). Tailwind is the exception: dark text plus underline plus weight 500.
- The underline is pushed down and thinned: offset `0.125em` (Pico), `calc(0.025em + 2px)` (Radix), `0.1578em` (GOV.UK), `underline-offset-4` (shadcn); thickness about 1px (Radix `min(2px, max(1px, 0.05em))`, GOV.UK `max(1px, 0.0625rem)`).
- Many tone the underline down (Pico and Radix mix the link colour with transparency; Open Props uses a pale indigo).
- Hover is always visible: thicker underline (GOV.UK), underline appears (Radix, Open Props, shadcn link variant), or colour shifts (Pico).
- Visited state: Open Props and GOV.UK style it; the rest do not.
- Products: link colour plus underline in body copy ([NYT](https://mobbin.com/screens/be94f2e1-e50f-43ca-bc20-eaa938f1e57b), [AirOps](https://mobbin.com/screens/a160611c-6fec-46bc-88c1-4aff9898cd36), [Mintlify](https://mobbin.com/screens/0009ec65-be9e-4065-ad21-9d6aef32d94c)).

Gaps:

- [ ] Hover gives no visible change (hover colour equals base colour, underline unchanged).
- [ ] No link colour distinct from body text (only `text` is offered).
- [ ] No underline offset, thickness or underline colour.
- [ ] No visited state (decide whether to add one or document that it is left out on purpose).

## Lists

Current treatment (`lists/index.ts`): `ul` and `ol` get block margins m and start padding l; `li` gets a 3xs bottom margin; `dt` is 600; `dd` is indented l. There is no `::marker` rule.

Consensus:

- Markers are quieter than the text: Tailwind colours `ol` markers slate-500 and `ul` markers slate-300. This is the "marker colour" question on the map.
- Item spacing is larger than 3xs: Tailwind 0.5em, shadcn `mt-2`, GOV.UK 5px, Open Props `li` start padding.
- Pico switches `ul` bullets to `square`; others keep the browser default.
- Lists used as navigation or footers drop markers entirely ([Meetup footer](https://mobbin.com/screens/d1846133-67f8-40f6-bb99-956fc2e3273c), [H&M footer](https://mobbin.com/screens/0ce85e27-6656-4ea8-b7ad-e4cd9e080dc0)); GOV.UK's default list has no bullets at all and adds them with a modifier.

Gaps:

- [ ] No `::marker` colour (allowed by the contract, unused). Needs the muted role or a marker token.
- [ ] No marker weight for ordered lists (Tailwind sets 400 so numbers do not compete with bold text).
- [ ] Item spacing 3xs is tighter than every source.
- [ ] No unmarked list variant for navigation and footer lists (see the [shortlist](further-elements-shortlist.md)).

## Quotes

Current treatment (`typography/index.ts`): `blockquote` is size l, line height 1.5, a 0.25rem solid start border in the `action` colour, start padding m, block margins l. `cite` is italic and size s.

Consensus:

- A start border of about 0.25rem is universal (Tailwind, Pico, Open Props, Radix; shadcn 2px). The current treatment matches.
- The border is usually quiet, not the brand colour: Tailwind slate-200, Radix accent at low alpha, Pico muted border. The current `action` blue is louder than every source.
- Italic quote text in Tailwind and shadcn; Tailwind also sets weight 500.
- Attribution (`footer` or `cite` inside the quote) is muted (Pico).
- Browser inline margins (40px each side) are removed or replaced by padding in every baseline.
- Products: pull quotes vary widely ([Contra blog](https://mobbin.com/screens/5ab99fa2-2d82-4cd9-b9c0-46e6ec2f9f0b) uses a large quotation mark and bold text; [Shopify](https://mobbin.com/screens/282eb11a-9a6d-4ec1-a978-e619c67a1c1e) uses a grey border and grey text).

Gaps:

- [ ] Browser inline margin stays on `blockquote` (only block margins are set).
- [ ] No quiet border option (only `action`); needs a divider-strength or muted border.
- [ ] No italic or text-colour option for quote text.
- [ ] No muted attribution style.

## Code

Current treatment (`typography/index.ts`): `code` sets only the code family and size s. `pre` sets text on `surface`, padding m, radius m, horizontal scroll and `white-space: pre`. `kbd` has a 1px border, radius s and padding.

Consensus:

- Inline code is a chip: background, small padding, small radius (Pico, Open Props, Radix soft variant, shadcn `bg-muted px-[0.3rem] py-[0.2rem] rounded`). Tailwind instead adds weight 600 and backticks. Products agree on the chip ([hilos](https://mobbin.com/screens/9f3ee480-2c8d-43b9-bed6-69a201b53e41), [Mintlify](https://mobbin.com/screens/0009ec65-be9e-4065-ad21-9d6aef32d94c)).
- Code size is relative, about 0.875em, so it scales with its context (Tailwind, Pico); the current fixed size s does not follow the surrounding text.
- Code blocks are set apart from the page: a dark block (Tailwind slate-800, [Base44](https://mobbin.com/screens/67828c1b-90e1-4e8d-89a1-9e6f6cec99b4)) or a light grey block ([Braintrust](https://mobbin.com/screens/0137e9e2-ee24-42f9-ad7b-b37f547e441c), [Subframe](https://mobbin.com/screens/a8f6525d-bd32-436a-b735-9013328d8161)).
- `pre code` resets the inline chip so blocks do not get a chip inside a block.
- Inline code does not wrap mid-token (Open Props `white-space: nowrap`).

Gaps:

- [ ] Inline `code` has no background, padding or radius.
- [ ] `pre` uses the page surface, so a code block is not visible as a block. Needs the subtle surface role or a dark block pair.
- [ ] No `pre code` reset (any future inline chip would also appear inside blocks).
- [ ] Code size is a fixed step, not relative to context.

## Image and caption

Current treatment (`media/index.ts`): `img` is fluid (max inline size 100%, auto block size) with radius m. `figure` has block margins m and no inline margin. `figcaption` is size s, line height 1.5, a 2xs top margin.

Consensus:

- Fluid images everywhere (Open Props also sets `display: block`, which the contract bans; the fluid rule alone is fine).
- Captions are muted and small: Tailwind slate-500 at 0.875em, Pico muted, Open Props size 1 and balanced text. Products agree ([NYT](https://mobbin.com/screens/be94f2e1-e50f-43ca-bc20-eaa938f1e57b), [Quartz](https://mobbin.com/screens/a910548f-5d2b-4945-b1c9-323bed2af35f), [Productboard](https://mobbin.com/screens/8ca5626e-fdbd-46b9-9fc7-c25db8a3d4b4)).
- Caption gap is larger than 2xs: Tailwind 0.857em, Pico 0.5rem padding.
- Rounded images are common but not universal; editorial sites keep square corners ([Tripadvisor](https://mobbin.com/screens/19e1f47a-abac-438e-b433-dfcd66a660a7)).

Gaps:

- [ ] Caption has no muted colour (needs the muted role).
- [ ] Caption gap 2xs is tighter than the sources.
- [ ] No square-corner option for editorial images (radius m is the default; check the offered choices).
- [ ] No `text-wrap: balance` on short captions.

## Tables

Current treatment (`data/index.ts`): `table` sets body family, size s, line height 1.5, block margins. `caption` is size m, weight 700. `th` is weight 700 with cell padding; `td` has cell padding. No borders, no collapse, no width, no text alignment.

Consensus:

- Full width and collapsed borders (Tailwind, Radix, GOV.UK `width: 100%` and `border-collapse: collapse`). Open Props is the exception (`fit-content` and rounded corners).
- Row separators: a 1px bottom border on each row or cell (Tailwind, Pico, Radix, GOV.UK, shadcn), with a heavier line under the header (Tailwind slate-300 versus slate-200, Pico 3px header border). Products: almost every table screen shows row lines only, no vertical lines ([Stripe](https://mobbin.com/screens/ab9ed449-1e64-4dbe-8be4-b98b53831762), [Gumloop](https://mobbin.com/screens/b191aef1-ec44-48ac-ad7f-c76673fed6f5), [Square](https://mobbin.com/screens/85857182-8f04-4314-b06e-29df202cf84a)). Content tables in documents more often have full cell borders and a tinted header ([Productboard](https://mobbin.com/screens/a4441f9c-a657-45a0-8e01-1fd1bbc9d35a), [Microsoft Copilot](https://mobbin.com/screens/0c63e9de-5b04-420c-b51d-f88d5ba86680)).
- Header cells are start-aligned (Tailwind, Pico, Radix, GOV.UK, shadcn). Browsers centre `th` by default, so this needs a rule.
- Header weight 600 (Tailwind) or 500 (shadcn), sometimes muted ([Stripe](https://mobbin.com/screens/ab9ed449-1e64-4dbe-8be4-b98b53831762), [Snowflake](https://mobbin.com/screens/8439d88b-17ea-4d9a-bdf0-0ea02f868c7a)).
- Numbers right-aligned with tabular figures (GOV.UK numeric cells; [Square](https://mobbin.com/screens/85857182-8f04-4314-b06e-29df202cf84a)).
- Cells align to the top (GOV.UK) and the caption is start-aligned (GOV.UK).
- Optional row hover (shadcn, Open Props) and striping (Pico `.striped`, shadcn typography `even:bg-muted`).

Gaps:

- [ ] No row or cell borders at all.
- [ ] No `border-collapse` and no full-width option.
- [ ] `th` keeps the browser's centred alignment.
- [ ] No heavier header separator.
- [ ] No numeric or tabular-figures option.
- [ ] No vertical alignment and no caption alignment rule.
- [ ] No striping or row-hover variant (needs the subtle surface role).

## Divider

Current treatment (`typography/index.ts`): `hr` sets only the top border colour, style and width, plus block margins xl.

Consensus:

- Reset the browser's inset border on every side, then draw one line: Pico `height: 0; border: 0; border-top: 1px solid`, GOV.UK `border: 0` then a 1px bottom border, Open Props zero borders then a 2px background, shadcn separator `h-px bg-border`.
- The line is light: Tailwind slate-200, Pico muted border, Radix accent at low alpha.
- Products use dividers heavily between settings sections and article sections ([Sprig](https://mobbin.com/screens/2bff8b12-5311-460e-aa87-7034c579e7bd), [Plane](https://mobbin.com/screens/d33456c2-9ade-41cc-9839-05490de1b705), [Shopify](https://mobbin.com/screens/282eb11a-9a6d-4ec1-a978-e619c67a1c1e)).

Gaps:

- [ ] The browser's inset borders on the other three sides stay, so the rule renders as a two-tone groove edge rather than one flat line. Needs longhand resets of the bottom and side borders (check the contract allows them).
- [ ] No `height: 0`.
- [ ] No lighter divider colour than the field border.
- [ ] Margin xl is fixed; no smaller rhythm option for dense settings pages.

## Details

Current treatment (`disclosure-dialog/index.ts`): `details` has the page surface, a 1px border, radius m, padding xs, block margins m. `summary` is weight 600, line height 1.4, padding 2xs and a focus outline. No open state.

Consensus:

- `summary` shows a pointer cursor (Pico, Open Props).
- The marker is replaced or restyled: Pico hides it and draws a chevron that rotates when open; GOV.UK draws its own triangle; shadcn accordions use a rotating chevron. Products show chevrons or plus and minus signs almost always on the end side, never the browser triangle ([Uxcel](https://mobbin.com/screens/791eb545-a012-4e8b-a39f-86d23f9630a6), [Meetup](https://mobbin.com/screens/744bfe6f-d44c-496a-b0da-4eb74935bd36), [Etsy](https://mobbin.com/screens/7463081c-44b8-4945-9461-578e427cb241)).
- The open state adds space under the summary (Pico, Open Props `details[open] > summary` margin) and sometimes changes the summary colour (Pico).
- Two shapes are common: a boxed panel (Open Props, [Magnific FAQ](https://mobbin.com/screens/5021594f-6c4c-4d52-912b-a2309aa975ca)) or a borderless row with a divider between items (shadcn accordion, [GetYourGuide](https://mobbin.com/screens/87a04c03-2e89-4285-9518-5aca84cb9b19)).
- GOV.UK styles the summary like a link (link colour, underline).

Gaps:

- [ ] No pointer cursor on `summary`.
- [ ] No `::marker` styling (colour or size) on `summary`; replacing it with an end-side chevron needs pseudo-element content, which the contract bans, so the realistic option is colouring the native marker.
- [ ] No `[open]` state rule (spacing under the summary, colour change).
- [ ] No borderless divider-row variant for FAQ lists.

## Buttons

Current treatment (`actions/index.ts`, shared with `input[type=submit|reset|button]`): surface text on the `action` colour, size m, 1px border, radius m, padding 3xs by s. Hover switches to `primary`, focus is an inset outline, active returns to `action`, disabled swaps to text on surface. A `secondary` variant uses text on surface.

Consensus:

- Weight 500 (shadcn `font-medium`, Tailwind) or 600; line height about 1.5 (Pico); the font is inherited, not the browser's system button font.
- A minimum height of about 36 to 40px (shadcn `h-9`, GOV.UK about 40px), or 44px on touch.
- Pointer cursor (Pico, Open Props).
- Disabled lowers contrast as a whole (shadcn `opacity-50`, Radix gray-a8 on gray-a3) and keeps the shape; products agree ([Contra](https://mobbin.com/screens/1cfaaba0-c38b-4145-b1a1-8f32dbb6f606), [Perplexity](https://mobbin.com/screens/4ba28230-49f3-46bb-8fa4-7a36dfd3ca36), [Customer.io](https://mobbin.com/screens/662265b2-3db3-4bf0-8e4a-519ef915e1e6)). The current swap to normal text on surface makes a disabled primary button look like an enabled secondary one.
- Variant set: primary, secondary or outline, ghost, destructive and link (shadcn); GOV.UK has primary, secondary and warning; Radix has solid, soft, surface, outline and ghost. Products show primary (dark or brand fill), outline and quiet text buttons on nearly every screen, and many icon-only buttons.
- Focus ring outside the button (shadcn 3px ring, Radix 2px outline, GOV.UK yellow). The current inset outline is less common.
- `::file-selector-button` is styled like a button (Pico, shadcn input).

Gaps:

- [ ] No font weight, line height or font-family inheritance on buttons.
- [ ] No minimum block size (tap target).
- [ ] No pointer cursor.
- [ ] Disabled state reads as an enabled secondary button.
- [ ] No ghost (quiet), destructive or link-style variant; destructive needs the danger role.
- [ ] No `::file-selector-button` treatment (allowed by the contract, unused).

## Form fields

Current treatment (`form-control.ts` and `forms-*`): text inputs, `textarea`, single `select`, number and date fields share text on surface, body family, size m, line height 1.5, a 1px border, radius s, padding 3xs by xs, a 2.75rem minimum height (8rem for `textarea`) and a 30rem maximum width, with an inset focus outline. Every selector excludes `:disabled`, `:read-only` and `:invalid`. Checkbox, radio, range and progress get only `accent-color`. Labels are size s, weight 600; legends size m, weight 700.

Consensus:

- Placeholder text is muted (Pico, Open Props gray at 0.75 opacity, Radix gray-a10, shadcn `muted-foreground`).
- Invalid state: a red border and a red focus ring, usually keyed on `aria-invalid="true"` so it shows after validation rather than on page load (Pico, shadcn, GOV.UK `--error`). Product example: [Customer.io](https://mobbin.com/screens/662265b2-3db3-4bf0-8e4a-519ef915e1e6) shows a red border plus a red message.
- Disabled and read-only fields get a grey background and a not-allowed cursor (shadcn, Radix); products agree ([Sprig](https://mobbin.com/screens/2bff8b12-5311-460e-aa87-7034c579e7bd), [GetYourGuide](https://mobbin.com/screens/396cdcd4-7953-4102-b194-1791f3ad7734)).
- Field height 36 to 40px (shadcn `h-9`, GOV.UK 40px). The current 44px is larger but fine for touch.
- Labels are 500 (shadcn) or bold (GOV.UK); helper text under the label is muted (see the [shortlist](further-elements-shortlist.md)).
- `textarea` resizes vertically only and may grow with content (Open Props and shadcn `field-sizing: content`).
- A transparent or slightly tinted background is common (shadcn transparent, Open Props `--surface-2`); white on white with a border is also common in products.

Gaps:

- [ ] No `::placeholder` colour (allowed by the contract, unused; needs the muted role).
- [ ] No invalid state; selectors skip invalid fields entirely, so they get browser defaults. Needs the danger role and an `aria-invalid` rule.
- [ ] No disabled or read-only state; same exclusion problem.
- [ ] No hover state on fields.
- [ ] No vertical-only resize on `textarea`.
- [ ] Checkbox, radio and range rely on `accent-color` only; with `appearance` banned this is the Native Fallback. Record it as a deliberate choice rather than a gap.

## How to use this checklist

Each style-decision card picks the families it owns, ticks a box when the decision is made (fix, decline, or defer), and links its PR next to the box. A box ticked as "decline" keeps a one-line reason. The cross-cutting token gaps should be decided first, because most family fixes depend on the muted, subtle surface and danger roles.
