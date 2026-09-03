# Component Guidance

Component Guidance describes reusable styled patterns. It is separate from Element Guidance, which owns semantic meaning and native behavior.

## Boundary

- `<button>` Element Guidance explains action semantics, button types, naming, disabled behavior, and keyboard expectations.
- `.btn` Component Guidance explains visual hierarchy, spacing, sizes, variants, and interaction styling.
- `<article>` Element Guidance explains self-contained content semantics.
- A Card component explains reusable content composition and presentation.

Element specimens may render a preferred component, but the Context Document links rather than duplicates the two contracts.

## Guidance schema

Component Guidance will follow the same prescriptive pattern as Element Guidance:

- Purpose.
- Default Treatment.
- Composition and required semantic structure.
- Default variant and allowed contextual variants.
- States and interactions.
- Content constraints.
- Accessibility behavior.
- Do / avoid guidance.
- Live examples.
- Semantic markup and portable Implementation Reference.

## Starter pattern foundation

The production reference at `/patterns` publishes the first reusable Techies Starter patterns. Each implementation consumes Framework Primitives and Semantic Roles; none owns an independent palette, type scale, spacing scale, or radius scale.

- **Button** — one primary action plus secondary and ghost variants; default, small, and large sizes; visible Framework Focus treatment.
- **Listing card** — responsive property content with one stable semantic structure and optional `data-media`, `data-density`, and `data-tone` hooks. Media can be inset, edge-to-edge, or a full-image cover with progressive blur; removing `data-media` preserves the inset fallback.

Each production Pattern lives in `src/patterns/library/<pattern-id>/index.ts`. Its package definition colocates metadata, semantic HTML, editable default CSS, supporting interaction CSS, preview scale, and its allowed shortcut controls. Controls may update locked CSS declarations or declared root `data-*` attributes; the compiler applies both to the same persisted Preview and portable output. The realistic Homepage Preview remains evidence for broader variants; icon-card and blog-card compositions remain Draft until focused review and Promotion.

Shared Component treatments live in `src/framework/component-catalog/` and compile into `components.css`. The Button owns `.btn`; Listing card declares Button as a dependency, uses `class="btn pattern-listing-card__action"`, and changes only documented `--btn-*` hooks for its context. Variants use explicit `data-variant` and `data-size` attributes. Native CSS nesting keeps owned descendant, state, query, and variant rules visibly grouped under their root; nested selectors use `&` rather than Sass-only selector concatenation.

The Button Pattern is the non-permanent authoring surface for Button Component Guidance. Its editable CSS is seeded from the same catalog declarations and nested rules used by `components.css`, then adds the current contextual `--btn-*` choices. Consequently its CSS panel and export show the complete effective `.btn` treatment without maintaining another hand-authored implementation.

The external seam is the small interface in `src/patterns/registry.ts` and `src/patterns/engine.ts`: callers look up a definition, compile it, or apply one named control. Validation, declaration updates, HTML/CSS output, persistence, and unsafe-draft handling remain inside that module. This provides leverage across every authoring route and keeps changes local to one package or the shared engine.

The `/patterns` route presents the registry as a filterable visual index. Every tile links to `/patterns/<pattern-id>` and renders the package's actual HTML and CSS against the Active Framework at its declared preview scale. The Main menu count derives from the same registry.

One dynamic authoring route composes the shared Settings bar and Preview browser for all Patterns. Each package owns a simple conventional HTML/CSS namespace and distinct Appearance controls; Preview applies package CSS inside a package-specific scope while portable export keeps the clean authored selectors. Pattern Preview opens in the fitted viewport mode; fixed desktop, tablet, and mobile presets remain available. A Pattern-only Advanced action opens a reusable, non-modal bottom drawer with editable HTML and CSS panels while keeping Preview visible. While open, hovering outlines a Preview element; pointer selection projects that complete authored HTML element while keeping the complete component stylesheet editable. The CSS editor places the selected matching rule at the top of its viewport so parent and child rules remain available without changing stylesheet order. Keyboard-accessible breadcrumbs show the selected element's complete HTML path and let authors switch directly to any parent. The HTML fragment and complete CSS source remain backed by the portable sources: valid edits update and persist Preview, and keep footer exports complete. Appearance controls remain shortcuts over the root declaration list within the same stylesheet state; invalid drafts keep the last valid rendering visible. Reset remains in the protected Settings header and restores that package's canonical Framework-backed sources.
