import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
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

test("each copied GitHub Issue has exactly one backlog ticket", () => {
  const folder = join(root, "docs", "wayfinder", "backlog", "tickets");
  const issues = readdirSync(folder)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const frontmatter = readFileSync(join(folder, name), "utf8").split("\n---")[0];
      return frontmatter.match(/^issue: (.+)$/m)?.[1];
    })
    .filter(Boolean);

  assert.ok(issues.length >= 19, `expected the 19 Issues copied on 2026-10-30, found ${issues.length}`);
  assert.equal(new Set(issues).size, issues.length, "two tickets name the same Issue");
  for (const issue of issues) {
    assert.match(issue, /^https:\/\/github\.com\/techiesreviews\/TechiesTools\/issues\/\d+$/);
  }
});
