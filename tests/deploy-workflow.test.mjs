import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const workflow = readFileSync(
  join(process.cwd(), ".github", "workflows", "deploy.yml"),
  "utf8",
).replaceAll("\r\n", "\n");

const verifyStart = workflow.indexOf("  verify:\n");
const deployStart = workflow.indexOf("  deploy:\n");

const assertOrderedCommands = (source, commands) => {
  let previous = -1;
  for (const command of commands) {
    const current = source.indexOf(command);
    assert.ok(current > previous, `${command} must appear in order`);
    previous = current;
  }
};

test("deployment runs the full test suite before building and deploying", () => {
  assert.ok(deployStart >= 0, "workflow must define a deploy job");
  const deployJob = workflow.slice(deployStart);
  assert.match(deployJob, /if: github\.event_name == 'push'/);
  assertOrderedCommands(deployJob, [
    "run: npm ci",
    "run: npm run check",
    "run: npm test",
    "run: npm run build",
    "uses: cloudflare/wrangler-action",
  ]);
});

test("pull requests run verification without deployment credentials", () => {
  assert.match(workflow, /\n  pull_request:\n/);
  assert.ok(verifyStart >= 0, "workflow must define a pull-request verify job");
  assert.ok(deployStart > verifyStart, "deploy job must follow the verify job");

  const verifyJob = workflow.slice(verifyStart, deployStart);
  assert.match(verifyJob, /if: github\.event_name == 'pull_request'/);
  assert.match(
    verifyJob,
    /uses: actions\/checkout@v6\n\s+with:\n\s+persist-credentials: false/,
  );
  assertOrderedCommands(verifyJob, [
    "run: npm ci",
    "run: npm run check",
    "run: npm test",
    "run: npm run build",
  ]);
  assert.doesNotMatch(verifyJob, /environment:|CLOUDFLARE_API_TOKEN|wrangler-action/);
});
