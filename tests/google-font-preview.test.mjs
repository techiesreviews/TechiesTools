import assert from "node:assert/strict";
import test from "node:test";
import {
  FONT_PREVIEW_TEXT,
  googleFontPreviewStylesheetUrl,
} from "../src/framework/fonts/preview.ts";

test("font preview URL loads only safe unique families and preview glyphs", () => {
  const url = new URL(googleFontPreviewStylesheetUrl([
    { family:"Inter", weights:[700,400] },
    { family:"Bricolage Grotesque", weights:[700,800] },
    { family:"Inter", weights:[400] },
    { family:"Bad;family", weights:[400] },
  ]));

  assert.equal(url.origin, "https://fonts.googleapis.com");
  assert.equal(url.pathname, "/css2");
  assert.deepEqual(url.searchParams.getAll("family"), [
    "Inter:wght@400;700",
    "Bricolage Grotesque:wght@700;800",
  ]);
  assert.equal(url.searchParams.get("display"), "swap");
  assert.match(url.searchParams.get("text") ?? "", new RegExp(FONT_PREVIEW_TEXT));
  assert.match(url.searchParams.get("text") ?? "", /Bricolage Grotesque/);
});

test("font preview URL stays empty when no safe families remain", () => {
  assert.equal(googleFontPreviewStylesheetUrl([
    { family:"Bad;family", weights:[400] },
    { family:"Inter", weights:[Number.NaN] },
  ]), "");
});
