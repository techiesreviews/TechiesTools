/**
 * Until 2026-10-28, `/` answered with a permanent 301 to `/framework/design-system`.
 * Browsers cache that redirect and never ask `/` again, so returning visitors kept
 * landing on the Framework instead of the Home page.
 *
 * When a visitor opens the Framework straight from the address bar or a bookmark,
 * which is how a cached redirect arrives, the response asks the browser to drop its
 * HTTP cache for techies.tools. The next visit to techies.tools then reaches the
 * Home page. Saved settings live in localStorage, which `"cache"` leaves alone.
 */
export const legacyRootRedirectHeader = { name: "Clear-Site-Data", value: '"cache"' } as const;

/** Cached redirects without cache headers fade out; stop clearing after this date. */
export const legacyRootRedirectClearUntil = Date.UTC(2027, 1, 1);

export const shouldForgetLegacyRootRedirect = (headers: Headers, now = Date.now()): boolean =>
  now < legacyRootRedirectClearUntil &&
  headers.get("sec-fetch-mode") === "navigate" &&
  headers.get("sec-fetch-dest") === "document" &&
  headers.get("sec-fetch-site") === "none";
