# Framework adoption audit

Date: 2026-08-28

## Outcome

Use the current Active Framework Primitives and Semantic Roles as the live visual source for every techies.tools route. Keep editable Element Treatments scoped to Framework Preview content so changing a Treatment cannot break the Main menu, Settings bar, or tool controls. Keep Reset outside the live theme as the protected recovery path.

The audit originally identified Section and Container as candidates. A later product decision removed both before release; the final production library contains Button, Badge, Card, and Clickable card.

## Current route coverage

- `/framework/*` loads `global.css` and a live, scoped Framework Preview compilation.
- `/tools/glass-card` loads `global.css`; its application shell is shared, while the generated glass canvas intentionally owns tool-output values.
- `/changelog` loads `global.css`, but its page CSS contains a separate hardcoded palette.
- `/` redirects to the canonical Framework route.

## Gaps found

- `src/styles/tokens.css` defines application-only variables instead of canonical Framework token names.
- Shared app chrome partially uses those aliases, but several shared components still declare hardcoded colors, fonts, spacing, and radii.
- Changelog duplicates blue, neutral, spacing, and radius values instead of consuming the Framework.
- Existing Button, Badge, Card, and Clickable card defaults live inside the Homepage Preview instead of reusable pattern modules.
- Main menu advertises Patterns as unavailable and has no canonical route.

## First production slice

1. Publish canonical Starter Framework variables globally and derive stable application aliases from them.
2. Migrate shared shell/chrome and Changelog to those aliases.
3. Extract Button, Badge, Card, and Clickable card into reusable Astro/CSS pattern modules.
4. Add `/patterns` as a responsive, accessible reference route and activate its Main-menu entry.
5. Keep Preview-specific generated values and Glass Card output values inside their existing scoped contracts.

## Acceptance evidence

- Every page imports `global.css`, directly or through its route shell.
- Shared application surfaces contain no independent brand palette.
- Pattern components consume canonical `--semantic-*`, `--text-*`, `--space-*`, and `--radius-*` variables.
- `/patterns` renders the four approved Starter patterns.
- Tests, Astro check, production build, and real-browser desktop/mobile checks pass.
