import assert from "node:assert/strict";
import test from "node:test";
import {
  createGoogleFontCatalogCache,
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
  assert.ok([...body, ...heading, ...code].every((option) => option.preview === option.value));
  assert.ok([...body, ...heading, ...code].every((option) => option.meta === "The quick brown fox jumps over the lazy dog."));
  assert.ok(body.every((option) => option.previewWeights.join(",") === "400,700"));
  assert.ok(heading.every((option) => option.previewWeights.join(",") === "700"));
  assert.ok(code.every((option) => option.previewWeights.join(",") === "400,700"));
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

test("a Google Fonts request that never answers times out and returns the offline catalog", async () => {
  let signal;
  const request = (_url, init) => {
    signal = init?.signal;
    return new Promise(() => {});
  };
  const started = Date.now();
  const result = await loadGoogleFontCatalog("test-key", request, { timeoutMs: 30 });
  assert.equal(result.source, "fallback");
  assert.ok(Date.now() - started < 1000, "the request is abandoned after the timeout");
  assert.equal(signal?.aborted, true, "the hung request is aborted");
});

test("a rejected Google Fonts key is retried only after a cool-down, not on every visit", async () => {
  let now = 1_000;
  const calls = [];
  const cache = createGoogleFontCatalogCache({
    load: async (apiKey) => { calls.push(apiKey); return { source: "fallback", items: fallbackGoogleFontCatalog }; },
    now: () => now,
    retryAfterMs: 60_000,
  });
  assert.equal((await cache.get("wrong-key")).source, "fallback");
  assert.equal((await cache.get("wrong-key")).source, "fallback");
  assert.deepEqual(calls, ["wrong-key"]);
  now += 60_001;
  await cache.get("wrong-key");
  assert.deepEqual(calls, ["wrong-key", "wrong-key"]);
  await cache.get("new-key");
  assert.deepEqual(calls, ["wrong-key", "wrong-key", "new-key"]);
});

test("a working Google Fonts catalog stays cached", async () => {
  let loads = 0;
  const cache = createGoogleFontCatalogCache({
    load: async () => { loads += 1; return { source: "google", items: fallbackGoogleFontCatalog }; },
    now: () => 0,
  });
  await cache.get("key");
  await cache.get("key");
  assert.equal(loads, 1);
});

test("a Google Fonts response whose body never arrives also times out", async () => {
  const request = async () => ({ ok: true, json: () => new Promise(() => {}) });
  const started = Date.now();
  const result = await loadGoogleFontCatalog("test-key", request, { timeoutMs: 30 });
  assert.equal(result.source, "fallback");
  assert.ok(Date.now() - started < 1000);
});

test("visits that arrive while the catalog loads share one Google call", async () => {
  let loads = 0;
  let finish;
  const cache = createGoogleFontCatalogCache({
    load: () => { loads += 1; return new Promise((resolve) => { finish = resolve; }); },
    now: () => 0,
  });
  const first = cache.get("key");
  const second = cache.get("key");
  finish({ source: "google", items: fallbackGoogleFontCatalog });
  assert.equal((await first).source, "google");
  assert.equal((await second).source, "google");
  assert.equal(loads, 1);
});
