import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { legacyRootRedirectClearUntil, legacyRootRedirectHeader, legacyRootRedirectResponseHeaders, shouldForgetLegacyRootRedirect } from "../src/shared/legacy-root-redirect.ts";

const typed = { "sec-fetch-mode": "navigate", "sec-fetch-dest": "document", "sec-fetch-site": "none" };
const now = Date.UTC(2026, 9, 28);

test("only address-bar and bookmark visits to the Framework clear the cached root redirect", () => {
  assert.equal(shouldForgetLegacyRootRedirect(new Headers(typed), now), true);
  assert.equal(shouldForgetLegacyRootRedirect(new Headers({ ...typed, "sec-fetch-site": "same-origin" }), now), false);
  assert.equal(shouldForgetLegacyRootRedirect(new Headers({ ...typed, "sec-fetch-site": "cross-site" }), now), false);
  assert.equal(shouldForgetLegacyRootRedirect(new Headers({ ...typed, "sec-fetch-dest": "iframe" }), now), false);
  assert.equal(shouldForgetLegacyRootRedirect(new Headers(), now), false);
  assert.equal(shouldForgetLegacyRootRedirect(new Headers(typed), legacyRootRedirectClearUntil), false);
});

test("the Framework design-system page clears only the HTTP cache, never stored settings", () => {
  const page = readFileSync(join(process.cwd(), "src", "pages", "framework", "[page].astro"), "utf8");

  assert.deepEqual(legacyRootRedirectHeader, { name: "Clear-Site-Data", value: '"cache"' });
  assert.match(page, /route\.key === "design-system"\) for \(const \[name, value\] of legacyRootRedirectResponseHeaders\(Astro\.request\.headers\)\) Astro\.response\.headers\.append\(name, value\)/);
});

test("each browser clears its cache once: the clear sets a cookie that stops the next one", () => {
  const first = legacyRootRedirectResponseHeaders(new Headers(typed), now);
  const secondsLeft = (legacyRootRedirectClearUntil - now) / 1000;
  assert.deepEqual(first, [
    ["Clear-Site-Data", '"cache"'],
    ["Set-Cookie", `techies-tools-cache-cleared=1; Max-Age=${secondsLeft}; Path=/; Secure; HttpOnly; SameSite=Lax`],
  ]);
  assert.deepEqual(legacyRootRedirectResponseHeaders(new Headers({ ...typed, cookie: "techies-tools-cache-cleared=1" }), now), []);
  assert.deepEqual(legacyRootRedirectResponseHeaders(new Headers({ ...typed, cookie: "theme=dark; techies-tools-cache-cleared=1; other=2" }), now), []);
  assert.equal(legacyRootRedirectResponseHeaders(new Headers({ ...typed, cookie: "old-techies-tools-cache-cleared=1" }), now).length, 2);
  assert.deepEqual(legacyRootRedirectResponseHeaders(new Headers({ ...typed, "sec-fetch-site": "same-origin" }), now), []);
});
