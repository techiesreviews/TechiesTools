import assert from "node:assert/strict";
import test from "node:test";
import { cssLayer, fontImportRule, layerOrder, patternLayers, safeFontStylesheet } from "../src/css-layers/index.ts";

test("layer order is declared once for Framework and Pattern outputs", () => {
  assert.equal(layerOrder(), "@layer tokens, elements, utilities, components;");
  assert.equal(layerOrder(patternLayers), "@layer tokens, elements, utilities, components, patterns;");
  assert.equal(cssLayer("utilities", ".x {}"), "@layer utilities {\n.x {}\n}");
});

test("font imports accept only Google Fonts css2 stylesheets", () => {
  const href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";
  assert.equal(safeFontStylesheet(href), href);
  assert.equal(safeFontStylesheet("https://example.com/css2"), undefined);
  assert.equal(safeFontStylesheet("not a url"), undefined);
  assert.equal(fontImportRule(href, "tokens"), `@import url("${href}") layer(tokens);`);
});
