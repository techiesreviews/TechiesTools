import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackGoogleFontCatalog,
  fontOptionsForRole,
  loadGoogleFontCatalog,
} from "../src/framework/fonts/catalog.ts";

test("offline Google Fonts catalog offers substantially broader compatible choices", () => {
  assert.ok(fallbackGoogleFontCatalog.length >= 30);
  for (const family of ["Inter", "Geist", "Bricolage Grotesque", "JetBrains Mono", "Martian Mono"]) {
    assert.ok(fallbackGoogleFontCatalog.some((font) => font.family === family), family);
  }

  const body = fontOptionsForRole(fallbackGoogleFontCatalog, "body");
  const heading = fontOptionsForRole(fallbackGoogleFontCatalog, "heading");
  const code = fontOptionsForRole(fallbackGoogleFontCatalog, "code");
  assert.ok(body.length >= 20);
  assert.ok(heading.length >= 20);
  assert.ok(code.length >= 8);
  assert.ok(body.every((option) => option.category !== "monospace"));
  assert.ok(code.every((option) => option.category === "monospace"));
});

test("live catalog merges popular and recent families, deduplicates, and retains supported weights", async () => {
  const calls = [];
  const responses = {
    popularity: [
      { family: "Inter", category: "sans-serif", variants: ["regular", "500", "600", "700", "800"], lastModified: "2026-01-01" },
      { family: "JetBrains Mono", category: "monospace", variants: ["regular", "500", "600", "700"], lastModified: "2025-01-01" },
    ],
    date: [
      { family: "Inter", category: "sans-serif", variants: ["regular", "500", "600", "700", "800"], lastModified: "2026-01-01" },
      { family: "New Sans", category: "sans-serif", variants: ["regular", "500", "600", "700", "800"], lastModified: "2026-06-01" },
      { family: "Display Only", category: "display", variants: ["regular"], lastModified: "2026-05-01" },
    ],
  };
  const request = async (url) => {
    const sort = new URL(url).searchParams.get("sort");
    calls.push(sort);
    return new Response(JSON.stringify({ items: responses[sort] }), { status: 200 });
  };

  const result = await loadGoogleFontCatalog("test-key", request);
  assert.equal(result.source, "google");
  assert.deepEqual(calls, ["popularity", "date"]);
  assert.equal(result.items.filter((font) => font.family === "Inter").length, 1);
  assert.equal(result.items.find((font) => font.family === "New Sans")?.featured, "recent");
  assert.ok(fontOptionsForRole(result.items, "body").some((option) => option.value === "New Sans"));
  assert.ok(!fontOptionsForRole(result.items, "heading").some((option) => option.value === "Display Only"));
});

test("catalog request failure and missing key return the offline catalog", async () => {
  const missing = await loadGoogleFontCatalog("");
  assert.equal(missing.source, "fallback");
  assert.equal(missing.items, fallbackGoogleFontCatalog);

  const failed = await loadGoogleFontCatalog("test-key", async () => new Response("no", { status: 503 }));
  assert.equal(failed.source, "fallback");
  assert.equal(failed.items, fallbackGoogleFontCatalog);
});
