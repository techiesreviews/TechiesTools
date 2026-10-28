import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { appPath, appsPath, homePath, homeSections, showcaseApps } from "../src/showcase/projects.ts";
import { patternCatalog } from "../src/patterns/registry.ts";
import { normalizeSearchText, searchSite } from "../src/shared/site-search.ts";
import { siteSearchEntries } from "../src/shared/site-search-index.ts";

const read = (...parts) => readFileSync(join(process.cwd(), ...parts), "utf8");
const entries = siteSearchEntries();
const titles = (query) => searchSite(entries, query).map(({ title }) => title);

test("site search lists every app, page, pattern, and Home page section once", () => {
  const hrefs = entries.map(({ href }) => href);
  assert.equal(new Set(hrefs).size, hrefs.length);
  for (const app of showcaseApps) assert.ok(hrefs.includes(appPath(app)), app.name);
  for (const pattern of patternCatalog) assert.ok(hrefs.includes(pattern.href), pattern.title);
  for (const section of homeSections) assert.ok(hrefs.includes(`${homePath}#${section.id}`), section.label);
  for (const path of [homePath, appsPath, "/changelog", "/framework/design-system", "/framework/homepage", "/framework/elements", "/tools/glass-card", "https://script.techies.tools"]) assert.ok(hrefs.includes(path), path);
  assert.ok(entries.filter(({ href }) => href.startsWith("https://")).every(({ external }) => external));
  assert.ok(entries.filter(({ href }) => href.startsWith("/")).every(({ external }) => !external));
});

test("site search ranks title matches first and needs every word to match", () => {
  assert.deepEqual(searchSite(entries, ""), entries);
  assert.equal(titles("prompter")[0], "Prompter");
  assert.equal(titles("PROM")[0], "Prompter");
  assert.equal(titles("script")[0], "Script editor");
  assert.equal(titles("glass")[0], "Glass card");
  assert.ok(titles("element reference").includes("Element reference"));
  assert.ok(titles("teleprompter").includes("Prompter"), "matches hidden keywords such as the app kind");
  assert.ok(titles("privacy").includes("Security and privacy"));
  assert.deepEqual(titles("prompter zzzz"), []);
  assert.deepEqual(titles("   "), entries.map(({ title }) => title));
  assert.equal(normalizeSearchText("  Crème   Brûlée "), "creme brulee");
});

test("Ctrl K and Cmd K open the search dialog from every page with the Main menu", () => {
  const sidebar = read("src", "components", "dashboard", "AppSidebar.astro");
  const field = read("src", "components", "ui", "SearchField.astro");
  const dialog = read("src", "components", "dashboard", "SiteSearch.astro");

  assert.match(sidebar, /<SiteSearch \/>/);
  assert.match(field, /<button class="search-field" type="button" aria-haspopup="dialog" aria-keyshortcuts="Control\+K Meta\+K"[^>]*data-site-search-open>/);
  assert.doesNotMatch(field, /posts/);
  assert.match(dialog, /event\.key\.toLowerCase\(\) !== "k" \|\| !\(event\.ctrlKey \|\| event\.metaKey\)/);
  assert.match(dialog, /dialog\.showModal\(\)/);
  assert.match(dialog, /role="combobox"[\s\S]*aria-controls="site-search-results"/);
  assert.match(dialog, /role="listbox"/);
  // The index is serialized into the page, so a "<" in any entry must not end the script early.
  assert.match(dialog, /JSON\.stringify\(siteSearchEntries\(\)\)\.replace\(\/<\/g, "\\\\u003c"\)/);
});
