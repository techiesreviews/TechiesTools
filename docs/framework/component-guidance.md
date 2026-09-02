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

- **Button** — one primary action plus secondary and ghost variants; default and small sizes; visible Framework Focus treatment.
- **Badge** — compact accent and neutral metadata labels.
- **Card** — bordered standalone content with default and accent surfaces.
- **Clickable card** — Card composition with one stretched child link, an explicit accessible name, and whole-surface focus evidence.
- **Listing card** — responsive property content with one stable semantic structure and optional `data-media`, `data-density`, and `data-tone` hooks. Media can be inset, edge-to-edge, or a full-image cover with progressive blur; removing `data-media` preserves the inset fallback.

Each production Pattern lives in `src/patterns/library/<pattern-id>/index.ts`. Its package definition colocates metadata, semantic HTML, editable default CSS, supporting interaction CSS, preview scale, and its allowed shortcut controls. Controls may update locked CSS declarations or declared root `data-*` attributes; the compiler applies both to the same persisted Preview and portable output. The realistic Homepage Preview remains evidence for broader variants; icon-card and blog-card compositions remain Draft until focused review and Promotion.

The external seam is the small interface in `src/patterns/registry.ts` and `src/patterns/engine.ts`: callers look up a definition, compile it, or apply one named control. Validation, declaration updates, HTML/CSS output, persistence, and unsafe-draft handling remain inside that module. This provides leverage across every authoring route and keeps changes local to one package or the shared engine.

The `/patterns` route presents the registry as a filterable visual index. Every tile links to `/patterns/<pattern-id>` and renders the package's actual HTML and CSS against the Active Framework at its declared preview scale. The Main menu count derives from the same registry.

One dynamic authoring route composes the shared Settings bar and Preview browser for all Patterns. Each package owns a simple conventional HTML/CSS namespace and distinct Appearance controls; Preview applies package CSS inside a package-specific scope while portable export keeps the clean authored selectors. Pattern Preview opens in the fitted viewport mode; fixed desktop, tablet, and mobile presets remain available. A Pattern-only Advanced action opens a reusable, non-modal bottom drawer with editable, separate panels for the complete portable HTML and stylesheet while keeping Preview visible. While open, hovering outlines a Preview element; pointer selection or the keyboard-accessible next-element action identifies it and selects its complete authored HTML element and nearest matching CSS rule. Appearance controls remain shortcuts over the root declaration list within the same stylesheet state. Valid edits update and persist the Preview and its footer export artifacts; invalid drafts keep the last valid rendering visible. Reset remains in the protected Settings header and restores that package's canonical Framework-backed sources.
