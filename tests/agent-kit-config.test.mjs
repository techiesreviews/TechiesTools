import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

test("Agent Kit settings run the same tests and checks as package.json", () => {
  const kit = readJson("scripts/agents/kit.json");
  const packageJson = readJson("package.json");

  assert.deepEqual(kit.branches, { land: "develop", ci: "develop", release: "main" });
  assert.deepEqual(kit.checks, { check: "npm run check", test: "npm test" });
  assert.equal(`${kit.unit.run} ${kit.unit.files.join(" ")}`, packageJson.scripts.test);
});

test("no two ticket files name the same GitHub Issue", () => {
  const maps = join(root, "docs", "wayfinder");
  const issues = readdirSync(maps, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(maps, entry.name, "tickets")))
    .flatMap((entry) => readdirSync(join(maps, entry.name, "tickets"))
      .filter((name) => name.endsWith(".md"))
      .map((name) => readFileSync(join(maps, entry.name, "tickets", name), "utf8")))
    .map((text) => text.match(/^---\n([\s\S]*?)\n---/)?.[1].match(/^issue: (.+)$/m)?.[1])
    .filter(Boolean);

  assert.ok(issues.length > 0, "no ticket names a copied GitHub Issue");
  assert.equal(new Set(issues).size, issues.length, "two tickets name the same Issue");
  for (const issue of issues) {
    assert.match(issue, /^https:\/\/github\.com\/techiesreviews\/TechiesTools\/issues\/\d+$/);
  }
});
