# Pattern packages

Each child folder owns one production Pattern and exports one `PatternDefinition` from `index.ts`.

The definition colocates:

- discovery metadata and preview scale;
- semantic, trusted HTML;
- the editable default declaration list;
- supporting interaction and descendant CSS;
- Pattern-specific shortcut controls.

Callers must use `../registry.ts` and `../engine.ts` rather than importing a package directly. That interface keeps routing, compilation, persistence, validation, and last-valid Preview behavior consistent across the library.

Each package uses one `name_component` identifying root plus shared helpers. With `scoped: true`, `defaultCss` supplies the editable `:scope` declaration rule, `nestedCss` supplies its scoped child/state/query rules, and `supportCss` supplies independent scopes for nested components. The compiler emits the bounded scope; Preview adds a separate outer isolation scope.

Declare cross-pattern Component needs through `dependencies`; do not copy their treatments into Pattern CSS. Pattern CSS uses simple selectors inside bounded scopes and contextual custom-property hooks in independent scopes for shared Components. Reuse `src/utilities/index.ts` defaults; never copy them into a package.

The shared export name is separate from a Pattern's internal ID. The engine rewrites the Pattern's root namespace throughout its HTML, CSS selectors, and named containers so copied artifacts stay connected after a rename. Framework variables keep their stable names. The `legacyClasses` map migrates existing BEM drafts into bounded scopes without dropping authored content. Keep storage keys stable when migration is supported. Increment `storageVersion` only when old state cannot be safely migrated.

Keep a compact Pattern in `index.ts`. If one grows, split its implementation into private `markup.ts`, `styles.ts`, or `settings.ts` files inside the same folder and reassemble the same single definition from `index.ts`; the registry interface should not change.
