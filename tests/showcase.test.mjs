import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { frameworkRoutes } from "../src/framework/routes.ts";
import { appPath, githubOrganization, githubRepositoryApiUrl, githubRepositoryUrl, homePath, maker, showcaseAddresses, showcaseApp, showcaseApps, showcaseRepositories } from "../src/showcase/projects.ts";

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
  assert.match(page, /canonical="https:\/\/techies\.tools\/"/);
  for (const id of ["apps", "security", "open-source", "addresses", "maker"]) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
});

test("every app has its own landing page with a story, features, privacy, and a way in", () => {
  const route = read("src", "pages", "apps", "[app].astro");
  const page = read("src", "components", "showcase", "AppPage.astro");

  assert.match(route, /showcaseApp\(Astro\.params\.app/);
  assert.match(route, /if \(!app\) return new Response\("Not found", \{ status: 404/);
  assert.match(page, /canonical=\{`https:\/\/techies\.tools\$\{appPath\(app\)\}`\}/);
  assert.equal(new Set(showcaseApps.map(({ id }) => id)).size, showcaseApps.length);

  for (const app of showcaseApps) {
    assert.equal(showcaseApp(app.id), app);
    assert.equal(appPath(app), `/apps/${app.id}`);
    assert.match(app.id, /^[a-z0-9-]+$/);
    assert.ok(app.tagline && app.summary && app.problem && app.fix, app.name);
    assert.ok(app.features.length >= 3 && app.features.every(({ title, text }) => title && text), app.name);
    assert.ok(app.privacy.length >= 2, app.name);
    if (app.comingSoon) assert.equal(app.primary, undefined, app.name);
    else if (app.home === "site") assert.match(app.primary.href, /^\//, app.name);
    else assert.match(app.primary.href, /^https:\/\//, app.name);
    if (app.image) assert.ok(existsSync(join(root, "public", app.image)), app.image);
  }
});

test("site apps link to every canonical Framework page and site tool", () => {
  const hrefs = showcaseApps.filter(({ home }) => home === "site").flatMap(({ primary, links = [] }) => [primary?.href, ...links.map(({ href }) => href)]);

  for (const route of frameworkRoutes) assert.ok(hrefs.includes(route.path), route.path);
  for (const path of ["/patterns", "/tools/glass-card"]) assert.ok(hrefs.includes(path), path);
});

test("GitHub links, licences, maker links, and addresses stay accurate", () => {
  assert.equal(showcaseRepositories[0].repository, "TechiesTools");
  assert.equal(new Set(showcaseRepositories.map(({ repository }) => repository)).size, showcaseRepositories.length);
  for (const { repository } of showcaseRepositories) {
    assert.equal(githubRepositoryUrl(repository), `${githubOrganization}/${repository}`);
    assert.equal(githubRepositoryApiUrl(repository), `https://api.github.com/repos/techiesreviews/${repository}`);
  }
  // Every public repository carries the MIT LICENSE file on GitHub; apps without public code claim none.
  assert.ok(showcaseApps.every(({ repository, license }) => (repository ? license === "MIT" : license === undefined)));
  assert.ok(showcaseRepositories.every(({ license }) => license === "MIT"));
  assert.match(read("LICENSE"), /^MIT License\n\nCopyright \(c\) 2026 Lex \(Techies Reviews\)/);
  assert.ok(existsSync(join(root, "public", maker.photo)));
  assert.ok(maker.links.every(({ href }) => href.startsWith("https://")));
  assert.ok(showcaseAddresses.every(({ host, href }) => href === `https://${host}` && host.endsWith("techies.tools")));
  // Only live apps are listed: no test versions and no retired experiments.
  assert.ok(showcaseAddresses.every(({ host }) => !host.startsWith("preview")));
  assert.deepEqual(showcaseAddresses.map(({ host }) => host), ["techies.tools", ...showcaseApps.filter(({ home, address }) => home === "subdomain" && address).map(({ address }) => address)]);
  assert.equal(showcaseApp("astro-live-builder"), undefined);
  assert.ok(showcaseRepositories.some(({ repository }) => repository === "native-site-editor-starter"));
});

test("Main menu links to the Home page and app pages, and the Changelog opens the Framework directly", () => {
  const sidebar = read("src", "components", "dashboard", "AppSidebar.astro");
  const changelog = read("src", "pages", "changelog.astro");

  assert.match(sidebar, /<SidebarItem label="Home" icon="House" href=\{homePath\} active=\{currentPath === "\/" \|\| currentPath === homePath\} \/>/);
  assert.match(sidebar, /label="Apps"[^>]*href=\{`\$\{homePath\}#apps`\}[^>]*active=\{currentPath\.startsWith\("\/apps\/"\)\}/);
  // The Techies group makes the menu taller than short screens, so it must scroll rather than clip.
  assert.match(sidebar, /\.app-sidebar__nav \{[^}]*overflow-y: auto;/);
  assert.match(changelog, /<a href="\/framework\/design-system">Open Framework/);
  assert.doesNotMatch(changelog, /<a href="\/">/);
});
