import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const read = (file) => readFileSync(join(process.cwd(), file), "utf8");
const { branches } = JSON.parse(read("scripts/agents/kit.json"));
const workflow = read(".github/workflows/deploy.yml");

// The branch names listed under one trigger ("push" or "pull_request") of the
// deploy workflow, read from its "- <branch>" lines.
const triggerBranches = (trigger) => {
  const block = workflow.match(
    new RegExp(`^  ${trigger}:\\n    branches:\\n((?:      - .+\\n)+)`, "m"),
  );
  assert.ok(block, `deploy.yml lists branches under ${trigger}`);
  return block[1].split("\n").filter(Boolean).map((line) => line.replace(/^\s*- /, "").trim());
};

test("the kit lands on dev and releases to main", () => {
  assert.equal(branches.land, "dev");
  assert.equal(branches.release, "main");
});

for (const trigger of ["push", "pull_request"]) {
  test(`the deploy workflow runs on ${trigger} to the kit's branches`, () => {
    const listed = triggerBranches(trigger);
    assert.ok(listed.includes(branches.land), `${trigger} includes ${branches.land}`);
    assert.ok(listed.includes(branches.release), `${trigger} includes ${branches.release}`);
  });
}

test("the workflow picks production only for the release branch", () => {
  const compared = [...workflow.matchAll(/github\.(?:ref_name|base_ref) == '([^']+)'/g)].map((match) => match[1]);
  assert.ok(compared.length > 0, "deploy.yml compares the branch name");
  assert.deepEqual([...new Set(compared)], [branches.release]);
});

test("docs and CI no longer name the old develop branch", () => {
  const files = [
    "AGENTS.md",
    ...readdirSync(join(process.cwd(), "docs"), { recursive: true })
      .filter((file) => file.endsWith(".md"))
      .map((file) => join("docs", file)),
    ...readdirSync(join(process.cwd(), ".github/workflows"))
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => join(".github/workflows", file)),
  ];
  const named = files.filter((file) => /`develop`|\bdevelop\b(?!er|ment)/.test(read(file)));
  assert.deepEqual(named, []);
});
