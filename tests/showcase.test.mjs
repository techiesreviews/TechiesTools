import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { frameworkRoutes } from "../src/framework/routes.ts";
import { githubOrganization, githubRepositoryApiUrl, githubRepositoryUrl, homePath, showcaseAddresses, showcaseProjects, showcaseRepositories, showcaseTools } from "../src/showcase/projects.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("Home page renders at the root and at /home and keeps legacy variant links working", () => {
  const index = read("src", "pages", "index.astro");
  const home = read("src", "pages", "home.astro");
  const page = read("src", "components", "showcase", "HomePage.astro");

  assert.equal(homePath, "/home");
  assert.match(index, /searchParams\.get\("variant"\)/);
  assert.match(index, /if \(legacyVariant !== null\) return Astro\.redirect/);
  for (const route of [index, home]) assert.match(route, /<HomePage \/>/);
  assert.doesNotMatch(home, /Astro\.redirect/);
  assert.match(page, /<AppSidebar \/>/);
  assert.match(page, /<link rel="canonical" href="https:\/\/techies\.tools\/" \/>/);
  for (const id of ["why", "tools", "projects", "security", "open-source", "addresses"]) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
});

test("Home page tools link to every canonical Framework page and site tool", () => {
  const hrefs = showcaseTools.flatMap(({ links }) => links.map(({ href }) => href));

  for (const route of frameworkRoutes) assert.ok(hrefs.includes(route.path), route.path);
  for (const path of ["/patterns", "/tools/glass-card", "/changelog"]) assert.ok(hrefs.includes(path), path);
});

test("Home page projects state their problem, fix, privacy, and public links", () => {
  for (const project of showcaseProjects) {
    assert.ok(project.problem && project.fix && project.summary, project.name);
    assert.ok(project.features.length >= 3, project.name);
    assert.ok(project.privacy.length >= 2, project.name);
    assert.match(project.primary.href, /^https:\/\//, project.name);
  }

  assert.equal(showcaseRepositories[0].repository, "TechiesTools");
  for (const { repository } of showcaseRepositories) {
    assert.equal(githubRepositoryUrl(repository), `${githubOrganization}/${repository}`);
    assert.equal(githubRepositoryApiUrl(repository), `https://api.github.com/repos/techiesreviews/${repository}`);
  }
  assert.ok(showcaseAddresses.every(({ host, href }) => href === `https://${host}` && host.endsWith("techies.tools")));
  assert.ok(showcaseAddresses.some(({ test }) => test));
});

test("Main menu links to the Home page and the Changelog opens the Framework directly", () => {
  const sidebar = read("src", "components", "dashboard", "AppSidebar.astro");
  const changelog = read("src", "pages", "changelog.astro");

  assert.match(sidebar, /<SidebarItem label="Home" icon="House" href=\{homePath\} active=\{currentPath === "\/" \|\| currentPath === homePath\} \/>/);
  assert.match(sidebar, /href=\{`\$\{homePath\}#tools`\}/);
  assert.match(changelog, /<a href="\/framework\/design-system">Open Framework/);
  assert.doesNotMatch(changelog, /<a href="\/">/);
});
