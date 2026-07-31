import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createLatestTaskScheduler } from "../src/framework/controller/latest-task.ts";

test("latest-task scheduler resets its delay and applies only the newest settled state", () => {
  const tasks = [];
  const cancelled = [];
  const applied = [];
  const scheduler = createLatestTaskScheduler(
    (value) => applied.push(value),
    (callback) => { tasks.push(callback); return tasks.length - 1; },
    (handle) => cancelled.push(handle),
  );

  scheduler.schedule("first");
  scheduler.schedule("second");
  scheduler.schedule("latest");

  assert.equal(tasks.length, 3);
  assert.deepEqual(cancelled, [0, 1]);
  assert.deepEqual(applied, []);

  tasks[0]();
  tasks[1]();
  assert.deepEqual(applied, []);

  tasks[2]();

  assert.deepEqual(applied, ["latest"]);
});

test("latest-task scheduler flushes the newest state once before a synchronous consumer", () => {
  const tasks = [];
  const cancelled = [];
  const applied = [];
  const scheduler = createLatestTaskScheduler(
    (value) => applied.push(value),
    (callback) => { tasks.push(callback); return tasks.length - 1; },
    (handle) => cancelled.push(handle),
  );

  scheduler.schedule("first");
  scheduler.schedule("latest");

  assert.equal(scheduler.flush(), true);
  assert.deepEqual(applied, ["latest"]);
  assert.deepEqual(cancelled, [0, 1]);

  tasks[0]();
  tasks[1]();

  assert.deepEqual(applied, ["latest"]);
  assert.equal(scheduler.flush(), false);
});

test("browser controller coalesces primitive compilation and flushes before export consumers", () => {
  const browser = fs.readFileSync(new URL("../src/framework/controller/browser.ts", import.meta.url), "utf8").replaceAll("\r\n", "\n");

  assert.match(browser, /import \{ createLatestTaskScheduler \} from "\.\/latest-task\.ts";/);
  assert.match(browser, /createLatestTaskScheduler<PrimitiveSnapshot, number>\([\s\S]*?controller\.updatePrimitives/);
  assert.match(browser, /\(callback\) => window\.setTimeout\(callback, 250\),\n\s*\(handle\) => window\.clearTimeout\(handle\)/);
  assert.match(browser, /mergeSnapshot\(snapshot, detail\);\n\s*if \(completeSnapshot\(snapshot\)\) \{\n\s*primitiveUpdates\.schedule\(snapshot\);\n\s*if \(!detail\.deferCompilation\) primitiveUpdates\.flush\(\);\n\s*\}/);
  assert.match(browser, /framework-export:request[\s\S]*?primitiveUpdates\.flush\(\);[\s\S]*?controller\.validateForExport/);
  assert.match(browser, /framework-export:package[\s\S]*?primitiveUpdates\.flush\(\);[\s\S]*?controller\.validateForExport/);
});

test("settings defer continuous color inputs but commit color changes immediately", () => {
  const settings = fs.readFileSync(new URL("../src/components/dashboard/FrameworkSettingsBar.astro", import.meta.url), "utf8").replaceAll("\r\n", "\n");

  assert.match(settings, /const publishColors = \(deferCompilation = false\) =>/);
  assert.match(settings, /detail: \{ primary: colors\[0\]\?\.value, colors, semantics, deferCompilation, baseline:publishBaseline \}/);
  assert.match(settings, /const row = target\.closest<HTMLElement>\("\[data-color-row\]"\);[\s\S]*?publishColors\(true\);/);
  assert.match(settings, /root\?\.addEventListener\("change", \(event\) => \{\n\s*const target = event\.target;\n\s*if \(target instanceof HTMLElement && target\.closest\("\[data-color-row\]"\)\) publishColors\(\);\n\s*else publishAll\(\);/);
});
