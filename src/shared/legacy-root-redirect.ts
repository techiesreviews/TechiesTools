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

/**
 * Marks a browser that already cleared its cache, so the clear runs once per visitor
 * instead of on every address-bar or bookmark visit. It holds no identifier and expires
 * with the clearing period.
 */
export const legacyRootRedirectClearedCookie = "techies-tools-cache-cleared";

const hasClearedCookie = (headers: Headers) =>
  new RegExp(`(?:^|;)\\s*${legacyRootRedirectClearedCookie}=1\\s*(?:;|$)`).test(headers.get("cookie") ?? "");

export const shouldForgetLegacyRootRedirect = (headers: Headers, now = Date.now()): boolean =>
  now < legacyRootRedirectClearUntil &&
  headers.get("sec-fetch-mode") === "navigate" &&
  headers.get("sec-fetch-dest") === "document" &&
  headers.get("sec-fetch-site") === "none" &&
  !hasClearedCookie(headers);

/** Response headers for a Framework design-system visit: the clear and its cookie, or nothing. */
export const legacyRootRedirectResponseHeaders = (headers: Headers, now = Date.now()): readonly (readonly [string, string])[] =>
  shouldForgetLegacyRootRedirect(headers, now)
    ? [
      [legacyRootRedirectHeader.name, legacyRootRedirectHeader.value],
      ["Set-Cookie", `${legacyRootRedirectClearedCookie}=1; Max-Age=${Math.ceil((legacyRootRedirectClearUntil - now) / 1000)}; Path=/; Secure; HttpOnly; SameSite=Lax`],
    ]
    : [];
