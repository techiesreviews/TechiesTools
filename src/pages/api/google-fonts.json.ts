import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createGoogleFontCatalogCache, fontOptionsForRole } from "../../framework/fonts/catalog.ts";

const catalogCache = createGoogleFontCatalogCache();

export const GET: APIRoute = async () => {
  const workerKey = (env as Record<string, unknown>).GOOGLE_FONTS_API_KEY;
  const apiKey = typeof workerKey === "string"
    ? workerKey
    : import.meta.env.GOOGLE_FONTS_API_KEY ?? "";
  const catalog = await catalogCache.get(apiKey);
  return new Response(JSON.stringify({
    source: catalog.source,
    roles: {
      body: fontOptionsForRole(catalog.items, "body"),
      heading: fontOptionsForRole(catalog.items, "heading"),
      code: fontOptionsForRole(catalog.items, "code"),
    },
  }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": catalog.source === "google"
        ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
        : "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    },
  });
};
