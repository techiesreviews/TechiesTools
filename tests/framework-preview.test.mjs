import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("Homepage Preview B consumes Framework semantic roles through stable aliases", () => {
  const source = read("src", "components", "dashboard", "FrameworkPreviewVariantB.prototype.astro");

  for (const role of ["primary", "action", "surface", "text", "border", "focus"]) {
    assert.match(source, new RegExp(`--b-${role}:var\\(--semantic-${role}`));
  }
  assert.doesNotMatch(source, /var\(--color-primary(?:[-,)]|$)/);
  assert.match(source, /--primary:var\(--b-primary\)/);
  assert.match(source, /--text-body:var\(--b-text\)/);
  assert.match(source, /--bg-surface:var\(--b-surface\)/);
  assert.match(source, /\.site-b \.btn\{[^}]*--btn-color:var\(--b-action\)/);
  assert.match(source, /\.site-b \.btn\.ghost\{--btn-color:var\(--b-action\)/);
  assert.match(source, /\.site-b a:focus-visible\{outline:4px solid var\(--b-focus\)/);
  assert.match(source, /\.site-b \.badge\{[^}]*color:var\(--b-primary\)/);
  assert.match(source, /\.site-b__hero-copy h1 em\{color:var\(--b-primary\)/);
  assert.match(source, /\.site-b__eyebrow\{color:var\(--b-primary\)/);
  assert.match(source, /--primary-lightest:color-mix\(in oklch,var\(--b-primary\)/);
});

test("active Preview variants receive generated color variables without an A-only color grid", () => {
  const source = read("src", "components", "dashboard", "DesignSystemPreview.astro");
  const colorStart = source.indexOf("const renderColors");
  const renderColors = source.slice(colorStart, source.indexOf("const renderSpacing", colorStart));

  assert.match(renderColors, /if \(!root\) return;/);
  assert.match(renderColors, /colors\.forEach\(\(color\) => \{[\s\S]*?root\.style\.setProperty\(variable,color\.value\)/);
  assert.match(renderColors, /const container = root\.querySelector<HTMLElement>\("\[data-fp-colors\]"\);/);
  assert.match(renderColors, /if \(container\) container\.innerHTML = colors\.map/);
  assert.match(renderColors, /renderSemantics\(colors\);/);
});

test("active Preview variants receive automatic type, radius, and spacing tokens without A specimens", () => {
  const source = read("src", "components", "dashboard", "DesignSystemPreview.astro");
  const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  const type = section("const renderTypeScale", "const escapeHtml");
  const radii = section("const renderRadii", "renderSemantics");
  const spacing = section("const renderSpacing", "const renderRadii");

  assert.match(type, /if \(!root\) return;/);
  assert.match(type, /tokenValues\.forEach\(\(token\) => \{[\s\S]*?root\.style\.setProperty\(variable/);
  assert.match(type, /root\.querySelectorAll<HTMLElement>\("\[data-type-step\]"\)/);
  assert.match(spacing, /if \(!root\) return;/);
  assert.match(spacing, /spacing\.tokens\.forEach\(\(token, index\) => root\.style\.setProperty/);
  assert.match(spacing, /if \(container\) container\.innerHTML/);
  assert.match(radii, /if \(!root\) return;/);
  assert.match(radii, /radii\.tokens\.forEach\(\(token\) => \{[\s\S]*?root\.style\.setProperty/);
  assert.match(radii, /if \(container\) container\.innerHTML/);
});
