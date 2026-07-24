import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { fontOptionsForRole, loadGoogleFontCatalog } from "../../framework/fonts/catalog.ts";

let cachedKey = "";
let cachedCatalog: ReturnType<typeof loadGoogleFontCatalog> | undefined;

export const GET: APIRoute = async () => {
  const workerKey = (env as Record<string, unknown>).GOOGLE_FONTS_API_KEY;
  const apiKey = typeof workerKey === "string"
    ? workerKey
    : import.meta.env.GOOGLE_FONTS_API_KEY ?? "";
  if (!cachedCatalog || cachedKey !== apiKey) {
    cachedKey = apiKey;
    cachedCatalog = loadGoogleFontCatalog(apiKey);
  }
  const catalog = await cachedCatalog;
  if (catalog.source === "fallback" && apiKey) cachedCatalog = undefined;
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
