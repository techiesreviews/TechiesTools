# DRY component and Pattern authoring

This is the user-requested convention for components, Patterns, and feature interfaces. All thirteen built-in Patterns use this structure. Shared utility definitions live in `src/utilities/index.ts`; the same source drives Preview and the portable `utilities.css` artifact.

## Shared defaults

Check existing helpers and Component Guidance before writing CSS. Reusable behavior belongs in a shared helper; a component-specific difference belongs in that component's scope. Shared defaults consume Framework Tokens and Semantic Roles. Do not copy palettes, typography scales, spacing scales, or existing Component treatments into individual Patterns.

Load `utilities.css` before component styles, with Framework Tokens available first. Apply the relevant helper class to each element: layout declarations do not automatically inherit from a parent. Shared roles include `.section`, `.container`, `.content`, `.image`, `.layout-grid`, `.layout-flex`, and typography helpers such as `.heading-style-h2` and `.text-style-small`.

Each grid must establish its own column default through the shared rule:

```css
.layout-grid {
  --_columns: 1;

  display: grid;
  grid-template-columns: repeat(var(--_columns), minmax(0, 1fr));
  gap: var(--space-xl);
}
```

An outer grid's column count must not become a nested grid's default. The custom property affects only helpers that explicitly consume it.

The shared Button owns `.button_component`, with `.btn` retained as a compatibility helper for existing consumers. Reuse its treatment and documented contextual hooks instead of introducing a second `.button` implementation. Example values in the user's general-purpose utility stylesheet illustrate structure; Framework defaults still derive from the configured preferences.

## Component identity and boundaries

Give each component one identifying class in the form `name_component`, alongside any shared helpers. Children use reusable role classes rather than prefixed copies such as `.hero_content`. Nested components receive their own identifying root.

```html
<section class="hero_component section">
  <div class="container">
    <div class="layout-grid">
      <div class="content">
        <h1 class="heading-style-h2">Build something useful</h1>
        <p class="text-style-small">Tools for your next idea.</p>
      </div>
      <article class="card_component">
        <div class="content">
          <h2 class="heading-style-h4">Explore the collection</h2>
        </div>
      </article>
    </div>
  </div>
</section>
```

Use native at-rules, never the pasted formatting artifacts `[scope](scope)` or `[media](media)`:

```css
@scope (.hero_component) to ([class*="_component"]) {
  :scope {
    padding-block: var(--space-4xl);
  }

  .content {
    align-self: start;
  }

  [class*="heading-style-"] {
    max-width: 10ch;
    text-transform: uppercase;
  }

  @media (width > 50rem) {
    .layout-grid {
      --_columns: 2;
    }
  }
}

@scope (.card_component) to ([class*="_component"]) {
  :scope {
    padding: var(--space-l);
  }

  .content {
    gap: var(--space-s);
  }
}
```

The card root and its descendants are excluded from the hero's scoped selector matching. Reserve `_component` for actual component roots: the boundary selector is a substring match, not a suffix check. Inherited properties and custom properties can still cross this boundary; establish explicit defaults inside nested components when they need independence. See the [CSS scoping specification](https://www.w3.org/TR/css-cascade-6/#scoped-styles) and [MDN's inheritance explanation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope#description).

Use simple selectors within the scope. `.content` has specificity `0-1-0`; `.hero_component .content` and `:scope .content` have `0-2-0`. Use `[class*="heading-style-"]` or `[class*="layout-"]` only when every matching helper should change; use `.layout-grid` for grid-specific overrides. Choose semantic heading levels independently of appearance classes. Keep responsive rules with their component.

## Runtime and portable output

Framework export contains five ordered artifacts: `tokens.css`, `elements.css`, `utilities.css`, `components.css`, and `context.md`. Load the four stylesheets in that order, then the Pattern stylesheet. Context embeds exact copies of all four CSS files. Pattern downloads still contain the Pattern's own HTML and CSS and consume these Framework dependencies. [ADR 0021](../adr/0021-dry-pattern-scopes-and-utilities.md) records this contract.

The Pattern compiler emits one bounded owner scope with its editable `:scope` declaration rule and contextual rules. Additional independent scopes style nested components, including shared Buttons and stacked cards. The outer Preview scope isolates the entire rendered example from the application; it does not replace component boundaries. Export renaming updates owner scopes, named containers, and owned keyframes, while shared helpers and nested component identities remain stable.

Built-in source uses shared layout, media, typography, list, and visually-hidden helpers wherever applicable. Defaults reflect the current Framework and existing compositions; individual Patterns override only their differences. Universal box sizing is restricted to opted-in component trees. Body and unrelated semantic elements retain their Element Treatment or Native Fallback.

Legacy BEM drafts migrate their class references, queries, and rules into bounded scopes without discarding authored HTML or declaration values. Storage keys remain stable; serialized state version 4 records the new source shape. Migrated personal drafts may retain additional declarations to preserve their authored presentation; Reset loads the DRY built-in source.

Native `@scope` is required for the full visual treatment. Check [MDN browser compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope#browser_compatibility) against the target browser matrix before consuming exports. Scope support does not activate any Element Treatment. Content and native controls remain semantic HTML.

Verify nested grids, nested component boundaries and inheritance, semantic headings, responsive layouts, shared dependency loading, persisted drafts, and parity between Preview and export when changing this contract.
