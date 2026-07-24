# Element Guidance

Element Guidance teaches generative agents how and when to use semantic HTML according to the Framework owner's preferences. It is prescriptive by default: ordinary generation follows the recorded treatment, while alternatives require an explicitly requested Exploration.

## Entry schema

Every Element Guidance entry documents:

1. **Purpose** — the semantic job the element performs.
2. **Default Treatment** — the preferred visual and behavioral treatment.
3. **Allowed variants** — named departures that remain within the Framework.
4. **Content constraints** — suitable content, hierarchy, length, and nesting.
5. **Accessibility behavior** — keyboard, focus, naming, contrast, and assistive-technology expectations.
6. **Do / avoid** — concrete preferred and prohibited usage.
7. **Live example** — the treatment rendered from current Framework values.
8. **Semantic HTML** — minimal markup showing intended structure without presentation-only wrappers.

### Entry lifecycle

Treatment Version supplies the visible lifecycle label:

- `0.0.0` — Native. The browser fallback remains authoritative and no Treatment CSS is exported.
- `0.x.x` — Draft. The Treatment is visible for authoring and app review but excluded from portable export.
- `1.0.0` or later — Active only when a source-controlled intent module provides its valid Treatment Definition and Activation Evidence records passing Definition, Baseline, native-behavior, keyboard, focus, and parity checks.

A stable version without complete Activation Evidence is invalid authoring and blocks Element output until repaired. `deprecated` is an independent indicator and never activates a Treatment. Valid elements relying on Native Fallback use `0.0.0`. Draft or incomplete guidance must never appear as stable preference in ordinary Context Export.

### Variant selection

Every entry with variants names one `defaultVariant`. Each non-default variant documents the situation in which it is appropriate. Generative agents use the default when no contextual rule selects another variant, choose alternatives only when their documented use case matches, and never randomize variants. Explicit Explorations may compare variants without promoting them.

## Organization

Element Guidance is grouped by user intent rather than alphabetically:

1. **Structure** — page regions, grouping, and document hierarchy.
2. **Typography** — headings, paragraphs, inline meaning, quotations, and code.
3. **Lists** — ordered, unordered, and descriptive collections.
4. **Actions** — links, buttons, and action relationships.
5. **Media** — images, figures, captions, audio, and video.
6. **Data** — tables and machine-readable values.
7. **Forms** — labels, inputs, selection, validation, and submission.
8. **Disclosure and dialogs** — details, summaries, dialogs, and related interactive disclosure.

This order teaches intent before tag choice. Alphabetical lookup may exist as a secondary index, not the primary hierarchy.

## Version-one Element inventory

The complete inventory is visible in Element Reference, but visibility does not mean a preference is Active. Current lifecycle is derived from each source entry: Actions, reviewed Typography, Forms composition, Forms text-entry, collapsed select, numeric input, and button-like inputs supply stable Treatments; remaining entries retain `0.0.0`. The exact current counts live in the Element standards audit. Reference-card spacing is app chrome, not Element Guidance.

- **Structure:** `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `address`, `search`.
- **Typography:** `h1`–`h6`, `p`, `strong`, `em`, `small`, `mark`, `abbr`, `time`, `blockquote`, `q`, `cite`, `code`, `pre`, `kbd`, `hr`.
- **Lists:** `ul`, `ol`, `li`, `dl`, `dt`, `dd`.
- **Actions:** `a`, `button`.
- **Media:** `img`, `picture`, `source`, `figure`, `figcaption`, `audio`, `video`, `track`.
- **Data:** `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `data`, `meter`, `progress`.
- **Forms:** `form`, `label`, `input`, `textarea`, `select`, `optgroup`, `option`, `fieldset`, `legend`, `datalist`, `output`.
- **Disclosure and dialogs:** `details`, `summary`, `dialog`.

Canvas, embedded browsing/plugin content, image maps, specialist ruby/bidirectional markup, scripting/template metadata, obsolete elements, and rare elements without a demonstrated use case retain Native Fallback.

### Input type subentries

`input` provides shared element guidance and owns typed subentries:

- **Textual:** `text`, `email`, `tel`, `url`, `search`, `password`.
- **Numeric:** `number`, `range`.
- **Temporal:** `date`, `time`, `datetime-local`, `month`, `week`.
- **Choice:** `checkbox`, `radio`.
- **Files and color:** `file`, `color`.
- **Action:** `submit`, `reset`, `button`, `image`.
- **Hidden:** `hidden`.

Each subentry documents purpose, suitable data, validation, `autocomplete` and `inputmode` guidance where relevant, accessibility behavior, current browser behavior, and Native Fallback limitations. Shared rules remain in the parent entry to avoid duplication.

## Element Reference route

Element Guidance is presented at `techies.local/elements` as one searchable overview with sticky intent-group navigation. Every listed element has a stable fragment identifier, such as `techies.local/elements#button`, so agents and people can link directly to its guidance. Separate routes should be introduced only when the overview becomes materially difficult to navigate.

## Editing model

The first Element Reference is read-only. It renders current Framework values and stored guidance but does not edit guidance inline. Framework configuration remains in the contextual sidebar; inline guidance editing is deferred unless a demonstrated workflow requires it.

## Source and export relationship

Element Guidance is authored as typed Markdown content, one file per listed element. The Element Reference renders these sources for human evaluation. Context Export includes only Active Treatments as positive visual guidance. A Native entry may contribute explicit decision-helpful `contextGuidance` in the separately labeled Native Element Decisions section, but it emits no CSS and never becomes a visual preference. The visualization is not itself the source of truth.

The Context Document describes intent and preferred outcomes without assuming React, Astro, native HTML/CSS, Elementor, Bricks, or another implementation harness. Harness-specific translation belongs to the consuming AI.

## Current web-platform guidance

When producing or revising Element Guidance, verify semantics and implementation against MDN Web Docs (`https://developer.mozilla.org/`) and query the Website Specification MCP (`https://mcp.specification.website/mcp`) for current platform-wide requirements when that MCP is connected. If it is unavailable, record the missing verification explicitly and use WHATWG HTML as the second primary source. External references determine correctness and compatibility; they do not determine personal visual preference.

Routine generation may use established Element Guidance without repeating all research. New, uncertain, compatibility-sensitive, or high-impact behavior requires live verification, and completed interfaces receive a final standards audit.

## Promoted Element Reference

The completed Exploration answered: **Which read-only reference structure best helps a person understand and evaluate the exact context an AI receives?**

Prototype D was promoted as the Guided Gallery. It combines prototype A's persistent intent navigation with prototype B's visual-first specimens. Search sits inside the intent index because both controls operate on the same browsing model. Full guidance remains progressively disclosed so scanning does not become a documentation wall.

Prototype layouts must exercise representative hard cases rather than easy typography alone:

- Heading and paragraph.
- Link and button.
- Form field with validation.
- Table.
- Figure with caption.
- Details and dialog.

After selecting a layout, implement the winner to production standards, record why it won, remove prototype switching and losing variants from the production branch, then expand the typed Markdown collection across the Element inventory.

### Explored directions

- **A — Reference manual:** dense documentation with sticky intent-group navigation and guidance beside each specimen.
- **B — Specimen gallery:** visual-first specimen cards with guidance available on demand.
- **C — Split inspector:** element index, live specimen, and AI-context guidance shown as coordinated panes.
- **D — Guided gallery:** promoted winner combining A's persistent intent navigation with B's visual-first specimens and progressively disclosed AI guidance.

Variants must disagree structurally, not merely use different colors or spacing. Evaluation focuses on human comprehension of AI context, scanning speed, visual comparison, responsive behavior, keyboard navigation, and whether important constraints remain visible.

App chrome and reference navigation use a neutral system UI font so product interface styling is not confused with Framework preference. Element specimens render current Framework typography. While font family and weight remain unresolved, the specimen marks them as placeholders and the Context Export omits them; established fluid size tokens remain valid.

### Promotion and cleanup

The production route is `techies.local/elements`. Prototype query parameters, the floating switcher, losing layouts, and inline fixture data have been removed from the production implementation. The typed Markdown collection exposes the full version-one inventory. Later promotions update lifecycle only after a meaningful Element-owned Treatment is authored and every Activation Evidence gate passes.

### Example content

Primary specimens use realistic neutral content: descriptive headings, genuine action labels, useful form labels and errors, plausible table data, meaningful captions, and understandable disclosure/dialog copy. Lorem ipsum is limited to optional stress specimens that test extreme text length or wrapping; it must not conceal semantic or accessibility problems in the main guidance.

## Accessibility target

WCAG 2.2 Level AA is the mandatory floor. Enhanced Level AAA text contrast is a preferred target where applicable and is reported separately rather than used to claim whole-page AAA conformance. Keyboard access, focus visibility, semantics, reduced motion, zoom, and reflow are evaluated independently. A failed required rule blocks Promotion; a missed preferred target produces a warning with reason and repair guidance.

### Contextual contrast checks

Every relevant specimen exposes a small accessibility status badge. Hover or keyboard focus opens a concise tooltip; click or Enter opens a persistent detail popover; Escape closes it. The same detail remains available on touch devices.

Checks follow subject type:

- Normal text against its effective background: AA `4.5:1`, preferred AAA `7:1`.
- Large text against its effective background: AA `3:1`, preferred AAA `4.5:1`.
- Essential icons, controls, and visual boundaries: `3:1` against relevant adjacent colors.
- Focus indicators: evaluated against the colors immediately inside and outside the indicator.
- Hover, focus, selected, error, and other meaningful states: evaluated separately.
- Images, gradients, and unresolved transparency: marked for manual verification rather than given false certainty.

The detail popover shows subject and comparison swatches, token names, measured ratio, applicable AA/AAA result, and failure reason. When contrast can improve, the export interface says so plainly and offers **See improvements**. That view presents up to two remedies drawn from existing compatible tokens, including each calculated AA result. A person may accept one remedy, or cancel and continue the export unchanged. These app-only checks and choices do not enter `context.md`.

For reliable app visualization, each relevant specimen declares its intended semantic subject, comparison color, and check kind. The renderer compares declared tokens with computed rendered colors; disagreement produces a diagnostic because the specimen no longer represents its guidance. This declaration and computed evidence are application metadata, not portable Framework preference.

## Fallback

Valid HTML without an Active Treatment retains its Native Fallback. Generative agents must not invent a Framework preference when no Active Element Guidance exists.

## Exploration and promotion

Alternative treatments are built through the prototype workflow. They remain isolated until explicit Promotion, after which the selected result is implemented as production guidance and prototype-only machinery is cleaned from the production branch.
