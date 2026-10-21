# Extra Elements that SaaS and marketing sites style by default

Research date: 2026-10-22

Issue: [#74](https://github.com/techiesreviews/TechiesTools/issues/74), part of map [#72](https://github.com/techiesreviews/TechiesTools/issues/72).

## Question

Beyond the core set named in #72 (headings, paragraph, links, lists, blockquote, figure and figcaption, img, table, buttons, text input, select, checkbox, radio, textarea, label and fieldset, details and summary, hr, code), which Elements do SaaS applications and commercial marketing websites typically give a default style, how common is each, and in what order should they join the Element Overview?

## Recommendation

Add Elements to the overview in this order. The first five are close to universal in SaaS products; items 6 to 10 matter to both audiences or are common in one; the rest are optional.

| Rank | Element | Audience | Current entry | Why this position |
| ---: | --- | --- | --- | --- |
| 1 | `dialog` | SaaS | Active `1.0.0` | 6 of 8 reference systems ship a styled modal; every SaaS confirm-delete sample on Mobbin used one (8/8). Already Active, so it costs only overview space. |
| 2 | `progress` | SaaS, some marketing | Draft `0.1.0` | 6 of 8 systems style it; every onboarding sample showed a step bar (6/6). Drafts appear with the "unfinished" label, so it can show now. |
| 3 | Switch (`input[type="checkbox"]` with `switch` or `role="switch"`) | SaaS | **Missing** | 6 of 8 systems ship a switch; every settings sample used switches (8/8). Best modelled as a variant of the Draft `input-checkbox` entry, not a new Element (see notes). |
| 4 | `kbd` | SaaS, docs | Active `1.0.0` | Styled by 7 of 8 systems, the highest coverage of any candidate. Shortcut sheets (6/6) and `⌘K` hints in search bars are routine. |
| 5 | `nav` (with `ul`, `a[aria-current]`) | Both | Native `0.0.0` | Every system ships navigation components; every marketing header (6/6) and nearly every SaaS shell had one. Show it as a combination, not a lone `nav` style. |
| 6 | `small` | Both | Active `1.0.0` | Helper text under fields and fine print ("/month", "Billed annually") appeared in every pricing sample (8/8). Pico, Primer and Bootstrap style it directly. |
| 7 | `dl` / `dt` / `dd` | SaaS | Active `1.0.0` | 6 of 8 systems style key–value lists (Radix DataList, GOV.UK Summary list, Polaris DescriptionList). Usage and account panels use them. May already count as "lists" in the core set. |
| 8 | `input[type="search"]` | SaaS | Active `1.0.0` | Search fields appeared in about a third of all SaaS screens sampled (12/42), usually with a leading icon and a `⌘K` hint. |
| 9 | `meter` | SaaS | Native `0.0.0` | No reference system styles native `meter`, but 7 of 8 usage/billing samples showed a quota bar, which is a meter by meaning. Pair it with `progress`. |
| 10 | `input[type="date"]` family (`date`, `time`, `datetime-local`) | SaaS | Active `1.0.0` (month, week: Draft `0.1.0`) | Every date-filter sample (6/6) used typed start/end fields beside a custom calendar. The field is the native part worth styling. |
| 11 | `input[type="range"]` | SaaS, pricing calculators | Draft `0.1.0` | 5 of 8 systems ship a slider. |
| 12 | `pre` | Docs, SaaS | Active `1.0.0` | 5 of 8 systems style code blocks. Probably part of the core "code" family already. |
| 13 | `input[type="file"]` | SaaS | Native `0.0.0` | 4 of 8 systems (GOV.UK File upload, Polaris DropZone, Pico, Bootstrap). |
| 14 | `mark` | Both, light | Active `1.0.0` | Pico and Bootstrap style it; used for search-match highlighting. Not seen in the Mobbin sample. |
| 15 | `video` | Marketing | Native `0.0.0` | Tailwind Typography styles it in prose; product demo videos are common on marketing pages. |
| 16 | `hgroup` | Marketing | **Missing** | Pico styles it. Eyebrows or subtitles beside headings were common (4 of 8 pricing samples). Better treated later as Component Guidance. |
| 17 | `sup` / `sub` | Marketing, docs | **Missing** | Pico and Bootstrap fix their line-height; superscript cents appeared in 1 of 8 pricing samples. |
| 18 | `del` / `ins` / `s` | Marketing | **Missing** | Pico styles `del` and `ins`; used for struck-through old prices. Not seen in the sample. |
| 19 | `abbr` | Docs | Active `1.0.0` | Pico and Bootstrap style `abbr[title]`; rare in product UI. |
| 20 | `output`, `time`, `q`, `samp` | Low | `output` Active; `time`, `q` Native; `samp` missing | One or two systems at most, and nothing visible in the sample. |

Inline `strong` and `em` (both Active) are styled by every system, but they belong inside the paragraph combination rather than as separate overview tiles.

## Method

Two independent signals were combined.

1. **What design systems style by default.** Eight first-party sources were checked against their own published component lists or CSS source: shadcn/ui, Radix Themes, Pico CSS, Tailwind Typography, GOV.UK Design System, Primer, Polaris (React source), and Bootstrap 5.3 Reboot. Tailwind Preflight was also checked, but only as a reset reference: it normalises elements and does not design them. A system counts as styling an Element when it ships either a selector for that native element or a named component that renders that native control.
2. **What real products show.** The Mobbin MCP was searched for 62 web results: 42 SaaS screens across six queries and 20 marketing sections across three queries. Each image was inspected directly. Mobbin ranks results by relevance to the query, so the counts below show how often a pattern appears **where it is relevant**. They are not a census of the web.

Lifecycle states come from the `version` field in `src/content/elements/*.md` on `main`, using the rule in `src/framework/catalog/index.ts`: `0.0.0` is Native, `0.x.x` is Draft, and `1.0.0` or later is Active (subject to Activation Evidence).

## Evidence: design systems

`✓` = styles the native element or ships a named component for it. `~` = covered only indirectly (for example a generic text field with an icon slot). Blank = not found.

| Element | shadcn/ui | Radix Themes | Pico CSS | Tailwind Typography | GOV.UK | Primer | Polaris | Bootstrap 5.3 | Count |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| `kbd` | ✓ | ✓ | ✓ | ✓ |  | ✓ | ✓ | ✓ | 7 |
| `nav` (navigation components) | ✓ | ✓ | ✓ |  | ✓ | ✓ | ✓ | ✓ | 7 |
| `dialog` | ✓ | ✓ | ✓ |  |  | ✓ | ✓ | ✓ | 6 |
| `progress` | ✓ | ✓ | ✓ |  |  | ✓ | ✓ | ✓ | 6 |
| Switch | ✓ | ✓ | ✓ |  |  | ✓ | ✓ | ✓ | 6 |
| `dl` / `dt` / `dd` |  | ✓ |  | ✓ | ✓ | ✓ | ✓ | ✓ | 6 |
| `pre` | ✓ |  | ✓ | ✓ |  | ✓ |  | ✓ | 5 |
| `input[type="range"]` | ✓ | ✓ | ✓ |  |  |  | ✓ | ✓ | 5 |
| Date input | ✓ |  | ✓ |  | ✓ |  | ✓ |  | 4 |
| `input[type="file"]` |  |  | ✓ |  | ✓ |  | ✓ | ✓ | 4 |
| `small` |  |  | ✓ |  |  | ✓ |  | ✓ | 3 |
| `input[type="search"]` | ~ | ~ | ✓ |  |  | ~ | ~ |  | 1 (+4 ~) |
| `mark` |  |  | ✓ |  |  |  |  | ✓ | 2 |
| `sup` / `sub` |  |  | ✓ |  |  |  |  | ✓ | 2 |
| `abbr` |  |  | ✓ |  |  |  |  | ✓ | 2 |
| `video` |  |  |  | ✓ |  |  |  |  | 1 |
| `hgroup` |  |  | ✓ |  |  |  |  |  | 1 |
| `del` / `ins` |  |  | ✓ |  |  |  |  |  | 1 |
| `output` |  |  |  |  |  |  |  | ✓ | 1 |
| `meter` |  |  |  |  |  |  |  |  | 0 |

Sources for each column:

- **shadcn/ui** component index lists Dialog, Alert Dialog, Progress, Switch, Kbd, Slider, Date Picker, Calendar, Navigation Menu, Sidebar, Code Block and Input Group ([components](https://ui.shadcn.com/docs/components)).
- **Radix Themes** ships CSS for `dialog`, `alert-dialog`, `progress`, `switch`, `kbd`, `slider`, `data-list`, `tab-nav`, `text-field`, `code`, `strong`, `em` and `quote` ([component source](https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes/src/components), [Kbd](https://www.radix-ui.com/themes/docs/components/kbd), [Switch](https://www.radix-ui.com/themes/docs/components/switch)).
- **Pico CSS** is class-light, so its selectors show what a site gets by default: `small`, `kbd`, `samp`, `pre`, `sub`, `sup`, `hgroup`, `mark`, `abbr[title]`, `ins`, `del`, `dialog`, `progress`, `nav`, `[role=switch]`, `[type=search]` and the date, time, file, range and colour inputs ([SCSS source](https://github.com/picocss/pico/tree/main/scss), [compiled CSS](https://github.com/picocss/pico/blob/main/css/pico.css)). Pico also styles `small` placed after an input as helper text.
- **Tailwind Typography** `prose` styles `kbd`, `strong`, `pre`, `dl`, `dt`, `dd`, `video`, `picture`, table parts and a `lead` class, plus the core set. It does not style `mark`, `sup`, `abbr` or `small` ([styles.js](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js)).
- **GOV.UK Design System** ships Date input, File upload, Summary list (`dl`), Service navigation, Breadcrumbs and Pagination. It has no modal, progress bar or switch ([components](https://design-system.service.gov.uk/components/), [Date input](https://design-system.service.gov.uk/components/date-input/), [Summary list](https://design-system.service.gov.uk/components/summary-list/)).
- **Primer** ships Dialog, ProgressBar, ToggleSwitch, KeybindingHint, NavList, UnderlineNav and Breadcrumbs ([components](https://primer.style/product/components/)). Primer CSS base styles `kbd`, `small`, `samp`, `dd` and `pre` ([base](https://github.com/primer/css/tree/main/src/base), [markdown](https://github.com/primer/css/tree/main/src/markdown)).
- **Polaris** ships Modal, ProgressBar, SettingToggle, KeyboardKey, DatePicker, RangeSlider, DropZone, DescriptionList, InlineCode and Navigation ([Polaris React components](https://github.com/Shopify/polaris/tree/main/polaris-react/src/components)).
- **Bootstrap 5.3 Reboot** sets defaults for `small`, `mark`, `sub`, `sup`, `abbr[title]`, `kbd`, `pre`, `dl`/`dt`/`dd`, `output`, `progress`, `legend`, `summary` and `address` ([_reboot.scss v5.3.3](https://github.com/twbs/bootstrap/blob/v5.3.3/scss/_reboot.scss)). Its documented components add modal, progress, `.form-switch`, `.form-range` and navbar.
- **Tailwind Preflight** resets `small`, `sub`, `sup`, `abbr`, `kbd`, `samp`, `progress` and `summary` only so that they behave consistently ([preflight.css](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/preflight.css)). This shows the elements are common enough to need normalising; it is not a design decision.

## Evidence: Mobbin samples

### SaaS (web screens)

| Query | Pattern seen | Hits | Examples |
| --- | --- | :-: | --- |
| Settings with toggles | Switch rows with label and helper text | 8/8 | [Linear](https://mobbin.com/screens/9ac66835-aa7f-469f-ace3-a915c2cf2dfd), [Braintrust](https://mobbin.com/screens/12f141bb-d3ff-4d6f-b6cb-0df4cc845489), [Buffer](https://mobbin.com/screens/4b741547-5691-479c-a314-e484131f7426), [AutoSend](https://mobbin.com/screens/077bb3e4-4a9f-4c48-85d9-7bf76468a9d1), [GoFundMe](https://mobbin.com/screens/9b72518f-1170-41cc-acb1-bf7ed295d699), [Tally](https://mobbin.com/screens/e6853fab-d536-46f1-8f9d-3212dbf4f00a) |
| Confirm-delete | Centred modal dialog with destructive action | 8/8 | [Sketch](https://mobbin.com/screens/c64becfa-d36e-4be9-b74a-342965be0ce9), [Confluence](https://mobbin.com/screens/9397516f-86dd-4e08-a710-a6af935a7979), [AirOps](https://mobbin.com/screens/f374a23a-b488-4cd8-9ab6-c6d0f62ab38f), [Frame.io](https://mobbin.com/screens/87062932-4343-411c-b78f-7512acfa865f), [Arcade](https://mobbin.com/screens/aeee71f4-792b-4f14-a8df-76f77d61d0df) |
| Billing usage | Quota bars (meter by meaning), some with over-limit colour | 7/8 | [Mintlify](https://mobbin.com/screens/bace818b-24f4-4136-9a81-b3d176d1556a), [Rox](https://mobbin.com/screens/c259bb12-d530-49cb-8eb9-ccf9bf520221), [OpenAI Platform](https://mobbin.com/screens/6106355f-36d9-41b0-b961-ef1bc0760c2d), [Cursor](https://mobbin.com/screens/77cb9e3b-d6d4-4780-ae58-d1cb1ffcab4f), [Hume AI](https://mobbin.com/screens/15e5c41b-1b46-41ff-b6dd-ed7e89dafec5) |
| Keyboard shortcuts | Key caps (`kbd`), usually inside a dialog | 6/6 | [Relume](https://mobbin.com/screens/d6b809da-7f84-4812-be03-d0b61decff90), [Amie](https://mobbin.com/screens/bd60d05d-f8f8-4a5f-801b-533c35f06c9f), [Frame.io](https://mobbin.com/screens/7bf0c9af-dd42-4511-a35e-15e097df461b), [Webflow](https://mobbin.com/screens/be7bebfe-053c-42e2-a67c-9e79073b0d83) |
| Onboarding | Step progress bar | 6/6 | [Kajabi](https://mobbin.com/screens/a41f50c5-bffd-4bb8-b861-15f5f782f351), [Uxcel](https://mobbin.com/screens/48c6305c-7d64-4c09-bd60-801739292799), [Brilliant](https://mobbin.com/screens/9cab4b13-c342-47f7-adda-0b953e1ffc89), [YNAB](https://mobbin.com/screens/185b2a7b-d0f1-4671-b6cd-6ae0af31fd85) |
| Date-range filter | Typed start/end date fields beside a custom calendar | 6/6 | [Fresha](https://mobbin.com/screens/50d5dfaf-f397-40fc-94a6-03ee0a67fb1b), [Vimeo](https://mobbin.com/screens/3de2cbeb-e6c0-42c4-a0c9-9123a6147b0c), [Bonsai](https://mobbin.com/screens/f125e2a9-0a14-4903-a8f8-ad720a62473d), [Origin](https://mobbin.com/screens/77f87b26-6d67-4706-89eb-25493b268102) |

Patterns seen incidentally across all 42 SaaS screens:

- a sidebar or top `nav` in most screens;
- a search field in 12, often with a `⌘K` or `⌘P` `kbd` hint ([Supabase](https://mobbin.com/screens/85ee2458-092c-4d14-8007-1dcdabc74c03), [Databricks](https://mobbin.com/screens/11bde50c-a35a-479b-b234-f80df7e50cec));
- small muted helper text under almost every setting label;
- key–value rows ("Included Credits / 10,000") in usage panels.

### Marketing (web sections)

| Query | Pattern seen | Hits | Examples |
| --- | --- | :-: | --- |
| Header navigation | Horizontal `nav` with links, dropdown triggers and a CTA button | 6/6 | [Maze](https://mobbin.com/sites/sections/0422d28b-b36f-4def-8590-f57fc5812131), [AngelList](https://mobbin.com/sites/sections/df6f47be-606e-488d-b2c9-a3fe010d35b9), [Apollo](https://mobbin.com/sites/sections/4d366142-c589-48aa-b120-9f2aa850d995) |
| Pricing | Small unit and fine-print text ("/month", "Billed annually") | 8/8 | [Height](https://mobbin.com/sites/sections/1974c03f-c0ff-4f8e-ae30-250355677442), [Cursor](https://mobbin.com/sites/sections/32775893-d17d-4162-a2a8-bc5054fbe3e7), [Assembly](https://mobbin.com/sites/sections/d85b73b7-54b8-4133-8aca-0c8781651569) |
| Pricing | Monthly/yearly toggle (segmented control, sometimes a switch) | 4/8 | [Epidemic Sound](https://mobbin.com/sites/sections/2e9b00d8-3046-4435-b50d-877c5202d58d), [Hashnode](https://mobbin.com/sites/sections/95a4a75e-0e0e-496e-a163-2d2e750785aa), [Assembly](https://mobbin.com/sites/sections/d85b73b7-54b8-4133-8aca-0c8781651569), [Cursor](https://mobbin.com/sites/sections/32775893-d17d-4162-a2a8-bc5054fbe3e7) |
| Pricing | Eyebrow or badge beside a heading ("Most popular", "BASIC") | 4/8 | [Tines](https://mobbin.com/sites/sections/df8da153-7a8d-45c0-a894-47c0a1abb090), [Hashnode](https://mobbin.com/sites/sections/95a4a75e-0e0e-496e-a163-2d2e750785aa) |
| Pricing | Superscript cents (`sup`) | 1/8 | [Epidemic Sound](https://mobbin.com/sites/sections/2e9b00d8-3046-4435-b50d-877c5202d58d) |
| FAQ | Disclosure list (`details`/`summary`, already core) | 3/6 | [Notion](https://mobbin.com/sites/sections/6c304a17-56d1-4f33-9818-d6cd696d2d1d), [Frontify](https://mobbin.com/sites/sections/d6c24906-086c-425a-812e-40978ca0f4a2), [Readymag](https://mobbin.com/sites/sections/c9d4e91b-98a6-4405-b0a6-ab4c41b9fe5c) |

Marketing pages lean almost entirely on the core set, plus `nav`, `small` and heading groups. The SaaS-only additions (dialog, switch, progress, meter, kbd, search and date fields) rarely appear on them.

## Notes for the map

- **Switch has no entry.** The native `switch` attribute on `input[type="checkbox"]` is experimental, and unsupported browsers ignore it ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox)). Pico uses `role="switch"` on a checkbox instead. The lowest-risk path is a switch variant of the existing Draft `input-checkbox` entry rather than a new Element. This needs a decision under #72.
- **Meter and progress should share one look.** Every SaaS sample that showed quota usage drew it like a progress bar. Showing `progress` and `meter` together in one "Indicators" combination keeps them consistent and makes the difference between the two clear.
- **`nav` is a combination, not a single style.** Every system styles navigation through `ul`, `a` and a current-page state rather than the `nav` box itself. That fits #72's "combination first" rule.
- **Several frequent patterns are Components, not Elements.** Badges or tags, tooltips, toasts, tabs, segmented controls, avatars, skeletons, spinners, breadcrumbs, pagination, cards and calendar popovers appear in most systems and in most Mobbin samples. They belong under Component Guidance, so they stay out of the Element Overview.
- **Already Active, so cheap to add.** `dialog`, `kbd`, `small`, `dl`/`dt`/`dd`, `input-search`, the date inputs, `pre`, `mark` and `abbr` already have Active Treatments. Adding them to the overview is only a layout decision. `progress` and `input-range` are Draft. `meter`, `nav`, `input-file` and `video` are Native.
- **Missing from the inventory:** a switch variant, `sup`, `sub`, `del`, `ins`, `s`, `hgroup` and `samp`. Only the switch has a strong signal.
