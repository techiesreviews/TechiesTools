import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { patternCatalog, patternCategories, patternDefinitions } from "../src/patterns/registry.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("basic Pattern packages expose portable HTML, CSS, and focused settings", () => {
  for (const definition of patternDefinitions) {
    assert.match(definition.selector, /^\.pattern-/);
    assert.match(definition.html, new RegExp(`class="[^"]*${definition.selector.slice(1).split(".")[0]}`));
    assert.ok(definition.controls.every(({ options }) => options.length >= 2));
  }
});

test("Pattern package CSS consumes canonical Framework variables and interaction guidance", () => {
  const patterns = patternDefinitions.map(({ defaultCss, supportCss, controls }) => [
    defaultCss,
    supportCss ?? "",
    ...controls.flatMap(({ options }) => options.flatMap(({ declarations }) => declarations.map(({ value }) => value))),
  ].join("\n")).join("\n");

  for (const variable of [
    "--semantic-action",
    "--semantic-surface",
    "--semantic-text",
    "--semantic-border",
    "--semantic-focus",
    "--font-body",
    "--font-heading",
    "--text-m",
    "--space-m",
    "--radius-m",
  ]) {
    assert.match(patterns, new RegExp(`var\\(${variable.replace("--", "--")}`));
  }

  assert.match(patterns, /container: pattern-card/);
  assert.match(patterns, /:focus-visible/);
  assert.match(patterns, /\.pattern-card--clickable:has\(\.pattern-card__link:focus-visible\)/);
  const clickable = patternDefinitions.find(({ id }) => id === "clickable-card");
  assert.match(clickable?.html ?? "", /<h3><a class="pattern-card__link"[^>]*>Open Framework<\/a><\/h3>/);
  assert.doesNotMatch(clickable?.html ?? "", /<a class="pattern-card__link"[^>]*><\/a>/);
});

test("Patterns route publishes the catalog as a filterable visual index and is active in Main menu", () => {
  const page = read("src", "pages", "patterns.astro");
  const sidebar = read("src", "components", "dashboard", "AppSidebar.astro");
  const global = read("src", "styles", "global.css");

  assert.equal(patternCatalog.length, 4);
  assert.deepEqual(patternCategories, ["Actions", "Metadata", "Content", "Navigation"]);
  assert.match(page, /<title>Patterns &mdash; techies\.tools<\/title>/);
  assert.match(page, /styles\/global\.css/);
  assert.match(page, /Browse patterns/);
  assert.match(page, /patternDefinitions\.map/);
  assert.match(page, /data-pattern-filter/);
  assert.match(page, /data-pattern-card/);
  assert.match(page, /href=\{`\/patterns\/\$\{definition\.id\}`\}/);
  assert.match(page, /<h2><a class="patterns-library__link"[^>]*>\{definition\.title\}<\/a><\/h2>/);
  assert.doesNotMatch(page, /<a class="patterns-library__link"[^>]*><\/a>/);
  assert.match(page, /\.patterns-library__link::after/);
  assert.match(page, /--pattern-preview-scale/);
  assert.match(page, /--pattern-preview-inverse/);
  assert.match(page, /inline-size:calc\(100% \* var\(--pattern-preview-inverse,1\)\)/);
  assert.match(page, /filterPatterns/);
  assert.match(page, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(page, /@media \(max-width:720px\)/);
  assert.match(sidebar, /label="Patterns"[^>]*badge=\{String\(patternCatalog\.length\)\}[^>]*href="\/patterns"[^>]*active=\{currentPath\.startsWith\("\/patterns"\)\}/);
  assert.match(sidebar, /const toolVersion = `v\$\{packageMetadata\.version\}`/);
  assert.match(sidebar, /label="Framework"[^>]*badge=\{toolVersion\}/);
  assert.match(sidebar, /label="Glass card"[^>]*badge=\{toolVersion\}/);
  assert.doesNotMatch(sidebar, /badge="Beta"/);
  assert.doesNotMatch(global, /patterns\.css/);
});

test("Component Guidance records the promoted Starter patterns and canonical route", () => {
  const guidance = read("docs", "framework", "component-guidance.md");

  assert.match(guidance, /\/patterns/);
  for (const name of ["Button", "Badge", "Card", "Clickable card"]) {
    assert.match(guidance, new RegExp(`\\*\\*${name}\\*\\*`));
  }
  assert.doesNotMatch(guidance, /\*\*(?:Section|Container)\*\*/);
});
