# Card pattern authoring QA

Date: 2026-08-29

## Automated verification

- `npm test`: 209 passed, 0 failed.
- `npm run check`: 0 errors; 8 existing advisory hints.
- `npm run build`: Cloudflare server build completed.
- `git diff --check`: no whitespace errors; Git reported only existing line-ending conversion notices.

## Browser verification

Verified against `http://localhost:4321` in the collaborative browser.

- The Card catalog tile exposes `/patterns/card` with the accessible name `Open Card pattern settings`.
- Its grid specimen uses a computed `matrix(0.78, 0, 0, 0.78, 0, 0)` transform; the rendered Card is approximately 225 px wide inside a 330 px preview well.
- The authoring route composes the shared Main menu, Settings bar, and Preview browser. At 1361 px, document and body scroll widths equaled their client widths.
- Selecting Medium radius updated the Direct CSS source to `var(--radius-m)`, changed the rendered radius, updated the Appearance summary, and persisted the same source.
- Entering an external-resource declaration produced `External-resource CSS is blocked for 'background'.`; `aria-invalid` became true and the Preview retained its exact prior inline style.
- Reset restored the default Framework-backed declaration list and removed Card preferences from local storage.
- At a 390 x 844 viewport, document scroll width equaled client width (379 px after scrollbar allocation), the 320 px Settings bar fit, and Reset remained visible and reachable.
- The Preview browser's Mobile control produced a 390 px simulated viewport and an approximately 357 px Card.
