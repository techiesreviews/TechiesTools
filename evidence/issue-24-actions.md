# Issue 24 Actions candidate evidence

Scope: Actions tracer only (`a`, `button`). This packet does not approve Actions or any later rollout group.

## Decisions

| Element | Decision | Candidate version | Reason |
| --- | --- | --- | --- |
| `a` | **Defer** | `1.0.0` | Exact candidate and Draft browser behavior are implemented, but required accessibility/global parity evidence and explicit human Promotion of these differences are absent. |
| `button` | **Defer** | `1.0.0` | The first candidate failed contrast and touch-target checks. The revised candidate borrows the existing `.btn` token and spacing intent, but does not claim parity and still requires fresh contrast/target evidence plus explicit human Promotion. |
| `input[type="button"]` | **Defer** | Not assigned | Belongs to the later Forms slice; issue #37 remains untouched. |
| Variant B hover effect | **Defer** | Not applicable | Needs exact selector/property/value allowlist review before it can enter an Actions Treatment Definition. |

Both source entries therefore use `promoted: false` and `accessibilityPassed: false`. The application cannot promote itself. Explicit chat approval must name the exact accepted differences and stable version before either flag may become true.

### State-navigation decision — 2026-07-18

The user selected prototype B's native-dropdown direction for production rewrite. The promoted interaction is deliberately smaller than the throwaway prototype: each active Link or Button fieldset has one visible `State` label and one native select in authored rule order; Base is the default, and exactly one rule section is visible. Changing state affects presentation only, not canonical values, persistence, compilation, or Reset. The command button, preview panel, counters, tabs, rail, switcher, URL parameter, and prototype-only state were removed.

This is a **Promote** decision for the settings-navigation interaction only. It does not promote either Element Treatment Definition; Link and Button remain **Defer** as recorded above. Capturing the discarded experiment on a throwaway branch remains pending because commit/branch publication was not authorized.

### CSS-authoring interaction decision — 2026-07-18

The user selected prototype B's declaration editor for production. This is a **Promote** decision for the CSS-authoring interaction only: a native State dropdown, visible locked selector, declaration-only light editor, syntax overlay, caret-anchored reviewed completions, resolved token values and color swatches, keyboard listbox operation, and actionable checklist diagnostics. The production interaction writes one complete rule candidate through the canonical controller and compiler; it does not create a second Preview or serialization path.

This initial decision deferred unrestricted raw CSS. The 2026-07-18 Declaration-authoring Promotion decision below supersedes the property/value portion while retaining locked selectors, at-rule exclusion, security checks, and whole-rule atomicity. Link and Button Treatment candidates remain **Defer**, and their `promoted` and `accessibilityPassed` flags remain unchanged.

## Exact candidate allowlists

| Element/rule | Exact selector | Exact properties | Exact offered values |
| --- | --- | --- | --- |
| `a/base` | `:where(a[href])` | `color`, `text-decoration-line` | current `semantic` + `color` registry tokens; `underline`, `none` |
| `a/hover` | `:where(a[href]:hover)` | `color` | current `semantic` + `color` registry tokens |
| `a/focus-visible` | `:where(a[href]:focus-visible)` | `outline-color`, `outline-style`, `outline-width`, `outline-offset` | current `semantic` + `color` registry tokens; reviewed visible outline styles; canonical nonnegative width and signed offset lengths |
| `a/active` | `:where(a[href]:active)` | `color` | current `semantic` + `color` registry tokens |
| `a/quiet` | `:where(a[href][data-variant="quiet"])` | `text-decoration-line` | `none` |
| `a/link-in-navigation/current` | `:where(nav a[aria-current="page"])` | `text-decoration-line` | `underline` |
| `button/base` | `:where(button:not([disabled]))` | `color`, `background-color`, `font-size`, `border-color`, `border-style`, `border-width`, `border-radius`, four logical margins, four logical paddings | current tokens from each declaration's exact reviewed families and type; reviewed border styles; canonical nonnegative border width; margins may explicitly omit |
| `button/hover` | `:where(button:not([disabled]):hover)` | `background-color` | current `semantic` + `color` registry tokens |
| `button/focus-visible` | `:where(button:focus-visible)` | `outline-color`, `outline-style`, `outline-width`, `outline-offset` | current `semantic` + `color` registry tokens; reviewed visible outline styles; canonical nonnegative width and signed offset lengths |
| `button/active` | `:where(button:not([disabled]):active)` | `background-color` | current `semantic` + `color` registry tokens |
| `button/disabled` | `:where(button:disabled)` | `color` | current `semantic` + `color` registry tokens |
| `button/secondary` | `:where(button[data-variant="secondary"])` | `color`, `background-color` | current `semantic` + `color` registry tokens |

Only the four reviewed Button logical margins permit omission; their Starter Default is omission and Reset restores that state. Token declarations accept every current registry member in their exact reviewed family set and required type: `semantic`/`color` require `color`; `spacing`, `typography`, and `radius` require `dimension`. Registry identity alone is insufficient. Dotted names are valid; nonexistent, wrong-family, and wrong-type tokens are rejected atomically.

Canonical length controls accept finite numbers followed by a case-insensitive reviewed CSS length unit: `px`, `em`, `rem`, `ex`, `rex`, `cap`, `rcap`, `ch`, `rch`, `ic`, `ric`, `lh`, `rlh`, viewport units (`v*`, `sv*`, `lv*`, `dv*`), container-query units (`cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax`), and physical units `cm`, `mm`, `Q`/`q`, `in`, `pc`, `pt`; unitless zero is also valid. Widths are nonnegative and additionally accept their exact reviewed CSS line-width keywords `thin`, `medium`, and `thick`. Offsets may be signed and accept no keywords. Percentages, functions such as `calc()`, URLs, unknown units, non-finite forms, and negative widths are rejected without partial CSS. Focus styles allow `auto`, `dotted`, `dashed`, `solid`, `double`, `groove`, `ridge`, `inset`, and `outset`; `none` and `hidden` are excluded. Border styles use the same reviewed list except `auto`.

The canonical Treatment Definition model rejects unlisted selectors, Starter properties/options, states, variants, relationship owners/targets, omissions, raw values, and unavailable tokens. The later authoring Promotion changes editable declaration behavior, not this reviewed Starter-definition schema.

## Semantics and native behavior

- Link specimens use real `href` values and preserve Enter activation, accessible names, and navigation semantics.
- The current-navigation relationship uses `aria-current="page"`; it does not replace `nav` or link semantics.
- Button specimens use `type="button"` and retain native Space/Enter activation and disabled behavior.
- Candidate rules do not change `display`, `appearance`, `pointer-events`, focus order, activation, disabled behavior, or accessible naming.
- Undeclared presentation remains browser-native.

## Accessibility status

The first browser candidate failed: Action/surface contrast was inadequate for normal text and the Button target height was below 24 CSS pixels. That run is superseded and is not Promotion evidence.

The revised candidate keeps Link text on `semantic.text`, borrows the `.btn` token and spacing intent with `semantic.surface` on `semantic.action`, adds `spacing.3xs` block and `spacing.s` inline Button padding, and separates the two-pixel focus outline with a two-pixel offset. It does not claim `.btn` parity. These changes are not asserted to pass until the following fresh checks run:

- normal-text contrast for base, hover, active, and secondary combinations;
- focus-indicator contrast against adjacent colors;
- Button target size at all supported viewport/zoom settings;
- keyboard activation, disabled behavior, link-versus-button semantics, reflow, and automated accessibility scan;
- scoped Preview/global CSS computed-style parity in a clean browser session.

Until those checks pass, `accessibilityPassed` remains false and the compiler excludes both deferred Elements from global CSS and Context.

## Draft browser evidence — 2026-07-17

A clean browser restart exercised the isolated candidate channel without promoting either Element:

- The fresh `http://127.0.0.1:4321/?variant=E` response returned **200** with no Treatment Definition runtime schema failure.
- The empty Element picker computed three columns at `23.997px / 133.372px / 23.997px`; its input used centered text and the measured visual center delta was `0.996px`.
- Link Focus color exposed **13** current tokens: **6 semantic + 7 color**. The selected Focus swatch computed to its resolved `oklch(...)` value, and the Palette `Color-3` swatch also computed successfully rather than becoming transparent.
- Choosing Link Focus color `color-3` synchronized the visible value, CSS-variable metadata, selected-option `aria-selected`, Draft CSS, and Draft specimen computed style. Reset restored the authored **Focus** token.
- Link Focus width and offset each exposed exactly `1px`, `2px`, `3px`, and `4px`. Selecting `4px` changed the Draft specimen; Reset restored both authored `2px` values.
- The Link native demo contained no visible Current element or navigation comparison. The canonical relationship definition and relationship specimen remained available as evidence.
- Button rendered **8** color controls, each with the same **13** live tokens; every rendered color swatch computed to a non-transparent value.
- Choosing Button Base Background `color-3.dark` produced metadata `var(--color-3-dark)`, synchronized Draft CSS, and computed to `oklch(.465 .218 29.2)`. Reset restored the authored **Action** token.
- Accessibility inspection confirmed Link specimens retained real `href` values, Button specimens retained explicit `type="button"`, the disabled Button remained disabled, the Actions section had no `aria-live`, and only the actionable diagnostic used `role="alert"`.
- The relationship combobox whose canonical rule ID contains `/` computed valid matching `anchor-name` and `position-anchor` values after anchor-only sanitization.
- The final screenshot was visually reviewed for picker centering, token lists and swatches, Link and Button Draft state, focus lengths, Reset results, and absence of the native Current navigation comparison.
- `[data-framework-draft-specimen="a"]` and `[data-framework-draft-specimen="button"]` markers were present in Element Reference.
- Link Underline prefilled as **Show**. Selecting **Hide** changed computed `text-decoration-line` from `underline` to `none` inside the Link Draft specimen.
- Button Text color prefilled from the authored `semantic.surface` token. Selecting `semantic.text` changed the computed Button color inside the Draft specimen.
- Token controls prefilled correctly after controller values arrived with a different JSON property order than their option values.
- Every color-valued Link and Button control advertises the same `[semantic, color]` policy. The browser adapter publishes the current typed color registry (`id`, `cssName`, `value`, `type`) plus a final literal `swatch`; semantic references resolve through `dtcgValue` or their referenced color token. The shared combobox rebuilds its options with human labels, exact CSS-variable metadata, and scope-independent literal swatches while retaining the authored Starter selection.
- Relationship rule IDs containing `/` retain their canonical identity while the shared combobox sanitizes only the CSS anchor identifier, keeping `anchor-name` and `position-anchor` valid.
- Empty Element picker layout reserves symmetric 24-pixel icon columns, keeping its placeholder centered. The Link's native demo omits the visible current-navigation example while the relationship definition and specimen evidence remain canonical.
- The integrated token Popover rendered inside the Actions panel. Changing Button Base Background from **Primary** to **Action** updated the combobox input, token metadata, selected option `aria-selected`, and the Draft Button specimen.
- Keyboard autocomplete on Button Base Background: entering `pri` left only the **Primary** result; ArrowDown then Enter selected it, closed the Popover with `aria-expanded="false"`, and synchronized the input plus selected option `aria-selected` state.
- Reset element restored Button Base Background to the authored **Action** Starter Default.
- The Element difference store contained only the exact changed path/value. Reset element removed the empty Element store key and restored the authored Starter Default.
- No Reset Actions group control was present.
- Ordinary Framework Preview CSS contained no Button or other Actions rules while both candidates remained unpromoted.
- Runtime logs contained zero errors. The only console output was pre-existing SVG `srcset` warnings unrelated to Actions.
- Final markup reload confirmed the Actions section has no `aria-live`, the diagnostic alone retains `role="alert"`, and runtime logs contain zero errors.

This run proves observable Draft editing, difference persistence/Reset, runtime token synchronization, literal swatch rendering, valid relationship anchors, and isolation from ordinary output. It does not claim a fresh global computed-style parity run, automated WCAG conformance, accessibility evidence completion, or Promotion.

## Fresh browser evidence — 2026-07-18

- Button controls exposed the complete current reviewed registries: 13 color tokens, 8 typography tokens, 6 radius tokens, 11 spacing tokens for padding, and 12 margin choices including explicit omission.
- The Button legend retained accessible text `Button` while remaining visually hidden with the repository's screen-reader-only absolute positioning at approximately one CSS pixel.
- Button border style exposed exactly `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `inset`, and `outset`; Link and Button focus style exposed the same list plus `auto`.
- Typing Button border width `3vw` through the live text input produced `aria-invalid="false"`, compiled `border-width: 3vw`, and computed `52.5px`.
- Replacing it with invalid `2wat` immediately produced `aria-invalid="true"` and the exact actionable length diagnostic. Compiled and computed output remained at the last complete valid `3vw` / `52.5px`; no partial invalid CSS appeared.
- Button focus width `2CQW` and focus offset `-2ch` were accepted. Link focus width `thin` and offset `-3vw` were accepted and compiled exactly.
- Button inline-start padding selected the live `--space-4xl` token, compiled as its CSS variable, and computed to `84.176px`.
- Length inputs had no `inputmode`, permitting reviewed unit letters. Each input's `aria-describedby` referenced an existing diagnostic element; the shared diagnostic retained `role="alert"`; Reset element retained `type="button"`.
- Link retained two real `href` values. The visible Current element remained absent while its canonical relationship evidence remained available.
- Browser console error and warning collections were empty.
- Screenshot capture timed out on the unusually tall page. Current DOM, computed-style, compiler-state, and accessibility-tree evidence completed successfully; visual state remains covered by the prior reviewed browser evidence above.

This fresh run proves live dynamic option counts, immediate canonical compilation from typed input, invalid-intermediate atomicity, reviewed length/style behavior, semantic preservation, and the rendered accessibility contracts. Both Elements remain explicitly **Defer**; this run does not constitute Promotion or a global-output parity claim.

## CSS-authoring browser evidence — 2026-07-18

- The completion popup was anchored to the caret exactly: its computed top equaled the caret marker's computed bottom.
- At this checkpoint, typing `bac` returned exactly one property completion, `background-color`. The later authoring Promotion and completion follow-up supersede this behavior.
- Typing `--` for Button Base Background ranked the two rule-scoped tokens first, followed by other current reviewed-family tokens. Each token exposed its resolved OKLCH value and a color swatch.
- A valid Button declaration edit compiled through the canonical controller into the Draft specimen stylesheet. The editor created no inline style path.
- An invalid declaration retained the last valid Preview, identity, and stored difference while showing the actionable authoring checklist.
- Reset restored the canonical declaration source. State navigation kept exactly one rule editor visible.
- Link Underline `none` persisted across reload, then Element Reset restored the authored `underline` source.
- Browser error and warning logs remained empty.
- Rule-size contracts now keep one- and two-line rules compact, give medium rules a fixed standard height, and cap Button Base at a fixed large height with scrolling. The statement that typing never resizes the editor is historical and superseded by the CSS editor sizing evidence from 2026-07-19. Resolved color values also receive a non-layout-shifting source underline built from the published token swatch map; raw swatch text is never interpolated into overlay HTML.

These observations promote only the CSS-authoring interaction B recorded above. Link and Button Treatments remain **Defer**.

## CSS-authoring follow-up evidence — 2026-07-18

- The settings rail computed at 320 pixels and remained bounded by the viewport on narrow screens.
- Resolved color values used 8-pixel square source markers. The markers were absolutely positioned, caused no layout shift, and were created through safe DOM SVG APIs; raw swatch values were not interpolated into overlay HTML.
- Each locked selector, editable declaration source, and closing brace rendered inside one continuous editor frame. The selector remained noneditable and exposed an accessible locked-selector label.
- At this checkpoint, entering syntactically valid `border` for Button Hover produced the valid-but-unreviewed diagnostic without expanding the exact property allowlist. The Promotion decision below supersedes this editor behavior.
- Reset left zero invalid editors and restored canonical authored declarations.
- Browser console warning and error collections both remained empty.
- At that checkpoint, unrestricted declaration editing remained **Defer**. The user decision below supersedes that property/value gate while retaining the locked selector and rule-identity boundaries.

## Declaration-authoring Promotion decision — 2026-07-18

**Promote.** The user explicitly superseded the original property/value editing allowlists. Inside a locked Element/state/variant/relationship rule, any standards-valid CSS declaration is now accepted, persisted, and compiled. Reviewed Treatment declarations remain Starter defaults, recommendations, and autocomplete inputs; they are no longer rejection gates. Exact Element, selector, state, variant, and relationship allowlists remain unchanged.

- The shared browser/Node parser is the directly pinned `css-tree` 3.2.1 declaration-list parser. It normalizes declaration order and values deterministically, supports shorthands, logical and physical properties, `!important`, vendor/future properties, custom properties, and valid CSS strings containing `@` or braces.
- Known-property grammar mismatches are errors when the parser can determine invalidity. Unknown, future, vendor-prefixed, and custom properties are not rejected merely because they are absent from current grammar data.
- Layout-affecting declarations such as `display`, flex, and grid compile with an actionable warning. Warnings remain visible but do not set `aria-invalid` or block output.
- The security boundary conservatively blocks every `url()`, `image-set()`, `-webkit-image-set()`, and `src` declaration, including local fragments and data URLs, so authored CSS cannot initiate external-resource loads. Selectors, braces, and at-rules remain outside the editable declaration context.
- Valid arbitrary declarations flow through the same Resolved Framework compiler to scoped Preview, layered CSS, and Context with stable identity and declaration order. DTCG remains intentionally token-only.
- Invalid source is saved separately under `techies-tools:framework:rule-drafts:v1`, remains visibly authored across blur, state changes, and reload, and never enters compiler input. Preview retains the complete last valid applied CSS atomically; no partial invalid declaration is emitted.
- Element Reset clears both the applied source difference and invalid draft, restoring the canonical Starter declarations. Applied declaration blocks remain difference-only in `techies-tools:framework:element-diffs:v1`.
- The color marker retains an 8-pixel square before the value, with reserved spacing after the property colon so the marker cannot obscure `: `.
- Property completion now uses the pinned standards catalog: `bac` ranks `background`, reviewed `background-color`, then common background family properties before the remaining lexical results. Already-declared vendor/custom property names are recognized.
- Token completion after `--` works for every standards-valid property. Exact reviewed tokens rank first, compatible current token types next, and all remaining current tokens follow deterministically with resolved values and color swatches.
- The syntax overlay recognizes standard, vendor-prefixed, and custom properties. It adds safe DOM-created squares for both resolved color tokens and literal values accepted by `CSS.supports("color", value)`.
- Context uses content-length-aware Markdown fences for arbitrary declaration CSS and mapping text, so authored backtick runs cannot close generated blocks or destabilize the artifact.

## CSS editor sizing evidence â€” 2026-07-19

- The declaration editor uses `field-sizing: content` as a progressive enhancement. Browsers without it retain the fixed compact, standard, and large editor heights.
- In supporting browsers, authored lines grow the editor vertically from 80 to 297 CSS pixels. At the 360-pixel cap, additional content scrolls vertically.
- A single long unwrapped declaration keeps the editor inline size fixed at 263 CSS pixels while its `scrollWidth` reaches 2593 pixels, providing horizontal scrolling rather than widening the settings rail.
- The exact authored draft was restored after the sizing checks.
- The full test suite passed with 72 tests.

## Compiler and persistence evidence

Acceptance tests exercise promoted copies of the exact candidate definitions without changing source Promotion state. They prove:

- one immutable Resolved Framework feeds scoped Preview, layered CSS, typed DTCG, and Context;
- deferred candidates render only through the isolated `[data-framework-draft-specimen]` channel and remain absent from ordinary Preview/global CSS/Context;
- full canonical active guidance, selectors, relationships, effective values, Primitives, and identity determine the stable content hash;
- authored Element/rule/declaration order is deterministic, with relationships last;
- Preview/global selectors differ only by `[data-framework-preview]`;
- exact Treatment Definition allowlists include Starter omission policy and reject schema expansions; editable declaration blocks follow the later Promotion decision above;
- token selection accepts every current registry member from the declaration's exact family set and type, including dynamic spacing, typography, and radius tokens, while rejecting missing, wrong-family, and wrong-type tokens atomically;
- typed-registry tests reject `semantic.*` or `color.*` IDs whose registered type is not `color`; `color.fake` as a dimension blocks every compiler channel;
- literal-swatch tests resolve semantic references to final color values rather than relying on sidebar-scoped CSS variables;
- combobox tests preserve canonical IDs while sanitizing slash-bearing IDs only for matching CSS anchor identifiers;
- typed-control length tests accept reviewed values such as `2ch`, `3vw`, `.5rem`, `2PX`, `4q`, and `3cqw`, plus width-only `thin`/`medium`/`thick`; these constraints remain for the typed control API, while the CSS editor follows standards grammar and preserves the last complete valid compiler result on failure;
- rendered length controls publish every native `input` edit to the canonical controller, so typed and assisted entry cannot leave visible text ahead of compiled state; invalid intermediate text receives an actionable diagnostic while the last complete valid CSS and identity remain intact;
- Link and Button retain screen-reader-only fieldset legends. Invalid length inputs expose a short, property-specific checklist through the existing `aria-describedby` relationship: safe examples, the unitless-zero exception, width/offset sign policy, and explicit rejection of percentages/functions.
- Link and Button state navigation uses a visible native select generated from canonical authored rule order. Base is the default; changing the select reveals exactly one matching rule without writing preferences, and element Reset leaves the chosen navigation state intact.
- Button base tests enforce the exact reviewed property order, dynamic token families, border style policy, and difference-only omission/Reset behavior for all four logical margins;
- Primitive IDs, CSS names, types, values, differences, and uniqueness validate before serialization; failure blocks every channel with repair diagnostics;
- invalid promoted definitions and invalid edits retain the controller's complete last valid Preview and hash; CSS/Context contain no partial invalid output;
- Element selections and Primitive preferences persist differences only; valid paths survive quarantine; Element, Actions, and Framework Reset remove their exact differences;
- the legacy full UI-state key migrates deliberately to UI differences while canonical Primitive token differences use `techies-tools:framework:primitive-diffs:v1`;
- Context includes purpose, use, constraints, states, variants, relationships, accessibility, semantic HTML, compact token mappings, and exact combined CSS once;
- Export consumes only final revalidated compiler channels.

## Reproduction

Run from the repository root:

```text
npm run test
npm run check
npm run build
git diff --check
```

Promotion and global-output parity evidence remain pending until explicit human approval permits the exact candidate differences to enter active Preview/global outputs. No previous hashes or byte counts are retained because they described a superseded candidate.

## Sources

- Link: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a>, checked 2026-07-16, Baseline Widely available.
- Button: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button>, checked 2026-07-16, Baseline Widely available.
- Candidate definitions: `src/content/elements/a.md`, `src/content/elements/button.md`.
- Exact enforcement: `src/framework/model/index.ts`.
- Compiler: `src/framework/compiler/index.ts`.
- Acceptance tests: `tests/framework-actions.test.mjs`, `tests/settings-bar.test.mjs`.
