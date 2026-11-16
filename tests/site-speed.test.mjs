import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { build } from "astro";
import { showcaseApps } from "../src/showcase/projects.ts";
import { createElementGuidancePayload } from "../src/framework/catalog/guidance-payload.ts";
import { createStartupQueue } from "../src/framework/controller/startup-queue.ts";
import { hasSavedElementEdits } from "../src/framework/preferences/index.ts";
import { cssTree, isCssTreeLoaded } from "../src/shared/css-tree.ts";

// The Cloudflare prerender step fails for an output folder outside the project, so the
// test builds into an ignored cache folder inside it.
const cache = join(process.cwd(), "node_modules", ".cache");
mkdirSync(cache, { recursive: true });
const outDir = mkdtempSync(join(cache, "site-speed-"));
let built;
const buildOnce = () => built ??= build({ root: process.cwd(), outDir, logLevel: "error" });
test.after(() => rmSync(outDir, { recursive: true, force: true }));

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

test("Framework events run at once when nothing waits, and in order behind a start or a parser load", async () => {
  const seen = [];
  const now = createStartupQueue({ starting: null, loadParser: async () => {}, parserLoaded: () => true, report: assert.fail });
  now((event) => seen.push(event))("sync");
  assert.deepEqual(seen, ["sync"]);

  let finishStart;
  let parserReady = false;
  let parserLoads = 0;
  const starting = new Promise((resolve) => { finishStart = resolve; });
  const queued = [];
  const later = createStartupQueue({
    starting,
    loadParser: async () => { parserLoads += 1; parserReady = true; },
    parserLoaded: () => parserReady,
    report: assert.fail,
  });
  later((event) => queued.push(event))("before start");
  later((event) => queued.push(event), true)("edit");
  later((event) => queued.push(event))("after edit");
  assert.deepEqual(queued, []);
  finishStart();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(queued, ["before start", "edit", "after edit"]);
  assert.equal(parserLoads, 1);
  later((event) => queued.push(event), true)("next edit");
  assert.deepEqual(queued.at(-1), "next edit");
});

test("a Framework event that throws is reported and does not stop the ones behind it", async () => {
  const reported = [];
  const handled = [];
  const queue = createStartupQueue({ starting: Promise.resolve(), loadParser: async () => {}, parserLoaded: () => true, report: (error) => reported.push(error.message) });
  queue(() => { throw new Error("broken"); })("first");
  queue((event) => handled.push(event))("second");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(reported, ["broken"]);
  assert.deepEqual(handled, ["second"]);
});

test("Framework pages read, check and serialize the Element guidance once, not per request", async () => {
  let loads = 0;
  let checks = 0;
  const payload = createElementGuidancePayload(async () => {
    loads += 1;
    return [{ id: "a", summary: "</script><b>" }];
  }, () => { checks += 1; });
  const [first, second] = await Promise.all([payload(), payload()]);
  assert.equal(await payload(), first);
  assert.equal(second, first);
  assert.equal(loads, 1);
  assert.equal(checks, 1);
  assert.equal(first, '[{"id":"a","summary":"\\u003c/script>\\u003cb>"}]');

  const invalid = createElementGuidancePayload(async () => [{}]);
  await assert.rejects(invalid(), /catalog\.guidance/);
});
