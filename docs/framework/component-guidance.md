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

## Current implementation inventory

The current realistic Website Preview exercises these patterns, which are implemented but not yet fully modeled as Component Guidance:

- Button: default, small, large, ghost, secondary, no-background/link.
- Badge: default and secondary.
- Card: default, primary, secondary, icon card, and blog card.
- Clickable-parent pattern: stretched child link with a relative containing card.
- Section and container layout primitives.

The supplied `.btn`, `.badge`, `.card`, `.section`, `.container`, and clickable-parent rules are Techies Starter Defaults. Icon-card and blog-card compositions remain draft Component Guidance until each receives focused review and Promotion.
