# Pattern packages QA

Date: 2026-08-29

## Automated verification

- `npm test`: 211 passed, 0 failed.
- `npm run check`: 0 errors; 8 existing advisory hints.
- `npm run build`: Cloudflare server build completed.
- `git diff --check`: no whitespace errors; Git reported only existing line-ending conversion notices.
- All four dynamic routes returned HTTP 200 with their Pattern-specific title: Button, Badge, Card, and Clickable card.

## Interface verification

- Four definitions are registered from four folders under `src/patterns/library/`.
- Every definition owns metadata, HTML, editable default CSS, preview scale, and at least two Pattern-specific controls.
- Every default and every control option compiles through the shared engine and can be selected back from the resulting declaration list.
- Persisted state is namespaced by Pattern ID; state from one Pattern is rejected by another.
- External-resource CSS is rejected and falls back to the package default during state loading.
- The previous Card-only model, compiler, preferences, controller, route, and settings/preview files are absent.

## Browser verification

Verified against `http://localhost:4321` in the collaborative browser.

- `/patterns` renders four whole-tile links with destinations `/patterns/button`, `/patterns/badge`, `/patterns/card`, and `/patterns/clickable-card`.
- Each tile applies its declared scale (0.88, 0.9, 0.78, and 0.72 respectively) and the scoped package CSS renders independently.
- At 1361 px, the Patterns document scroll width equaled client width.
- `/patterns/button` exposed Treatment, Size, and Radius controls plus separate Direct CSS and HTML sources. Selecting Secondary updated the CSS, computed Preview surface, summary, and Button-only storage.
- Entering an external-resource declaration set `aria-invalid`, reported the blocked resource, and left the exact last-valid Preview stylesheet unchanged. Reset restored defaults and cleared storage.
- At 390 x 844 on `/patterns`, document scroll width equaled client width, the grid collapsed to one column, and all four destinations remained available.
