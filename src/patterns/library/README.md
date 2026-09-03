# Pattern packages

Each child folder owns one production Pattern and exports one `PatternDefinition` from `index.ts`.

The definition colocates:

- discovery metadata and preview scale;
- semantic, trusted HTML;
- the editable default declaration list;
- supporting interaction and descendant CSS;
- Pattern-specific shortcut controls.

Callers must use `../registry.ts` and `../engine.ts` rather than importing a package directly. That interface keeps routing, compilation, persistence, validation, and last-valid Preview behavior consistent across the library.

Each package owns its HTML and CSS namespace. Use the shortest conventional component name that stays clear in portable output (such as `btn`) and use that root for descendant and state selectors. Preview wraps each package stylesheet in its own CSS scope, so these simple names cannot style app chrome or another Pattern Preview.

Declare cross-pattern Component needs through `dependencies`; do not copy their treatments into Pattern CSS. Pattern CSS should use native nesting for root-owned states and descendants, and contextual custom-property hooks for shared Components.

The shared export name is separate from a Pattern's internal ID. The engine rewrites the Pattern's root namespace throughout its HTML, CSS selectors, and named containers so copied artifacts stay connected after a rename. Framework variables keep their stable names. Increment a package's `storageVersion` when a renamed namespace cannot safely reuse old persisted authoring state.

Keep a compact Pattern in `index.ts`. If one grows, split its implementation into private `markup.ts`, `styles.ts`, or `settings.ts` files inside the same folder and reassemble the same single definition from `index.ts`; the registry interface should not change.
