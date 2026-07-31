import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import test from "node:test";
import {
  agentCapabilities,
  validateAgentGraph,
} from "../src/agent-graph/index.ts";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaPath = join(root, "agent-graphs", "schema.v1.json");

const node = (overrides = {}) => ({
  id: "inspect",
  title: "Inspect product truth",
  goal: "Read current repository contracts.",
  kind: "work",
  status: "pending",
  capabilities: ["product-orchestration"],
  dependencies: [],
  risk: "low",
  writesProduction: false,
  writeScope: [],
  deliverables: ["Decision brief"],
  acceptanceChecks: ["Relevant contracts cited"],
  evidence: [],
  ...overrides,
});

const graph = (graphNode = node(), overrides = {}) => ({
  schemaVersion: 1,
  id: "schema-parity",
  title: "Schema parity",
  goal: "Keep JSON Schema and runtime validation aligned.",
  sourceIssue: "https://github.com/techiesreviews/TechiesTools/issues/123",
  nodes: [graphNode],
  ...overrides,
});

test("JSON Schema publishes the executable v1 capability contract", () => {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const node = schema.$defs.node;

  assert.equal(schema.$id, "https://techies.tools/schemas/agent-graph/v1.json");
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.schemaVersion.const, 1);
  assert.equal(node.additionalProperties, false);
  assert.deepEqual(
    node.properties.capabilities.items.enum,
    [...agentCapabilities],
  );
  assert.deepEqual(node.required, [
    "id",
    "title",
    "goal",
    "kind",
    "status",
    "capabilities",
    "dependencies",
    "risk",
    "writesProduction",
    "writeScope",
    "deliverables",
    "acceptanceChecks",
    "evidence",
  ]);
});

test("JSON Schema and runtime reject the executable mutation corpus", async (t) => {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const validateSchema = new Ajv2020({ allErrors: true }).compile(schema);
  const mutations = [
    ["unknown root field", graph(node(), { worktree: "../feature" })],
    ["unknown node field", graph(node({ owner: "agent-1" }))],
    ["non-string sourceIssue", graph(node(), { sourceIssue: 42 })],
    ["blank sourceIssue", graph(node(), { sourceIssue: "   " })],
    ["null assignment", graph(node({ assignment: null }))],
    ["array assignment", graph(node({ assignment: [] }))],
    ["empty assignment", graph(node({ assignment: {} }))],
    ["blank assignment agent", graph(node({ assignment: { agent: "  " } }))],
    ["unknown assignment field", graph(node({ assignment: { queue: "review" } }))],
    ["duplicate capabilities", graph(node({ capabilities: ["product-orchestration", "product-orchestration"] }))],
    ["duplicate dependencies", graph(node({ id: "child", dependencies: ["root", "root"] }), { nodes: [node({ id: "root" }), node({ id: "child", dependencies: ["root", "root"] })] })],
    ["decision on work", graph(node({ decision: { outcome: "approved", decidedBy: "Lex", rationale: "Done." } }))],
    ["decision on pending human gate", graph(node({ kind: "human-gate", decision: { outcome: "approved", decidedBy: "Lex", rationale: "Proceed." } }))],
    ["non-object completed gate decision", graph(node({ kind: "human-gate", status: "completed", decision: "approved" }))],
    ["unknown completed gate decision field", graph(node({ kind: "human-gate", status: "completed", decision: { outcome: "approved", decidedBy: "Lex", rationale: "Proceed.", timestamp: "now" } }))],
    ["invalid completed gate decision", graph(node({ kind: "human-gate", status: "completed", decision: { outcome: "maybe", decidedBy: " ", rationale: "" } }))],
    ["completed work without evidence", graph(node({ status: "completed", evidence: [] }))],
    ["completed work with blank evidence", graph(node({ status: "completed", evidence: ["  "] }))],
    ["human gate writes production", graph(node({ kind: "human-gate", capabilities: ["full-stack-implementation"], writesProduction: true, writeScope: ["src/**"] }))],
  ];

  for (const [name, input] of mutations) {
    await t.test(name, () => {
      assert.equal(validateSchema(input), false, "JSON Schema accepted mutation");
      assert.equal(validateAgentGraph(input).valid, false, "runtime accepted mutation");
    });
  }
});

test("JSON Schema and runtime accept valid pending work, completed work, and completed gates", () => {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const validateSchema = new Ajv2020({ allErrors: true }).compile(schema);
  const validGraphs = [
    graph(),
    graph(node({ status: "completed", evidence: ["docs/evidence/report.md"] })),
    graph(node({
      kind: "human-gate",
      status: "completed",
      decision: {
        outcome: "approved",
        decidedBy: "Lex",
        rationale: "Evidence satisfies the gate.",
      },
    })),
    graph(node({ assignment: { agent: "reviewer" } })),
    graph(node({ assignment: { model: "provider/model" } })),
  ];

  for (const input of validGraphs) {
    assert.equal(validateSchema(input), true, JSON.stringify(validateSchema.errors));
    assert.equal(validateAgentGraph(input).valid, true);
  }
});

test("documentation does not claim typed worktree or per-check completion state", () => {
  const documentation = readFileSync(
    join(root, "docs", "agents", "adaptive-orchestration.md"),
    "utf8",
  );

  assert.doesNotMatch(documentation, /graph documents worktree ownership/i);
  assert.match(documentation, /version 1 graph has no worktree field/i);
  assert.match(documentation, /does not machine-verify individual deliverables or acceptance checks/i);
});

test("package scripts expose graph validation and frontier inspection", () => {
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  assert.equal(
    packageJson.scripts["agent-graph:validate"],
    "node --experimental-strip-types scripts/agent-graph.mjs validate",
  );
  assert.equal(
    packageJson.scripts["agent-graph:ready"],
    "node --experimental-strip-types scripts/agent-graph.mjs ready",
  );
});
