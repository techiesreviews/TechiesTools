export const agentCapabilities = [
  "product-orchestration",
  "design-exploration",
  "full-stack-implementation",
  "functional-qa",
  "ux-benchmarking",
  "security-privacy",
  "independent-review",
  "brand-content",
] as const;

export type AgentCapability = (typeof agentCapabilities)[number];
export type AgentNodeKind = "work" | "human-gate";
export type AgentNodeStatus = "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
export type AgentRisk = "low" | "medium" | "high";

export interface AgentAssignment {
  agent?: string;
  model?: string;
}

export interface HumanGateDecision {
  outcome: "approved" | "rejected";
  decidedBy: string;
  rationale: string;
}

export interface AgentGraphNode {
  id: string;
  title: string;
  goal: string;
  kind: AgentNodeKind;
  status: AgentNodeStatus;
  capabilities: AgentCapability[];
  dependencies: string[];
  risk: AgentRisk;
  writesProduction: boolean;
  writeScope: string[];
  deliverables: string[];
  acceptanceChecks: string[];
  evidence: string[];
  assignment?: AgentAssignment;
  decision?: HumanGateDecision;
}

export interface AgentGraph {
  schemaVersion: 1;
  id: string;
  title: string;
  goal: string;
  sourceIssue?: string;
  nodes: AgentGraphNode[];
}

export interface AgentGraphValidation {
  valid: boolean;
  issues: string[];
  graph?: AgentGraph;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasOwn = (value: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const completeDecision = (value: unknown): value is HumanGateDecision => {
  if (!isRecord(value)) return false;
  return Object.keys(value).every((field) => ["outcome", "decidedBy", "rationale"].includes(field)) &&
    (value.outcome === "approved" || value.outcome === "rejected") &&
    isNonEmptyString(value.decidedBy) &&
    isNonEmptyString(value.rationale);
};

const completedWorkHasEvidence = (node: Record<string, unknown>): boolean =>
  node.kind === "work" &&
  node.status === "completed" &&
  Array.isArray(node.evidence) &&
  node.evidence.length > 0 &&
  node.evidence.every(isNonEmptyString);

const satisfiedAgentNodeIds = (nodes: readonly unknown[]): Set<string> => {
  const eligible = new Map<string, Record<string, unknown>>();
  for (const rawNode of nodes) {
    if (!isRecord(rawNode) || !isNonEmptyString(rawNode.id)) continue;
    const completedApprovedGate = rawNode.kind === "human-gate" &&
      rawNode.status === "completed" &&
      completeDecision(rawNode.decision) &&
      rawNode.decision.outcome === "approved";
    if (
      (completedWorkHasEvidence(rawNode) || completedApprovedGate) &&
      Array.isArray(rawNode.dependencies) &&
      rawNode.dependencies.every(isNonEmptyString)
    ) {
      eligible.set(rawNode.id, rawNode);
    }
  }

  const dependencyCounts = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const [id, candidate] of eligible) {
    const dependencies = candidate.dependencies as string[];
    if (!dependencies.every((dependency) => eligible.has(dependency))) continue;
    dependencyCounts.set(id, dependencies.length);
    for (const dependency of dependencies) {
      const current = dependents.get(dependency) ?? [];
      current.push(id);
      dependents.set(dependency, current);
    }
  }

  const queue = [...dependencyCounts]
    .filter(([, count]) => count === 0)
    .map(([id]) => id);
  const satisfied = new Set<string>();
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor];
    satisfied.add(id);
    for (const dependent of dependents.get(id) ?? []) {
      const remaining = (dependencyCounts.get(dependent) ?? 0) - 1;
      dependencyCounts.set(dependent, remaining);
      if (remaining === 0) queue.push(dependent);
    }
  }
  return satisfied;
};

const validateAgentGraphInput = (input: unknown): AgentGraphValidation => {
  const issues: string[] = [];
  const candidate = isRecord(input) ? input : {};
  const rootFields = new Set(["schemaVersion", "id", "title", "goal", "sourceIssue", "nodes"]);
  const nodeFields = new Set([
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
    "assignment",
    "decision",
  ]);

  for (const field of Object.keys(candidate).filter((field) => !rootFields.has(field)).sort()) {
    issues.push(`unknown root field '${field}'`);
  }
  if (candidate.schemaVersion !== 1) issues.push("schemaVersion must equal 1");
  if (!isNonEmptyString(candidate.id)) issues.push("id must be a non-empty string");
  if (!isNonEmptyString(candidate.title)) issues.push("title must be a non-empty string");
  if (!isNonEmptyString(candidate.goal)) issues.push("goal must be a non-empty string");
  if (hasOwn(candidate, "sourceIssue") && !isNonEmptyString(candidate.sourceIssue)) {
    issues.push("sourceIssue must be a non-empty string");
  }
  if (!Array.isArray(candidate.nodes)) issues.push("nodes must be an array");

  if (!Array.isArray(candidate.nodes)) return { valid: false, issues };
  if (candidate.nodes.length === 0) issues.push("nodes must contain at least one node");

  const graph = candidate as unknown as AgentGraph;
  const nodeIds = new Set<string>();
  const supportedCapabilities = new Set<unknown>(agentCapabilities);
  const supportedKinds = new Set<unknown>(["work", "human-gate"]);
  const supportedStatuses = new Set<unknown>(["pending", "in_progress", "completed", "blocked", "cancelled"]);
  const supportedRisks = new Set<unknown>(["low", "medium", "high"]);

  graph.nodes.forEach((rawNode, index) => {
    if (!isRecord(rawNode)) {
      issues.push(`nodes[${index}] must be an object`);
      return;
    }

    const nodeCandidate = rawNode as unknown as Record<string, unknown>;
    for (const field of Object.keys(nodeCandidate).filter((field) => !nodeFields.has(field)).sort()) {
      issues.push(`nodes[${index}] has unknown field '${field}'`);
    }

    const id = nodeCandidate.id;
    if (!isNonEmptyString(id)) issues.push(`nodes[${index}].id must be a non-empty string`);
    if (!isNonEmptyString(nodeCandidate.title)) issues.push(`nodes[${index}].title must be a non-empty string`);
    if (!isNonEmptyString(nodeCandidate.goal)) issues.push(`nodes[${index}].goal must be a non-empty string`);
    if (!supportedKinds.has(nodeCandidate.kind)) issues.push(`nodes[${index}].kind must be 'work' or 'human-gate'`);
    if (!supportedStatuses.has(nodeCandidate.status)) issues.push(`nodes[${index}].status is not supported`);

    if (!Array.isArray(nodeCandidate.capabilities) || nodeCandidate.capabilities.length === 0) {
      issues.push(`nodes[${index}].capabilities must be a non-empty array`);
    } else {
      const seenCapabilities = new Set<unknown>();
      nodeCandidate.capabilities.forEach((capability, capabilityIndex) => {
        if (!supportedCapabilities.has(capability)) {
          const detail = typeof capability === "string" ? ` '${capability}'` : "";
          issues.push(`nodes[${index}].capabilities[${capabilityIndex}]${detail} is not supported`);
        }
        if (seenCapabilities.has(capability)) {
          const detail = typeof capability === "string" ? ` '${capability}'` : "";
          issues.push(`nodes[${index}].capabilities[${capabilityIndex}] duplicates capability${detail}`);
        }
        seenCapabilities.add(capability);
      });
    }

    if (!Array.isArray(nodeCandidate.dependencies)) issues.push(`nodes[${index}].dependencies must be an array`);
    if (!supportedRisks.has(nodeCandidate.risk)) issues.push(`nodes[${index}].risk must be 'low', 'medium', or 'high'`);
    if (typeof nodeCandidate.writesProduction !== "boolean") issues.push(`nodes[${index}].writesProduction must be a boolean`);
    if (!Array.isArray(nodeCandidate.writeScope)) issues.push(`nodes[${index}].writeScope must be an array`);
    if (!Array.isArray(nodeCandidate.deliverables) || nodeCandidate.deliverables.length === 0) issues.push(`nodes[${index}].deliverables must be a non-empty array`);
    if (!Array.isArray(nodeCandidate.acceptanceChecks) || nodeCandidate.acceptanceChecks.length === 0) issues.push(`nodes[${index}].acceptanceChecks must be a non-empty array`);
    if (!Array.isArray(nodeCandidate.evidence)) issues.push(`nodes[${index}].evidence must be an array`);
    for (const field of ["dependencies", "writeScope", "deliverables", "acceptanceChecks", "evidence"] as const) {
      const values = nodeCandidate[field];
      if (!Array.isArray(values)) continue;
      const seenValues = new Set<unknown>();
      values.forEach((value, valueIndex) => {
        if (!isNonEmptyString(value)) issues.push(`nodes[${index}].${field}[${valueIndex}] must be a non-empty string`);
        if (field === "dependencies" && seenValues.has(value)) {
          issues.push(`nodes[${index}].dependencies[${valueIndex}] duplicates dependency '${String(value)}'`);
        }
        seenValues.add(value);
      });
    }
    if (
      nodeCandidate.kind === "work" &&
      nodeCandidate.status === "completed" &&
      (!Array.isArray(nodeCandidate.evidence) || !nodeCandidate.evidence.some(isNonEmptyString))
    ) {
      issues.push(`nodes[${index}].evidence must contain a recoverable reference for completed work`);
    }

    if (nodeCandidate.writesProduction === true) {
      if (nodeCandidate.kind === "human-gate") {
        issues.push(`nodes[${index}] human-gate cannot write production`);
      }
      if (!Array.isArray(nodeCandidate.capabilities) || !nodeCandidate.capabilities.includes("full-stack-implementation")) {
        issues.push(`nodes[${index}] writes production without 'full-stack-implementation' capability`);
      }
      if (!Array.isArray(nodeCandidate.writeScope) || nodeCandidate.writeScope.length === 0) {
        issues.push(`nodes[${index}].writeScope must not be empty when writesProduction is true`);
      }
    }

    if (hasOwn(nodeCandidate, "assignment")) {
      if (!isRecord(nodeCandidate.assignment)) {
        issues.push(`nodes[${index}].assignment must be an object`);
      } else {
        const assignment = nodeCandidate.assignment;
        for (const field of Object.keys(assignment).filter((field) => field !== "agent" && field !== "model").sort()) {
          issues.push(`nodes[${index}].assignment has unknown field '${field}'`);
        }
        if (!hasOwn(assignment, "agent") && !hasOwn(assignment, "model")) {
          issues.push(`nodes[${index}].assignment must include agent or model`);
        }
        if (hasOwn(assignment, "agent") && !isNonEmptyString(assignment.agent)) {
          issues.push(`nodes[${index}].assignment.agent must be a non-empty string`);
        }
        if (hasOwn(assignment, "model") && !isNonEmptyString(assignment.model)) {
          issues.push(`nodes[${index}].assignment.model must be a non-empty string`);
        }
      }
    }

    const decisionApplies = nodeCandidate.kind === "human-gate" && nodeCandidate.status === "completed";
    if (!decisionApplies && hasOwn(nodeCandidate, "decision")) {
      issues.push(`nodes[${index}].decision is only allowed on a completed human-gate`);
    } else if (decisionApplies && !hasOwn(nodeCandidate, "decision")) {
      issues.push(`nodes[${index}].decision is required for a completed human-gate`);
    } else if (decisionApplies) {
      if (!isRecord(nodeCandidate.decision)) {
        issues.push(`nodes[${index}].decision must be an object`);
      } else {
        const decision = nodeCandidate.decision;
        for (const field of Object.keys(decision).filter((field) => !["outcome", "decidedBy", "rationale"].includes(field)).sort()) {
          issues.push(`nodes[${index}].decision has unknown field '${field}'`);
        }
        if (decision.outcome !== "approved" && decision.outcome !== "rejected") {
          issues.push(`nodes[${index}].decision.outcome must be 'approved' or 'rejected'`);
        }
        if (!isNonEmptyString(decision.decidedBy)) issues.push(`nodes[${index}].decision.decidedBy must be a non-empty string`);
        if (!isNonEmptyString(decision.rationale)) issues.push(`nodes[${index}].decision.rationale must be a non-empty string`);
      }
    }

    if (isNonEmptyString(id)) {
      if (nodeIds.has(id)) issues.push(`nodes[${index}].id duplicates node '${id}'`);
      nodeIds.add(id);
    }
  });

  graph.nodes.forEach((rawNode, nodeIndex) => {
    if (!isRecord(rawNode)) return;
    const dependencies = rawNode.dependencies;
    if (!Array.isArray(dependencies)) return;
    dependencies.forEach((dependency, dependencyIndex) => {
      if (isNonEmptyString(dependency) && !nodeIds.has(dependency)) {
        issues.push(`nodes[${nodeIndex}].dependencies[${dependencyIndex}] references missing node '${dependency}'`);
      }
    });
  });

  const satisfiedNodeIds = satisfiedAgentNodeIds(graph.nodes);
  graph.nodes.forEach((rawNode, nodeIndex) => {
    if (!isRecord(rawNode) || (rawNode.status !== "in_progress" && rawNode.status !== "completed")) return;
    if (!Array.isArray(rawNode.dependencies)) return;
    for (const dependency of rawNode.dependencies) {
      if (
        isNonEmptyString(dependency) &&
        nodeIds.has(dependency) &&
        !satisfiedNodeIds.has(dependency)
      ) {
        issues.push(`nodes[${nodeIndex}] cannot be '${rawNode.status}' because dependency '${dependency}' is not satisfied`);
      }
    }
  });

  const dependenciesById = new Map<string, string[]>();
  graph.nodes.forEach((rawNode) => {
    if (!isRecord(rawNode)) return;
    if (!isNonEmptyString(rawNode.id) || !Array.isArray(rawNode.dependencies)) return;
    dependenciesById.set(rawNode.id, rawNode.dependencies.filter(isNonEmptyString));
  });

  const visitState = new Map<string, "visiting" | "visited">();
  let cycle: string[] | undefined;
  for (const start of dependenciesById.keys()) {
    if (visitState.has(start)) continue;
    const path: string[] = [];
    const pathIndexes = new Map<string, number>();
    const stack = [{ id: start, dependencyIndex: 0 }];

    while (stack.length > 0 && !cycle) {
      const frame = stack[stack.length - 1];
      if (!visitState.has(frame.id)) {
        visitState.set(frame.id, "visiting");
        pathIndexes.set(frame.id, path.length);
        path.push(frame.id);
      }

      const dependencies = dependenciesById.get(frame.id) ?? [];
      if (frame.dependencyIndex < dependencies.length) {
        const dependency = dependencies[frame.dependencyIndex];
        frame.dependencyIndex += 1;
        if (!dependenciesById.has(dependency)) continue;
        if (visitState.get(dependency) === "visiting") {
          const cycleStart = pathIndexes.get(dependency) ?? 0;
          cycle = [...path.slice(cycleStart), dependency];
        } else if (!visitState.has(dependency)) {
          stack.push({ id: dependency, dependencyIndex: 0 });
        }
        continue;
      }

      stack.pop();
      visitState.set(frame.id, "visited");
      pathIndexes.delete(frame.id);
      path.pop();
    }
    if (cycle) break;
  }
  if (cycle) issues.push(`dependency cycle: ${cycle.join(" -> ")}`);

  const activeProductionOwners = graph.nodes.flatMap((rawNode) => {
    if (!isRecord(rawNode)) return [];
    return rawNode.status === "in_progress" && rawNode.writesProduction === true && isNonEmptyString(rawNode.id)
      ? [rawNode.id]
      : [];
  });
  if (activeProductionOwners.length > 1) {
    issues.push(`only one in_progress node may write production: ${activeProductionOwners.join(", ")}`);
  }

  return {
    valid: issues.length === 0,
    issues,
    graph: issues.length === 0 ? graph : undefined,
  };
};

export const validateAgentGraph = (input: unknown): AgentGraphValidation => {
  try {
    return validateAgentGraphInput(input);
  } catch {
    return {
      valid: false,
      issues: ["input could not be validated safely"],
    };
  }
};

export const readyAgentNodes = (graph: AgentGraph): AgentGraphNode[] => {
  const satisfied = satisfiedAgentNodeIds(graph.nodes);
  const ready = graph.nodes.filter(
    ({ status, dependencies }) =>
      status === "pending" && dependencies.every((dependency) => satisfied.has(dependency)),
  );
  let productionWriterAvailable = !graph.nodes.some(
    ({ status, writesProduction }) => status === "in_progress" && writesProduction,
  );

  return ready.filter(({ writesProduction }) => {
    if (!writesProduction) return true;
    if (!productionWriterAvailable) return false;
    productionWriterAvailable = false;
    return true;
  });
};
