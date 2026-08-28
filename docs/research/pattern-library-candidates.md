# Pattern library candidates

Research date: 2026-08-29

## Recommendation

Build original Techies patterns from common interface problems, semantic HTML, and Framework tokens. Use Brixies as evidence that marketing-section categories are useful, but do not copy its layouts, markup, CSS, images, names, or paid files.

Brixies is the Bricks Builder product the user meant: its official site describes a collection of WordPress design blocks and templates, and its public library lists more than 900 layouts across Hero, Feature, CTA, FAQ, Pricing, Process, Testimonial, Timeline, Logo, Contact, Blog, and other categories ([Brixies resources](https://brixies.co/resources/)). The license is not suitable as an implementation source for this product. Although the terms mention GPL 2.0-or-later, they also explicitly prohibit redistribution, replication, and creating a similar or competing product ([Brixies terms](https://brixies.co/terms-conditions/)). Treat the prohibition as controlling unless counsel resolves the conflict.

The safer implementation references are first-party, accessible design systems. GOV.UK states that its component code is MIT-licensed ([GOV.UK components](https://design-system.service.gov.uk/components/)). USWDS publishes its component library as open source and documents how federal public-domain work and third-party open-source licenses coexist ([USWDS repository](https://github.com/uswds/uswds), [USWDS open-source policy](https://designsystem.digital.gov/about/website-policies-notices/)). W3C publishes semantic examples and accessibility considerations in its own design system ([W3C components](https://design-system.w3.org/components/)). Even with those sources, Techies should independently author its HTML and CSS, use original content and visuals, and cite inspiration in this note rather than shipping a visual clone.

## Contract fit

The current `PatternDefinition` works best for a static, semantic composition:

- `html` owns trusted structure and sample content;
- `selector` and `defaultCss` own editable declarations on one root class;
- `supportCss` owns descendant, responsive, and state styling;
- `controls` modify root declarations;
- `previewScale` makes large sections fit the catalog.

For descendant settings, controls should set CSS custom properties on the root and `supportCss` should consume them. Example: a `media-position` control changes `--pattern-media-order`, while descendant CSS uses `order: var(--pattern-media-order)`. This avoids extending the contract for each layout.

The current contract does **not** describe JavaScript, ARIA state transitions, focus management, content fields, repeated-item data, or structural markup variants. Patterns requiring those capabilities should wait for a versioned behavior/content contract rather than hiding imperative code in `supportCss` or hard-coding inaccessible demos.

Catalog cards should expose a real, descriptive title link and stretch that link's pseudo-element across the card. Do not use an empty overlay anchor or wrap the entire card in one link. This preserves a useful accessible name while keeping the full card hit area, following the structure used by the [W3C card component](https://design-system.w3.org/components/cards.html).

## Priority 1 — build next

These are high-value, mostly CSS-only composites. They exercise Framework color, typography, spacing, radius, and responsive layout without requiring a behavior contract.

### 1. Split hero (`split-hero`)

- **Source signal:** Brixies lists 106 Hero layouts; W3C's official Hero pairs a page heading and lead with a decorative image ([Brixies resources](https://brixies.co/resources/), [W3C Hero](https://design-system.w3.org/components/hero.html)).
- **Definition mapping:** semantic `<section>` with heading, lead, action group, and optional `<figure>`; root grid declarations in `defaultCss`; descendants and container query in `supportCss`.
- **Settings:** media side, alignment, content width, surface tone, vertical spacing, action layout.
- **Care:** preserve one logical heading order when visually reversing media; decorative media needs empty `alt`, informative media needs useful `alt`; links and buttons must retain their correct semantics.

### 2. Feature grid (`feature-grid`)

- **Source signal:** Brixies lists 114–115 Feature layouts; W3C's Crosslinks composes an intro with a responsive list of cards ([Brixies resources](https://brixies.co/resources/), [W3C Crosslinks](https://design-system.w3.org/components/crosslinks.html)).
- **Definition mapping:** `<section>` plus `<ul>` of feature items; root controls expose `--feature-columns`, gap, alignment, and surface; `supportCss` styles the item children.
- **Settings:** two/three/four columns, icon treatment, card/no-card surface, density, text alignment.
- **Care:** keep the DOM a list; icons require accessible names only when informative; avoid equal-height CSS that clips enlarged text.

### 3. Call-to-action band (`cta-band`)

- **Source signal:** Brixies lists 52 CTA layouts; W3C's Fifty-fifty component demonstrates a heading, body, optional primary action, and optional secondary link in a responsive section ([Brixies resources](https://brixies.co/resources/), [W3C Fifty-fifty](https://design-system.w3.org/components/fifty-fifty.html)).
- **Definition mapping:** compact `<section>` with heading, paragraph, and action group; excellent one-root declaration fit.
- **Settings:** inline/stacked layout, alignment, emphasis tone, width, padding, radius.
- **Care:** do not use a link styled as a button for an in-page action; maintain contrast when switching emphasis tones.

### 4. Testimonial quote (`testimonial`)

- **Source signal:** Brixies lists 55 Testimonial layouts; W3C uses semantic `<blockquote>` and a source footer for its Quote component ([Brixies resources](https://brixies.co/resources/), [W3C Quote](https://design-system.w3.org/components/quote.html)).
- **Definition mapping:** `<figure>` or `<blockquote>` with quote and `<figcaption>`/footer; root controls set measure, accent, padding, and quote-mark treatment.
- **Settings:** centered/left alignment, bordered/surface treatment, compact/editorial density, avatar visibility as a future content option.
- **Care:** do not misuse `<cite>` for a person's name; use the blockquote `cite` attribute only for a source URL. Avoid decorative quote marks being announced.

### 5. Logo cloud (`logo-cloud`)

- **Source signal:** Brixies lists 22 Logo Sections ([Brixies resources](https://brixies.co/resources/)).
- **Definition mapping:** labelled `<section>` with a `<ul>` of logos; CSS Grid in `supportCss`; root custom properties control minimum logo width, gap, and opacity.
- **Settings:** columns, monochrome/full-color treatment, spacing, surface, label alignment.
- **Care:** logos representing named organizations need meaningful alternative text; linked logos need descriptive accessible names; original placeholder marks must be created rather than copied from Brixies.

### 6. Pricing cards (`pricing-grid`)

- **Source signal:** Brixies lists 36–37 Pricing layouts ([Brixies resources](https://brixies.co/resources/)).
- **Definition mapping:** labelled `<section>` with a list of `<article>` plans, price data, feature lists, and links; root controls drive columns and featured-plan emphasis.
- **Settings:** plan count preview, equal/featured emphasis, compact/comfortable density, billing suffix presentation, action width.
- **Care:** do not encode plan meaning by color alone; featured labels need text; prices need clear currency and billing period; DOM order must remain sensible when a featured card is visually raised.

### 7. FAQ disclosures (`faq-list`)

- **Source signal:** Brixies lists 19 FAQ layouts; W3C documents collapsible containers; GOV.UK warns that hidden content can be missed and recommends accordions only when evidence supports them ([Brixies resources](https://brixies.co/resources/), [W3C collapsible containers](https://design-system.w3.org/components/collapsible-containers.html), [GOV.UK Accordion](https://design-system.service.gov.uk/components/accordion/)).
- **Definition mapping:** use native `<details><summary>` for a no-JS first version. Root variables control separators, spacing, marker, and surface; descendant styles live in `supportCss`.
- **Settings:** divided/contained treatment, single-column width, density, initially open sample.
- **Care:** if later changed to a custom accordion, it needs buttons, `aria-expanded`, `aria-controls`, keyboard behavior, and state synchronization defined by the WAI-ARIA pattern ([WAI Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)). Structural open state should not be faked by CSS-only settings.

### 8. Process steps (`process-list`)

- **Source signal:** Brixies lists 35 Process layouts and 16 Timeline layouts. USWDS defines a process list for high-level sequential steps and recommends three to ten steps plus correct semantic heading levels ([Brixies resources](https://brixies.co/resources/), [USWDS Process list](https://designsystem.digital.gov/components/process-list/)).
- **Definition mapping:** `<ol>` containing short headings and descriptions; counters and connector lines in `supportCss`; root properties control orientation and marker treatment.
- **Settings:** vertical/horizontal at wide sizes, numbered/plain markers, connector style, density, alignment.
- **Care:** retain `<ol>` semantics and logical order; horizontal presentation must collapse without horizontal scrolling; heading levels depend on embedding context.

## Priority 2 — useful follow-ups

These remain practical with the present contract, but overlap more with page-level composition or need careful content decisions.

### 9. Related-content rail (`related-content`)

- **Source signal:** W3C's Crosslinks is explicitly a “You may also like” composition built from an aside, intro, and linked card list ([W3C Crosslinks](https://design-system.w3.org/components/crosslinks.html)).
- **Definition mapping:** `<aside aria-labelledby>` with `<ul>` and article links; root controls set columns, media ratio, and separation.
- **Settings:** article count preview, media/no-media, columns, surface, card treatment.
- **Care:** use a heading that labels the complementary landmark; avoid nested links; ensure the stretched-link implementation does not cover secondary controls.

### 10. Stat band (`stat-band`)

- **Source signal:** This is a restrained original composition adjacent to Brixies' marketing Feature and Content section taxonomy, not a replica ([Brixies resources](https://brixies.co/resources/)).
- **Definition mapping:** labelled `<section>` with a `<dl>` for metric/value pairs; direct fit for root grid, typography, separator, and surface controls.
- **Settings:** columns, emphasis size, separators, alignment, compact/comfortable spacing.
- **Care:** use `<dl>` only when each number is genuinely described by its label; units and qualifiers cannot rely on typography alone.

### 11. Contact split (`contact-panel`)

- **Source signal:** Brixies lists 36 Contact Sections; W3C's Fifty-fifty composition supplies a sound responsive split-layout reference ([Brixies resources](https://brixies.co/resources/), [W3C Fifty-fifty](https://design-system.w3.org/components/fifty-fifty.html)).
- **Definition mapping:** `<section>` with contact details and a small semantic `<form>`; root custom properties control proportions, order, and density.
- **Settings:** form side, stacked/split layout, surface treatment, field spacing, action alignment.
- **Care:** every input needs a visible label; errors need programmatic association; a production form needs submission, validation, privacy, and anti-spam behavior outside the current Pattern contract. Initial Pattern should clearly be presentation-only.

### 12. Summary list (`summary-list`)

- **Source signal:** GOV.UK recommends a `<dl>` for key/value facts and explicitly advises tables, ordered lists, or unordered lists for other relationships ([GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/)).
- **Definition mapping:** `<dl>` rows with optional action links; root variables control key width, row gap, separators, and density.
- **Settings:** stacked/split keys, bordered/borderless, density, action alignment.
- **Care:** action links need contextual accessible names such as “Change address”; row borders aid scanning and zoom users, so borderless should not be the default.

### 13. Pagination (`pagination`)

- **Source signal:** W3C uses a labelled `<nav>`, a list of links, and `aria-current="page"` on the current page ([W3C Pagination](https://design-system.w3.org/components/pagination.html)).
- **Definition mapping:** compact navigation composition; root controls set alignment, gap, and link surface/radius.
- **Settings:** simple/full page range, centered/start alignment, bordered/plain links, density.
- **Care:** current-page state is content/markup, not styling; ellipses must not be empty links; previous/next labels need understandable destinations.

### 14. Data comparison table (`comparison-table`)

- **Source signal:** GOV.UK distinguishes tabular relationships from key/value summary lists and directs authors to use a table for tabular data ([GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/)).
- **Definition mapping:** `<table>` with `<caption>`, column headers, and row headers; root wrapper declarations control overflow and density; cell styling in `supportCss`.
- **Settings:** striped/plain rows, compact/comfortable density, sticky first column, emphasis column.
- **Care:** header associations must remain correct; horizontal overflow needs an accessible scroll region; sticky columns and emphasis cannot obscure focus or content at zoom.

## Priority 3 — defer until behavior is first-class

### 15. Testimonial carousel (`testimonial-carousel`)

- **Source signal:** W3C progressively enhances an unordered list of semantic quote slides with JavaScript ([W3C Content slider](https://design-system.w3.org/components/slider.html)).
- **Definition mapping:** the static list can be represented now, but a functioning carousel cannot. It needs a behavior module, runtime state, controls, and accessibility tests beyond `html`, `defaultCss`, and `supportCss`.
- **Future settings:** visible slides, transition, controls position, auto-rotation disabled by default.
- **Care:** the WAI-ARIA carousel pattern requires meaningful labelling, previous/next controls, correctly hidden inactive slides, and—if auto-rotation exists—a stop/start control plus pause on focus and hover ([WAI Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)). Recommend no auto-rotation. Do not ship this until `PatternDefinition` gains an explicit, testable behavior contract.

## Deliberate exclusions

Do not prioritize Brixies-style mega menus, off-canvas panels, popups, checkout flows, or dashboards yet. They are not merely CSS compositions: they own navigation state, focus movement, dismissal, validation, or whole-page information architecture. A modal, for example, must trap focus, close with Escape, restore focus, mark background content inert, and expose a labelled dialog ([WAI Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)). The present Pattern contract cannot guarantee those behaviors.

Do not add more primitive Button or Badge variants as “patterns.” In the repository language, those belong in Element Guidance or Component Guidance. Pattern library growth should focus on useful compositions that demonstrate how Framework preferences work together.

## Suggested build order

1. `split-hero`
2. `feature-grid`
3. `cta-band`
4. `testimonial`
5. `logo-cloud`
6. `pricing-grid`
7. `faq-list` using native details/summary
8. `process-list`
9. `related-content`
10. `stat-band`

This sequence starts with six purely presentational patterns, adds one native interactive pattern, then expands into larger compositions. It also creates reusable control vocabulary: alignment, density, emphasis, columns, media position, and surface tone.
