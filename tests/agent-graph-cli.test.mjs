import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(root, "scripts", "agent-graph.mjs");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const graph = {
  schemaVersion: 1,
  id: "cli-test",
  title: "CLI test graph",
  goal: "Verify machine-readable ready-node output.",
  nodes: [
    {
      id: "research",
      title: "Research",
      goal: "Collect current evidence.",
      kind: "work",
      status: "completed",
      capabilities: ["design-exploration"],
      dependencies: [],
      risk: "low",
      writesProduction: false,
      writeScope: ["docs/research/**"],
      deliverables: ["Research note"],
      acceptanceChecks: ["Sources are dated"],
      evidence: ["docs/research/findings.md"],
    },
    {
      id: "promotion-gate",
      title: "Choose a direction",
      goal: "Promote one evidence-backed direction.",
      kind: "human-gate",
      status: "pending",
      capabilities: ["product-orchestration"],
      dependencies: ["research"],
      risk: "medium",
      writesProduction: false,
      writeScope: [],
      deliverables: ["Promotion decision"],
      acceptanceChecks: ["Decision records rationale"],
      evidence: [],
    },
  ],
};

test("ready command emits machine-readable ready nodes", () => {
  const directory = mkdtempSync(join(tmpdir(), "agent graph cli "));
  const graphPath = join(directory, "graph.json");
  writeFileSync(graphPath, JSON.stringify(graph));

  try {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, "ready", graphPath],
      { cwd: root, encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      valid: true,
      graphId: "cli-test",
      ready: [
        {
          id: "promotion-gate",
          kind: "human-gate",
          capabilities: ["product-orchestration"],
          risk: "medium",
          writesProduction: false,
        },
      ],
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("validate command returns diagnostics and a failing exit code", () => {
  const directory = mkdtempSync(join(tmpdir(), "agent-graph-cli-"));
  const graphPath = join(directory, "invalid.json");
  writeFileSync(graphPath, JSON.stringify({
    schemaVersion: 2,
    id: "",
    title: "",
    goal: "",
    nodes: [],
  }));

  try {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, "validate", graphPath],
      { cwd: root, encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.deepEqual(JSON.parse(result.stdout), {
      valid: false,
      issues: [
        "schemaVersion must equal 1",
        "id must be a non-empty string",
        "title must be a non-empty string",
        "goal must be a non-empty string",
        "nodes must contain at least one node",
      ],
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("usage failures use exit code 2 and one stable JSON shape", () => {
  const usage = "Usage: agent-graph <validate|ready> <graph.json>";
  const cases = [
    [],
    ["unknown", "graph.json"],
    ["validate", "graph.json", "extra"],
  ];

  for (const args of cases) {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, ...args],
      { cwd: root, encoding: "utf8" },
    );

    assert.equal(result.status, 2, args.join(" "));
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      valid: false,
      issues: [usage],
    });
  }
});

test("missing files and bad JSON return parseable input diagnostics", () => {
  const directory = mkdtempSync(join(tmpdir(), "agent-graph-cli-"));
  const malformedPath = join(directory, "bad json.json");
  writeFileSync(malformedPath, "{ definitely-not-json");

  try {
    for (const graphPath of [join(directory, "missing graph.json"), malformedPath]) {
      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", cli, "validate", graphPath],
        { cwd: root, encoding: "utf8" },
      );
      const output = JSON.parse(result.stdout);

      assert.equal(result.status, 1);
      assert.equal(result.stderr, "");
      assert.equal(output.valid, false);
      assert.equal(Array.isArray(output.issues), true);
      assert.equal(output.issues.length, 1);
      assert.equal(typeof output.issues[0], "string");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("example graph validates and exposes parallel research as the first frontier", () => {
  const examplePath = join(root, "agent-graphs", "adaptive-feature.example.json");
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", cli, "ready", examplePath],
    { cwd: root, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.valid, true);
  assert.deepEqual(
    output.ready.map(({ id }) => id),
    ["design-research", "technical-research", "ux-benchmark-research"],
  );
});

test("documented silent npm commands emit pure JSON for success and failure", () => {
  const examplePath = join(root, "agent-graphs", "adaptive-feature.example.json");
  const cases = [
    ["agent-graph:validate", [examplePath], 0],
    ["agent-graph:ready", [examplePath], 0],
    ["agent-graph:validate", [], 2],
    ["agent-graph:validate", [join(root, "missing.json")], 1],
  ];

  for (const [script, scriptArgs, expectedStatus] of cases) {
    const result = spawnSync(
      npm,
      ["run", "--silent", script, "--", ...scriptArgs],
      { cwd: root, encoding: "utf8", shell: process.platform === "win32" },
    );

    assert.equal(result.status, expectedStatus, result.error?.message || result.stderr);
    assert.equal(result.stderr, "");
    assert.equal(typeof JSON.parse(result.stdout).valid, "boolean");
  }
});
