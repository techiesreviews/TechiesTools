import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const workflow = readFileSync(
  join(process.cwd(), ".github", "workflows", "deploy.yml"),
  "utf8",
);

test("deployment runs the full test suite before building and deploying", () => {
  const install = workflow.indexOf("run: npm ci");
  const check = workflow.indexOf("run: npm run check");
  const tests = workflow.indexOf("run: npm test");
  const build = workflow.indexOf("run: npm run build");
  const deploy = workflow.indexOf("uses: cloudflare/wrangler-action");

  assert.ok(install >= 0, "deployment must install locked dependencies");
  assert.ok(check > install, "project checks must run after installation");
  assert.ok(tests > check, "the full test suite must run after project checks");
  assert.ok(build > tests, "the build must run only after tests pass");
  assert.ok(deploy > build, "deployment must run only after a successful build");
});
