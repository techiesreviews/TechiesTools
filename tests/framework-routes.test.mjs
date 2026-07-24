import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  canonicalFrameworkRoute,
  frameworkRouteForLegacyVariant,
  frameworkRouteForPathname,
} from "../src/framework/routes.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("Framework routes provide stable canonical paths and page metadata", () => {
  assert.deepEqual(canonicalFrameworkRoute("design-system"), {
    key: "design-system",
    path: "/framework/design-system",
    variant: "A",
    title: "Design system | Techies Framework",
    description: "Framework primitives, semantic roles, accessibility evidence, and generated values.",
  });
  assert.equal(canonicalFrameworkRoute("elements")?.path, "/framework/elements");
  assert.equal(canonicalFrameworkRoute("homepage")?.path, "/framework/homepage");
});

test("canonical route lookup maps direct paths and legacy variants", () => {
  assert.equal(frameworkRouteForPathname("/framework/design-system")?.key, "design-system");
  assert.equal(frameworkRouteForPathname("/framework/elements")?.variant, "E");
  assert.equal(frameworkRouteForPathname("/framework/missing"), undefined);
  assert.equal(frameworkRouteForLegacyVariant("A")?.path, "/framework/design-system");
  assert.equal(frameworkRouteForLegacyVariant("B")?.path, "/framework/homepage");
  assert.equal(frameworkRouteForLegacyVariant("E")?.path, "/framework/elements");
  assert.equal(frameworkRouteForLegacyVariant(null)?.path, "/framework/design-system");
});

test("canonical Framework pages server-render selected metadata and the editor deep-links to its element", () => {
  const index = read("src", "pages", "index.astro");
  const page = read("src", "pages", "framework", "[page].astro");
  const preview = read("src", "components", "dashboard", "DesignSystemPreview.astro");
  const editor = read("src", "components", "dashboard", "ElementsAccordion.astro");

  assert.match(index, /frameworkRouteForLegacyVariant/);
  assert.match(index, /Astro\.redirect/);
  assert.match(page, /<link rel="canonical" href=\{canonical\}/);
  assert.match(page, /<meta name="description" content=\{route\.description\}/);
  assert.match(page, /<DesignSystemPreview initialVariant=\{route\.variant\}/);
  assert.match(preview, /frameworkRoutes\.map/);
  assert.match(preview, /id="framework-routes"/);
  assert.match(preview, /JSON\.parse\(document\.querySelector<HTMLScriptElement>\("#framework-routes"\)/);
  assert.doesNotMatch(preview, /path:"\/framework\//);
  assert.match(preview, /window\.location\.assign\(path\)/);
  assert.doesNotMatch(preview, /window\.history\.replaceState/);
  assert.match(editor, /canonicalFrameworkRoute\("elements"\)!\.path/);
  assert.match(editor, /data-element-reference-path=\{elementReferencePath\}/);
  assert.match(editor, /link\.href=`\$\{elementReferencePath\}#\$\{value\}`/);
  assert.doesNotMatch(editor, /\/framework\/elements/);
});

test("preview address keeps the original flat toolbar treatment", () => {
  const preview = read("src", "components", "dashboard", "DesignSystemPreview.astro");

  assert.doesNotMatch(preview, /<Lock\b/);
  assert.match(
    preview,
    /form\.framework-prototype__address > input \{[^}]*width:100%;[^}]*max-width:none;[^}]*height:30px;[^}]*min-height:0;[^}]*border:0;[^}]*border-radius:0;[^}]*padding:0;/,
  );
  assert.doesNotMatch(preview, /\.framework-prototype__address input:hover \{/);
});

test("preview viewport controls remain square despite generated button treatments", () => {
  const preview = read("src", "components", "dashboard", "DesignSystemPreview.astro");

  assert.match(
    preview,
    /\.framework-prototype__devices button \{[^}]*width:40px;[^}]*height:40px;[^}]*border-radius:0;[^}]*padding:0;/,
  );
});
