import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { build } from "astro";
import { showcaseApps } from "../src/showcase/projects.ts";
import { createElementGuidance } from "../src/framework/catalog/guidance-payload.ts";
import { createStartupQueue } from "../src/framework/controller/startup-queue.ts";
import { hasSavedElementEdits } from "../src/framework/preferences/index.ts";
import { createCssTreeLoader, cssTree, isCssTreeLoaded } from "../src/shared/css-tree.ts";
import { createLatestTaskScheduler } from "../src/framework/controller/latest-task.ts";

// The Cloudflare prerender step fails for an output folder outside the project, so the
// test builds into an ignored cache folder inside it.
const cache = join(process.cwd(), "node_modules", ".cache");
mkdirSync(cache, { recursive: true });
const outDir = mkdtempSync(join(cache, "site-speed-"));
// A build points `.wrangler/deploy/config.json` at its output; put back what the project's
// own build wrote, so `astro preview` and `wrangler deploy` keep using `dist/`.
const deployRedirect = join(process.cwd(), ".wrangler", "deploy", "config.json");
const savedDeployRedirect = existsSync(deployRedirect) ? readFileSync(deployRedirect, "utf8") : null;
let built;
const buildOnce = () => built ??= build({ root: process.cwd(), outDir, logLevel: "error" });
test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
  if (savedDeployRedirect === null) rmSync(deployRedirect, { force: true });
  else writeFileSync(deployRedirect, savedDeployRedirect);
});

test("pages that never change between visits are built once at deploy", async () => {
  await buildOnce();
  const client = join(outDir, "client");
  const prebuilt = ["home", "apps", "changelog", "tools/glass-card", ...showcaseApps.map((app) => `apps/${app.id}`)];
  for (const path of prebuilt) {
    const html = readFileSync(join(client, `${path}.html`), "utf8");
    assert.match(html, /^<!DOCTYPE html>/i, path);
  }
  assert.match(readFileSync(join(client, "apps/framework.html"), "utf8"), /<link rel="canonical" href="https:\/\/techies\.tools\/apps\/framework">/);
  assert.match(readFileSync(join(client, "tools/glass-card.html"), "utf8"), /<link rel="canonical" href="https:\/\/techies\.tools\/tools\/glass-card">/);
  // A prebuilt page still marks its own Main menu entry as the current page.
  for (const [file, href] of [["home", "/home"], ["apps", "/apps"], ["changelog", "/changelog"], ["apps/framework", "/apps/framework"], ["tools/glass-card", "/apps/glass-card"]]) {
    assert.match(readFileSync(join(client, `${file}.html`), "utf8"), new RegExp(`class="sidebar-item sidebar-item--active" href="${href}" aria-current="page"`), file);
  }
  // Only listed apps get a page; any other `/apps/<id>` matches no route and answers 404.
  assert.deepEqual(readdirSync(join(client, "apps")).sort(), showcaseApps.map((app) => `${app.id}.html`).sort());
  const serverRoutes = readdirSync(join(outDir, "server"), { recursive: true }).join("\n");
  assert.doesNotMatch(serverRoutes, /_app_|\[app\]/);
  // `/` keeps reading `?variant=`, and the Framework and Pattern pages keep their per-visit work.
  for (const path of ["index", "framework/design-system", "patterns", "patterns/button"]) {
    assert.equal(existsSync(join(client, `${path}.html`)), false, path);
  }
});

test("the Framework pages' first-load scripts leave the CSS parser out", async () => {
  await buildOnce();
  const assets = join(outDir, "client", "_astro");
  const chunks = readdirSync(assets).filter((file) => file.endsWith(".js"));
  const parser = chunks.filter((file) => readFileSync(join(assets, file), "utf8").includes("AtrulePrelude"));
  assert.ok(parser.length, "the CSS parser still ships as its own chunk");
  const staticImports = (file) => [...readFileSync(join(assets, file), "utf8").matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)].map((match) => match[1]);
  const closure = (entry) => {
    const seen = new Set([entry]);
    for (const file of seen) staticImports(file).forEach((next) => seen.add(next));
    return seen;
  };
  const frameworkEntries = chunks.filter((file) => /^(?:DashboardShell|FrameworkSettingsBar|DesignSystemPreview|TreatmentCssEditor|CodeEditorSurface|CodeEditor|FrameworkExportDialog|FrameworkCombobox|AppShell|AppSidebar)\.astro_astro_type_script/.test(file));
  assert.ok(frameworkEntries.some((file) => file.startsWith("DashboardShell.")), "the Framework controller script was found");
  for (const entry of frameworkEntries) {
    for (const file of closure(entry)) assert.equal(parser.includes(file), false, `${entry} loads ${file} up front`);
  }
  const patternEntry = chunks.find((file) => file.startsWith("PatternPreview.astro_astro_type_script"));
  assert.ok([...closure(patternEntry)].some((file) => parser.includes(file)), "Pattern pages, which compile saved patterns at once, still load it up front");
});

test("Pattern pages load the CSS parser before any module that parses", () => {
  const controller = readFileSync(join(process.cwd(), "src", "patterns", "controller", "browser.ts"), "utf8");
  assert.equal(controller.split("\n")[0], 'import "../../shared/css-tree-eager.ts";');
});

test("the CSS parser is ready at once outside a browser, for server renders and tests", () => {
  assert.equal(isCssTreeLoaded(), true);
  assert.equal(typeof cssTree().parse, "function");
});

test("only saved Element edits make the Framework load the CSS parser when it opens", () => {
  const storage = (entries) => ({ getItem: (key) => entries[key] ?? null });
  assert.equal(hasSavedElementEdits(storage({})), false);
  assert.equal(hasSavedElementEdits(storage({ "techies-tools:framework:primitive-diffs:v1": "{}" })), false);
  for (const key of ["element-diffs:v2", "element-diffs:v1", "rule-drafts:v2", "rule-drafts:v1"]) {
    assert.equal(hasSavedElementEdits(storage({ [`techies-tools:framework:${key}`]: "{}" })), true, key);
  }
  assert.equal(hasSavedElementEdits({ getItem: () => { throw new Error("blocked"); } }), false);
  assert.equal(hasSavedElementEdits(null), false);
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("Framework events run at once when nothing waits, and in order behind a start or a parser load", async () => {
  const seen = [];
  const now = createStartupQueue({ start: () => seen.push("start"), startNeedsParser: false, loadParser: async () => {}, parserLoaded: () => true, report: assert.fail });
  now.begin();
  now.afterStart((event) => seen.push(event))("sync");
  assert.deepEqual(seen, ["start", "sync"]);

  let finishParser;
  let parserReady = false;
  let parserLoads = 0;
  let download;
  const parser = new Promise((resolve) => { finishParser = resolve; });
  const queued = [];
  const later = createStartupQueue({
    start: () => queued.push("start"),
    startNeedsParser: true,
    loadParser: () => download ??= (parserLoads += 1, parser.then(() => { parserReady = true; })),
    parserLoaded: () => parserReady,
    report: assert.fail,
  });
  later.begin();
  later.afterStart((event) => queued.push(event))("before start");
  later.afterStart((event) => queued.push(event), true)("edit");
  later.afterStart((event) => queued.push(event))("after edit");
  assert.deepEqual(queued, []);
  finishParser();
  await settle();
  assert.deepEqual(queued, ["start", "before start", "edit", "after edit"]);
  later.afterStart((event) => queued.push(event), true)("next edit");
  assert.equal(queued.at(-1), "next edit");
  assert.equal(parserLoads, 1);
});

test("a failed parser download is reported, and the next event tries again", async () => {
  const reported = [];
  const handled = [];
  let attempts = 0;
  let parserReady = false;
  const queue = createStartupQueue({
    start: () => handled.push("start"),
    startNeedsParser: true,
    loadParser: async () => {
      if (parserReady) return;
      attempts += 1;
      if (attempts === 1) throw new Error("offline");
      parserReady = true;
    },
    parserLoaded: () => parserReady,
    report: (error) => reported.push(error.message),
  });
  queue.begin();
  await settle();
  assert.deepEqual(reported, ["offline"]);
  assert.deepEqual(handled, []);
  queue.afterStart((event) => handled.push(event), true)("edit");
  await settle();
  assert.deepEqual(handled, ["start", "edit"]);
  assert.equal(attempts, 2);
});

test("a Framework start that throws is tried again by the next event", async () => {
  const handled = [];
  let starts = 0;
  const queue = createStartupQueue({
    start: () => { starts += 1; if (starts === 1) throw new Error("bad"); },
    startNeedsParser: false,
    loadParser: async () => {},
    parserLoaded: () => true,
    report: assert.fail,
  });
  assert.throws(() => queue.begin(), /bad/);
  queue.afterStart((event) => handled.push(event))("next");
  await settle();
  assert.equal(starts, 2);
  assert.deepEqual(handled, ["next"]);
});

test("events queued behind a start whose parser download fails run once a later try succeeds", async () => {
  const reported = [];
  const handled = [];
  let attempts = 0;
  let parserReady = false;
  const queue = createStartupQueue({
    start: () => handled.push("start"),
    startNeedsParser: true,
    loadParser: async () => {
      if (parserReady) return;
      attempts += 1;
      if (attempts === 1) throw new Error("offline");
      parserReady = true;
    },
    parserLoaded: () => parserReady,
    report: (error) => reported.push(error.message),
  });
  queue.begin();
  queue.afterStart((event) => handled.push(event))("first");
  queue.afterStart((event) => handled.push(event), true)("second");
  await settle();
  assert.deepEqual(reported, ["offline"]);
  assert.deepEqual(handled, ["start", "first", "second"]);
  assert.equal(attempts, 2);
});

test("a flush inside a queued handler applies the pending colour before the handler goes on", async () => {
  const order = [];
  let finishParser;
  let parserReady = false;
  let download;
  const parser = new Promise((resolve) => { finishParser = resolve; });
  const { afterStart, begin } = createStartupQueue({
    start: () => {},
    startNeedsParser: false,
    loadParser: () => download ??= parser.then(() => { parserReady = true; }),
    parserLoaded: () => parserReady,
    report: assert.fail,
  });
  begin();
  const updates = createLatestTaskScheduler((value) => order.push(value), (callback) => setTimeout(afterStart(callback), 250), clearTimeout);
  updates.schedule("primitive");
  afterStart(() => { updates.flush(); order.push("export"); }, true)();
  finishParser();
  await settle();
  assert.deepEqual(order, ["primitive", "export"]);
  // The Framework controller wires its 250 ms primitive updates the same way.
  const browser = readFileSync(join(process.cwd(), "src", "framework", "controller", "browser.ts"), "utf8");
  assert.match(browser, /\(callback\) => window\.setTimeout\(afterStart\(callback\), 250\)/);
});

test("a failed CSS parser download is tried again, and a finished one is never fetched twice", async () => {
  let calls = 0;
  const failing = createCssTreeLoader(async () => { calls += 1; throw new Error("offline"); });
  await assert.rejects(failing.load(), /offline/);
  await assert.rejects(failing.load(), /offline/);
  assert.equal(calls, 2);
  assert.equal(failing.loaded(), false);
  assert.throws(() => failing.get(), /not loaded yet/);

  let fetches = 0;
  const api = { generate() {}, parse() {}, walk() {} };
  const working = createCssTreeLoader(async () => { fetches += 1; return api; });
  assert.equal(await working.load(), api);
  assert.equal(await working.load(), api);
  assert.equal(fetches, 1);
  assert.equal(working.get(), api);
});

test("a Framework event that throws is reported and does not stop the ones behind it", async () => {
  const reported = [];
  const handled = [];
  const queue = createStartupQueue({ start: () => {}, startNeedsParser: true, loadParser: async () => {}, parserLoaded: () => true, report: (error) => reported.push(error.message) });
  queue.begin();
  queue.afterStart(() => { throw new Error("broken"); })("first");
  queue.afterStart((event) => handled.push(event))("second");
  await settle();
  assert.deepEqual(reported, ["broken"]);
  assert.deepEqual(handled, ["second"]);
});

test("Framework pages read, check and serialize the Element guidance once, not per request", async () => {
  let loads = 0;
  let checks = 0;
  const guidance = createElementGuidance(async () => {
    loads += 1;
    return [{ id: "a", summary: "</script><b>" }];
  }, () => { checks += 1; return "catalog"; });
  const [first, second] = await Promise.all([guidance(), guidance()]);
  assert.equal(await guidance(), first);
  assert.equal(second, first);
  assert.equal(loads, 1);
  assert.equal(checks, 1);
  assert.equal(first.catalog, "catalog");
  assert.equal(first.serializedGuidance, '[{"id":"a","summary":"\\u003c/script>\\u003cb>"}]');

  await assert.rejects(createElementGuidance(async () => [{}])(), /catalog\.guidance/);
  // Both components that need the Element Catalog take it from the shared memo.
  for (const component of ["DashboardShell.astro", "ElementsAccordion.astro"]) {
    const source = readFileSync(join(process.cwd(), "src", "components", "dashboard", component), "utf8");
    assert.match(source, /await elementGuidance\(\)/, component);
    assert.doesNotMatch(source, /getCollection\(|buildElementCatalog\(/, component);
  }
});
