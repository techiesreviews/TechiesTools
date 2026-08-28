# Active Framework site-theme QA

Date: 2026-08-28

## Automated verification

- `npm test`: 205 tests passed, 0 failed.
- `npm run check`: 0 errors; 8 existing non-blocking hints.
- `npm run build`: Cloudflare server build completed.
- `agent-graphs/active-framework-site-theme.json`: valid with no issues.

## Live Framework verification

- Renamed color, Semantic Role, typography, spacing, and radius namespaces in the real Framework editor.
- Changed Primary color, typography maximum, spacing maximum, and radius maximum.
- The Framework page root updated immediately from compiler output.
- Configured names and canonical site aliases resolved to identical values.
- The validated theme persisted with its compiler content hash and Google Fonts stylesheet.
- `/patterns` loaded the same content hash after navigation; Button color, text scale, Card spacing, and Card radius visibly resolved from the edited Framework values.

## Route verification

After Reset, `/patterns`, `/changelog`, `/tools/glass-card`, `/framework/homepage`, and `/framework/elements` all loaded the same persisted Starter content hash. Every route resolved Action, Body font, base Spacing, and base Radius from that theme, rendered its target content, and had no horizontal overflow.

## Recovery verification

- Reset stays in the non-scrolling sticky Settings-bar header.
- Reset uses a protected white surface, dark text, system font, fixed 6px radius, and Framework-independent focus color.
- The visual button is 32px high with a 48px coarse-pointer target.
- Under an intentionally hostile black-on-black theme with 5rem text, 10rem spacing, and 10rem radius, Reset remained visible and center-hit-testable.
- In a real 390 by 844 browser viewport, Reset could be scrolled fully into view and the document had no horizontal overflow.
- Activating Reset cleared the temporary UI differences, removed custom namespaces, and restored Starter color, typography, spacing, and radius values.

## Boundary verdict

Only validated compiled Primitives theme the techies.tools application. Active Element Treatment selectors remain scoped to Framework Preview content. Reset intentionally sits outside the live theme as the recovery exception.
