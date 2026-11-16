import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  compressHTML: true,
  // Prebuilt pages are written as `home.html`, so Cloudflare serves `/home` without a
  // redirect to `/home/` (the links and canonical addresses have no trailing slash).
  build: { format: "file" },
});
