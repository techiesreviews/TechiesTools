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

Each production Pattern lives in `src/patterns/library/<pattern-id>/index.ts`. Its package definition colocates metadata, semantic HTML, editable default CSS, supporting interaction CSS, preview scale, and its allowed shortcut controls. The realistic Homepage Preview remains evidence for broader variants; icon-card and blog-card compositions remain Draft until focused review and Promotion.

The external seam is the small interface in `src/patterns/registry.ts` and `src/patterns/engine.ts`: callers look up a definition, compile it, or apply one named control. Validation, declaration updates, HTML/CSS output, persistence, and unsafe-draft handling remain inside that module. This provides leverage across every authoring route and keeps changes local to one package or the shared engine.

The `/patterns` route presents the registry as a filterable visual index. Every tile links to `/patterns/<pattern-id>` and renders the package's actual HTML and CSS against the Active Framework at its declared preview scale. The Main menu count derives from the same registry.

One dynamic authoring route composes the shared Settings bar and Preview browser for all Patterns. Each package supplies distinct Appearance controls, while Direct CSS and read-only HTML expose the portable source. Appearance controls are shortcuts over the same locked declaration list shown under Direct CSS. Valid edits update and persist the Preview; invalid drafts keep the last valid rendering visible. Reset remains in the protected Settings header and restores that package's canonical Framework-backed declarations.
