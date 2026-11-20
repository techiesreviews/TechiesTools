# Further Elements shortlist

Research date: 2026-11-20

A ranked list of Elements, beyond the core families in the [gap checklist](element-default-styles-gap-checklist.md), that SaaS and marketing sites style by default, with how common each one is. This is evidence for choosing what to add next (TOOLS-74, used by TOOLS-82); it does not decide anything.

## Method

- **Products:** 58 web screens from Mobbin, from six searches: documentation pages, account settings forms, pricing and FAQ pages, blog articles, data tables, and marketing footers and sign-up pages. About 45 different products, including Stripe, Plane, Mintlify, Klaviyo, Customer.io, Sprig, Snowflake, Remote, Square, Gumloop, Dribbble, Xero, Etsy, Meetup, GetYourGuide, H&M and The New York Times. A screen counts when the Element is visible and clearly styled beyond the browser default. Counts are by eye and approximate; the searches favour app screens, so app-shell Elements (navigation, search) are over-represented compared with pure marketing pages.
- **Systems:** the same six design systems and baselines as the gap checklist (Tailwind Typography 0.5.16, Pico CSS 2.1.1, Open Props 1.7.16, Radix Themes 3.2.1, GOV.UK Frontend 5.11.0, shadcn/ui new-york-v4). A system counts when it ships a default style or a named component for the Element.
- **Ranking:** by product count first, then system count. "Kind" says whether a Treatment Definition can carry it today, or whether it needs a Pattern (extra markup, script, or CSS the contract bans).

## Ranked shortlist

| Rank | Element | Products (of 58) | Systems (of 6) | Covered today | Kind |
| --- | --- | --- | --- | --- | --- |
| 1 | Navigation links and lists: `nav` with an unmarked `ul`, current item via `a[aria-current]` | about 35 | 4 (Pico, GOV.UK, shadcn, Radix) | Partly: `aria-current` adds an underline | Element treatment |
| 2 | Icon-only button: `button` holding only an icon, named by `aria-label` | about 30 | 2 (shadcn, Radix) | No | Element treatment (variant) |
| 3 | Search field: `input[type="search"]` | about 24 | 2 (Pico, Radix) | Partly: same as a text input | Element treatment (variant) |
| 4 | Badge or status label: no native Element, usually `span` | about 21 | 3 (shadcn, Radix, GOV.UK) | No | Pattern |
| 5 | Avatar: round `img` | about 18 | 2 (shadcn, Radix) | No | Element treatment (variant) |
| 6 | Field helper and error text: `small` or `p` linked with `aria-describedby` | about 15 helper, 1 error | 4 (GOV.UK, shadcn, Pico, Radix) | No | Element treatment |
| 7 | Callout or note: `aside` or `role="note"` | about 6 | 3 (Radix, shadcn, GOV.UK) | No | Element treatment or Pattern |
| 8 | Switch: checkbox with `role="switch"` (or the `switch` attribute) | about 6, plus 4 segmented toggles | 3 (Pico, shadcn, Radix) | Accent colour only | Pattern |
| 9 | Tabs: `role="tablist"` | about 6 | 3 (shadcn, Radix, GOV.UK) | No | Pattern |
| 10 | Breadcrumb: `nav` with an `ol` | about 5 | 3 (Pico, GOV.UK, shadcn) | No | Element treatment |
| 11 | Pagination: `nav` with page links | about 4 | 2 (shadcn, GOV.UK) | No | Pattern |
| 12 | Dialog backdrop: `dialog::backdrop` | 3 (every modal screen) | 4 (Pico, Radix, shadcn, Open Props) | No (`dialog` is treated, its backdrop is not) | Element treatment |
| 13 | Progress and meter: `progress`, `meter` | about 3 | 3 (Pico, Radix, shadcn) | Accent colour only on `progress` | Element treatment |
| 14 | Keyboard hint: `kbd` | about 6 | 5 (Tailwind, Pico, Open Props, Radix, shadcn) | Yes | Already treated |
| 15 | Edits and small print: `del`, `ins`, `sup` | 0 seen | 1 (Open Props) | No | Low priority |

## Notes per item

1. **Navigation.** Nearly every app screen has a sidebar or top bar of links with no list markers and a highlighted current item. Products mark the current item with a tinted background pill ([Stripe](https://mobbin.com/screens/ab9ed449-1e64-4dbe-8be4-b98b53831762), [Sprig](https://mobbin.com/screens/2bff8b12-5311-460e-aa87-7034c579e7bd), [Magnific](https://mobbin.com/screens/f8e0f368-7645-45a2-888c-287df1eaf87f)) more often than an underline ([Unify](https://mobbin.com/screens/77da0e6d-c3e4-42b9-8828-72da1636974b), [The New York Times](https://mobbin.com/screens/be94f2e1-e50f-43ca-bc20-eaa938f1e57b)). Footer link lists are the same Element with muted small links ([Meetup](https://mobbin.com/screens/d1846133-67f8-40f6-bb99-956fc2e3273c), [Dropbox Dash](https://mobbin.com/screens/e1fe4ed5-8c62-49bc-b5fb-c9e1768cde88)).
2. **Icon-only button.** The "more", close and copy buttons on almost every screen. They need a square size with a tap target, a quiet look and a visible focus ring. Both shadcn (`size="icon"`) and Radix (`IconButton`) ship one.
3. **Search field.** Usually a search icon at the start, a muted placeholder, often a tinted background or pill shape, and a shortcut hint at the end ([Plane](https://mobbin.com/screens/d33456c2-9ade-41cc-9839-05490de1b705), [Remote](https://mobbin.com/screens/348b0921-8f11-4ed0-9ef5-14c91f197c3f)). Pico rounds `input[type="search"]` and adds an icon by default; the icon needs a background image, which the contract should be checked for.
4. **Badge.** Status pills in tables ([Snowflake](https://mobbin.com/screens/8439d88b-17ea-4d9a-bdf0-0ea02f868c7a), [Square](https://mobbin.com/screens/85857182-8f04-4314-b06e-29df202cf84a), [Gumloop](https://mobbin.com/screens/b191aef1-ec44-48ac-ad7f-c76673fed6f5)) and "Most popular" or "New" labels on pricing and navigation ([WeTransfer](https://mobbin.com/screens/0b587876-1c2b-4f34-a2fc-ba1d0aadc3d9), [Dribbble](https://mobbin.com/screens/85a3f552-3606-4115-823c-19cb84b67968)). HTML has no badge Element, so this belongs in a Pattern with success, warning, danger and neutral tones, which in turn need semantic roles the token set lacks.
5. **Avatar.** Round profile images in headers, tables and settings, often with an initials fallback. The image part is an `img` variant (full radius, fixed square size, cover fit); the initials fallback needs a Pattern.
6. **Helper and error text.** A muted line under the label or field is on almost every settings and sign-up screen ([Descript](https://mobbin.com/screens/7d4a4d58-7337-48f8-955d-b4d022fc243b), [SchoolAI](https://mobbin.com/screens/652fa1be-9e1d-4ff6-9141-6a20d3c6c62b)); an error line in the danger colour appears when a field is invalid ([Customer.io](https://mobbin.com/screens/662265b2-3db3-4bf0-8e4a-519ef915e1e6)). Both depend on the muted and danger roles named in the gap checklist.
7. **Callout.** A tinted panel with a start border for notes and warnings in documentation ([AirOps](https://mobbin.com/screens/a160611c-6fec-46bc-88c1-4aff9898cd36)) and banners in apps. GOV.UK inset text and warning text, Radix Callout and shadcn Alert are the references.
8. **Switch.** Settings screens use switches for on and off preferences ([Descript](https://mobbin.com/screens/7d4a4d58-7337-48f8-955d-b4d022fc243b), [SchoolAI](https://mobbin.com/screens/652fa1be-9e1d-4ff6-9141-6a20d3c6c62b)); pricing pages use a two-option segmented toggle for monthly and yearly ([Xero](https://mobbin.com/screens/b201eabd-5bf5-4cf8-bd64-26f32a6641c0), [Searchable](https://mobbin.com/screens/b1adc6ce-2612-4c64-b882-5a18685b7246)). Drawing a switch needs `appearance: none` and pseudo-elements, which the contract bans, so it is a Pattern; Safari's native `switch` attribute on checkboxes is the only Native Fallback today.
9. **Tabs.** Settings and detail pages ([Klaviyo](https://mobbin.com/screens/65fd82ba-c694-45e0-8096-4302c9a05b4b), [Snowflake](https://mobbin.com/screens/8439d88b-17ea-4d9a-bdf0-0ea02f868c7a)). Tabs need script for keyboard behaviour, so they wait for a behaviour contract, as the [pattern library note](pattern-library-candidates.md) says.
10. **Breadcrumb.** Document and settings headers ([Productboard](https://mobbin.com/screens/a4441f9c-a657-45a0-8e01-1fd1bbc9d35a), [Customer.io](https://mobbin.com/screens/662265b2-3db3-4bf0-8e4a-519ef915e1e6)). An inline unmarked `ol` with separators; the separator character needs pseudo-element content, so a plain version (inline items, muted links, current page as text) fits the contract and the separator does not.
11. **Pagination.** Below data tables ([Stripe](https://mobbin.com/screens/ab9ed449-1e64-4dbe-8be4-b98b53831762), [Remote](https://mobbin.com/screens/348b0921-8f11-4ed0-9ef5-14c91f197c3f), [Browserbase](https://mobbin.com/screens/f2788484-2372-4307-9621-8e7037c0c633)): a range label plus previous and next buttons. Mostly composed from buttons, so a Pattern.
12. **Dialog backdrop.** Every modal settings screen dims the page behind it ([Searchable](https://mobbin.com/screens/56b69c7d-3f26-4d19-b449-b7cd0ef614b5), [Descript](https://mobbin.com/screens/7d4a4d58-7337-48f8-955d-b4d022fc243b), [Perplexity](https://mobbin.com/screens/4ba28230-49f3-46bb-8fa4-7a36dfd3ca36)). The contract already allows `::backdrop`; it is unused.
13. **Progress and meter.** Setup progress and usage bars in app sidebars ([Square](https://mobbin.com/screens/85857182-8f04-4314-b06e-29df202cf84a), [Snowflake](https://mobbin.com/screens/620c1b18-a8ab-453e-a652-1ad8aa1c2749), [Contra](https://mobbin.com/screens/1cfaaba0-c38b-4145-b1a1-8f32dbb6f606)). Beyond `accent-color`, styling the bar parts needs vendor pseudo-elements, so accent colour plus size may be the realistic limit.
14. **Keyboard hint.** Already treated; the gap checklist covers its details.
15. **Edits and small print.** Not seen in the sample; Open Props colours `del` and `ins`. Keep for later.

## Left out on purpose

- **Toasts.** Seen on 5 of 58 screens, but the house rules say no toasts: state shows on the control itself.
- **Tooltips.** Need script and positioning; not an Element treatment.
- **Select, checkbox and radio.** Core form fields; covered in the gap checklist.

## Suggested next step

The items that fit a Treatment Definition today and appear most often are navigation (1), the icon-only button (2), the search field (3), the avatar image (5), helper and error text (6) and the dialog backdrop (12). Items 6 and most of 1 and 3 depend on the muted, subtle surface and danger roles, so the token decision in the gap checklist comes first. Badges, switches, tabs and pagination belong with Patterns.
