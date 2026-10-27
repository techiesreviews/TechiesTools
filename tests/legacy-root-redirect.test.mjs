import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { legacyRootRedirectClearUntil, legacyRootRedirectHeader, shouldForgetLegacyRootRedirect } from "../src/shared/legacy-root-redirect.ts";

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
  assert.match(page, /route\.key === "design-system" && shouldForgetLegacyRootRedirect\(Astro\.request\.headers\)/);
});
