import assert from "node:assert/strict";
import test from "node:test";
import {
  readyAgentNodes,
  validateAgentGraph,
} from "../src/agent-graph/index.ts";

const node = (overrides = {}) => ({
  id: "inspect",
  title: "Inspect product truth",
  goal: "Read current repository contracts before proposing changes.",
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

const graph = (nodes) => ({
  schemaVersion: 1,
  id: "example-feature",
  title: "Example feature",
  goal: "Deliver one verified feature through adaptive agent collaboration.",
  sourceIssue: "https://github.com/techiesreviews/TechiesTools/issues/123",
  nodes,
});

test("valid graph exposes only pending nodes whose dependencies are completed", () => {
  const input = graph([
    node({ status: "completed", evidence: ["docs/evidence/inspection.md"] }),
    node({
      id: "implement",
      title: "Implement feature",
      goal: "Build the accepted behavior with tests.",
      capabilities: ["full-stack-implementation"],
      dependencies: ["inspect"],
      risk: "medium",
      writesProduction: true,
      writeScope: ["src/feature/**", "tests/feature.test.mjs"],
      deliverables: ["Production implementation", "Regression tests"],
      acceptanceChecks: ["Focused tests pass"],
      evidence: [],
    }),
    node({
      id: "qa",
      title: "Verify feature",
      goal: "Exercise requirements and edge cases independently.",
      capabilities: ["functional-qa"],
      dependencies: ["implement"],
      writeScope: ["evidence/feature-qa.md"],
      deliverables: ["QA report"],
      acceptanceChecks: ["No unresolved blockers"],
      evidence: [],
    }),
  ]);

  const result = validateAgentGraph(input);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
  assert.ok(result.graph);
  assert.deepEqual(readyAgentNodes(result.graph).map(({ id }) => id), ["implement"]);
});

test("graph validation rejects duplicate node identifiers", () => {
  const result = validateAgentGraph(graph([
    node(),
    node({ title: "Second node with the same identifier" }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, ["nodes[1].id duplicates node 'inspect'"]);
});

test("graph validation reports malformed top-level fields without throwing", () => {
  const result = validateAgentGraph({
    schemaVersion: 2,
    id: "",
    title: "",
    goal: "",
    nodes: "not-an-array",
  });

  assert.equal(result.valid, false);
  assert.equal(result.graph, undefined);
  assert.deepEqual(result.issues, [
    "schemaVersion must equal 1",
    "id must be a non-empty string",
    "title must be a non-empty string",
    "goal must be a non-empty string",
    "nodes must be an array",
  ]);
});

test("graph validation never throws for malformed unknown input", () => {
  const invalidCapability = Symbol("invalid");
  const malformedInputs = [
    null,
    true,
    [],
    graph([node({ capabilities: [invalidCapability, invalidCapability] })]),
    new Proxy({}, {
      ownKeys() {
        throw new Error("hostile ownKeys");
      },
    }),
  ];

  for (const input of malformedInputs) {
    assert.doesNotThrow(() => {
      assert.equal(validateAgentGraph(input).valid, false);
    });
  }
});

test("graph validation rejects workflows without nodes", () => {
  const result = validateAgentGraph(graph([]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, ["nodes must contain at least one node"]);
});

test("graph validation rejects unknown capability names", () => {
  const result = validateAgentGraph(graph([
    node({ capabilities: ["make-it-cool"] }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].capabilities[0] 'make-it-cool' is not supported",
  ]);
});

test("graph validation reports non-object nodes without throwing", () => {
  const result = validateAgentGraph(graph([null]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, ["nodes[0] must be an object"]);
});

test("graph validation reports every missing required node field", () => {
  const result = validateAgentGraph(graph([{}]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].id must be a non-empty string",
    "nodes[0].title must be a non-empty string",
    "nodes[0].goal must be a non-empty string",
    "nodes[0].kind must be 'work' or 'human-gate'",
    "nodes[0].status is not supported",
    "nodes[0].capabilities must be a non-empty array",
    "nodes[0].dependencies must be an array",
    "nodes[0].risk must be 'low', 'medium', or 'high'",
    "nodes[0].writesProduction must be a boolean",
    "nodes[0].writeScope must be an array",
    "nodes[0].deliverables must be a non-empty array",
    "nodes[0].acceptanceChecks must be a non-empty array",
    "nodes[0].evidence must be an array",
  ]);
});

test("graph validation rejects dependencies that do not name graph nodes", () => {
  const result = validateAgentGraph(graph([
    node({ dependencies: ["missing-research"] }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].dependencies[0] references missing node 'missing-research'",
  ]);
});

test("graph validation rejects dependency cycles", () => {
  const result = validateAgentGraph(graph([
    node({ dependencies: ["qa"] }),
    node({
      id: "qa",
      title: "Verify behavior",
      capabilities: ["functional-qa"],
      dependencies: ["inspect"],
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, ["dependency cycle: inspect -> qa -> inspect"]);
});

test("graph validation handles a 20,000-node DAG without recursive traversal", { timeout: 10_000 }, () => {
  const size = 20_000;
  const nodes = Array.from({ length: size }, (_, index) => node({
    id: `node-${index}`,
    title: `Node ${index}`,
    dependencies: index + 1 < size ? [`node-${index + 1}`] : [],
  }));

  const result = validateAgentGraph(graph(nodes));

  assert.equal(result.valid, true, result.issues.join("\n"));
});

test("graph validation permits only one active production-code owner", () => {
  const result = validateAgentGraph(graph([
    node({
      id: "implement-a",
      status: "in_progress",
      capabilities: ["full-stack-implementation"],
      writesProduction: true,
      writeScope: ["src/a/**"],
    }),
    node({
      id: "implement-b",
      status: "in_progress",
      capabilities: ["full-stack-implementation"],
      writesProduction: true,
      writeScope: ["src/b/**"],
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "only one in_progress node may write production: implement-a, implement-b",
  ]);
});

test("ready frontier never offers a second production-code owner", () => {
  const completedRoot = node({
    id: "root",
    status: "completed",
    evidence: ["docs/evidence/root.md"],
  });
  const productionWriter = (id, status = "pending") => node({
    id,
    title: id,
    status,
    capabilities: ["full-stack-implementation"],
    dependencies: ["root"],
    writesProduction: true,
    writeScope: [`src/${id}/**`],
  });

  const activeWriterGraph = graph([
    completedRoot,
    productionWriter("implement-a", "in_progress"),
    productionWriter("implement-b"),
  ]);
  const activeResult = validateAgentGraph(activeWriterGraph);
  assert.equal(activeResult.valid, true, activeResult.issues.join("\n"));
  assert.deepEqual(readyAgentNodes(activeWriterGraph), []);

  const pendingWritersGraph = graph([
    completedRoot,
    productionWriter("implement-a"),
    productionWriter("implement-b"),
    node({ id: "research", dependencies: ["root"] }),
  ]);
  const pendingResult = validateAgentGraph(pendingWritersGraph);
  assert.equal(pendingResult.valid, true, pendingResult.issues.join("\n"));
  assert.deepEqual(
    readyAgentNodes(pendingWritersGraph).map(({ id }) => id),
    ["implement-a", "research"],
  );
});

test("completed human gates require a recorded decision", () => {
  const result = validateAgentGraph(graph([
    node({
      id: "promotion-gate",
      title: "Choose a prototype",
      kind: "human-gate",
      status: "completed",
      capabilities: ["product-orchestration"],
      deliverables: ["Promotion decision"],
      acceptanceChecks: ["Decision names the selected outcome"],
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].decision is required for a completed human-gate",
  ]);
});

test("rejected human gates do not unlock dependent work", () => {
  const input = graph([
    node({
      id: "promotion-gate",
      title: "Choose a prototype",
      kind: "human-gate",
      status: "completed",
      decision: {
        outcome: "rejected",
        decidedBy: "Lex",
        rationale: "No variant satisfies the product goal.",
      },
    }),
    node({
      id: "implement",
      title: "Implement selected prototype",
      capabilities: ["full-stack-implementation"],
      dependencies: ["promotion-gate"],
      writesProduction: true,
      writeScope: ["src/feature/**"],
    }),
  ]);
  const result = validateAgentGraph(input);

  assert.equal(result.valid, true);
  assert.ok(result.graph);
  assert.deepEqual(readyAgentNodes(result.graph), []);
});

test("in-progress and completed work cannot bypass an unsatisfied dependency", () => {
  for (const status of ["in_progress", "completed"]) {
    const bypassingNode = node({
      id: "implementation",
      status,
      dependencies: ["inspect"],
      evidence: status === "completed" ? ["docs/evidence/implementation.md"] : [],
    });
    const input = graph([
      node(),
      bypassingNode,
      node({ id: "qa", dependencies: ["implementation"] }),
    ]);

    const result = validateAgentGraph(input);

    assert.equal(result.valid, false, `${status} bypass was accepted`);
    assert.ok(
      result.issues.includes(`nodes[1] cannot be '${status}' because dependency 'inspect' is not satisfied`),
      result.issues.join("\n"),
    );
    assert.deepEqual(
      readyAgentNodes(input).map(({ id }) => id),
      ["inspect"],
      `${status} bypass opened the downstream frontier`,
    );
  }
});

test("an approved human gate cannot bypass an unsatisfied dependency", () => {
  const input = graph([
    node(),
    node({
      id: "promotion-gate",
      kind: "human-gate",
      status: "completed",
      dependencies: ["inspect"],
      decision: {
        outcome: "approved",
        decidedBy: "Lex",
        rationale: "Promote the selected direction.",
      },
    }),
    node({ id: "implementation", dependencies: ["promotion-gate"] }),
  ]);

  const result = validateAgentGraph(input);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.includes("nodes[1] cannot be 'completed' because dependency 'inspect' is not satisfied"),
    result.issues.join("\n"),
  );
  assert.deepEqual(readyAgentNodes(input).map(({ id }) => id), ["inspect"]);
});

test("completed human gates reject incomplete decisions", () => {
  const result = validateAgentGraph(graph([
    node({
      kind: "human-gate",
      status: "completed",
      decision: {
        outcome: "maybe",
        decidedBy: "",
        rationale: "",
      },
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].decision.outcome must be 'approved' or 'rejected'",
    "nodes[0].decision.decidedBy must be a non-empty string",
    "nodes[0].decision.rationale must be a non-empty string",
  ]);
});

test("production-writing nodes require implementation capability and an explicit scope", () => {
  const result = validateAgentGraph(graph([
    node({
      capabilities: ["design-exploration"],
      writesProduction: true,
      writeScope: [],
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0] writes production without 'full-stack-implementation' capability",
    "nodes[0].writeScope must not be empty when writesProduction is true",
  ]);
});

test("graph validation rejects non-string node-list entries", () => {
  const result = validateAgentGraph(graph([
    node({
      dependencies: [42],
      writeScope: [""],
      deliverables: [false],
      acceptanceChecks: [""],
      evidence: [{}],
    }),
  ]));

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    "nodes[0].dependencies[0] must be a non-empty string",
    "nodes[0].writeScope[0] must be a non-empty string",
    "nodes[0].deliverables[0] must be a non-empty string",
    "nodes[0].acceptanceChecks[0] must be a non-empty string",
    "nodes[0].evidence[0] must be a non-empty string",
  ]);
});
