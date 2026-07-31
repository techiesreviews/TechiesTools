# Adaptive agent orchestration

TechiesTools uses a task-specific dependency graph for work that benefits from multiple agent capabilities. The graph coordinates bounded work; it does not replace product authority, repository contracts, or human decisions.

## Authority and scope

Authority remains, in order:

1. The product owner and the linked GitHub issue or PRD.
2. `CONTEXT.md`, accepted ADRs, and relevant Framework documentation.
3. `AGENTS.md` collaboration and prototype rules.
4. The task graph for dependencies, scopes, deliverables, evidence, and gates.

The graph must not become a second issue tracker. Keep product rationale and durable requirements in GitHub Issues. Use a graph when the task has meaningful parallel research, specialist review, human gates, or cross-session handoffs.

Version 1 is deliberately thin. It validates a JSON graph and calculates the pending nodes whose dependencies are satisfied. It does not spawn models, assign credentials, update statuses, merge branches, or approve human gates.

## Stable rules, adaptive team

Capabilities are stable vocabulary. The orchestrator selects only those needed for the task. A small fix may use implementation and independent review only. An ambiguous, high-risk feature may use every capability.

| Capability | Responsibility | Boundary |
| --- | --- | --- |
| `product-orchestration` | Goal, scope, graph, acceptance criteria, dependencies, and human gates | Does not silently redefine the product outcome |
| `design-exploration` | Existing-system taste, dated trend research, isolated alternatives, accessibility and performance implications | Trends remain Exploration until explicit Promotion |
| `full-stack-implementation` | Architecture, tests, production integration, portability, and all affected product surfaces | Only one active production-code owner |
| `functional-qa` | Requirements, regressions, edge cases, accessibility, breakpoints, compatibility, and failure recovery | Verifies real behavior independently of implementation self-report |
| `ux-benchmarking` | Task completion, language, friction, comparative workflows, and user expectations | UX success is distinct from technical correctness |
| `security-privacy` | Threat boundaries, data minimization, permissions, dependencies, and current requirements | Current primary sources are required; high-risk legal conclusions may require counsel |
| `independent-review` | Exact-current diff, evidence, unresolved blockers, and fail-closed verdict | Read-only unless a new implementation node is created |
| `brand-content` | Voice, terminology, audience fit, claims, and narrative | Spawn only when the task affects brand or content |

Do not permanently bind capabilities to GPT, Claude, Grok, or another provider. Model assignment is optional runtime metadata. Choose it per node, using measured task fit. Cross-provider review can reduce correlated mistakes, but models do not vote on truth; requirements, primary sources, tests, rendered behavior, and human decisions decide.

## Graph lifecycle

A typical high-ambiguity feature follows this shape:

1. Define the measurable user outcome.
2. Inspect repository and product truth.
3. Run bounded design, technical, privacy, and UX research in parallel where independent.
4. Synthesize one direction with the strongest objection, a credible alternative, and a recommendation.
5. Stop at a human direction gate.
6. Build isolated, comparable prototypes.
7. Stop at a human Promotion gate.
8. Give one implementation node production write ownership.
9. Run functional QA, UX verification, and risk-triggered security/privacy review.
10. Run independent review against final HEAD.
11. Stop at a human release gate.

The example is not a mandatory pipeline. Remove nodes that add no evidence or safety. Add specialists when the task creates a material new risk.

## Node contract

Every node records:

- `id`, `title`, and a bounded `goal`;
- `kind`: `work` or `human-gate`;
- lifecycle `status`;
- required `capabilities`;
- predecessor `dependencies`;
- `risk`;
- whether it `writesProduction`;
- explicit `writeScope`;
- concrete `deliverables`;
- observable `acceptanceChecks`;
- artifact paths or URLs in `evidence`;
- optional `assignment` metadata;
- a recorded `decision` when a completed human gate approves or rejects work.

A rejected human gate never unlocks dependent work. Reframe or replace the rejected branch of the graph instead.

The validator rejects:

- malformed or empty graphs;
- fields that are outside the versioned schema;
- unknown capabilities;
- duplicate node identifiers, duplicate dependency entries, or missing dependency references;
- dependency cycles;
- `in_progress` or `completed` nodes whose dependencies are not satisfied;
- completed work without at least one recoverable evidence reference;
- completed human gates without a complete decision;
- decisions attached to work or to an incomplete human gate;
- human gates that claim production writes;
- production writers without implementation capability and a write scope;
- more than one `in_progress` production writer.

## Evidence and write isolation

Agent messages are not durable evidence. Use repository paths, test output, rendered captures, source URLs, issue comments, or other recoverable artifacts.

One node owns production writes at a time. Other active nodes should be read-only or write only to isolated research, prototype, or evidence paths. If independent production changes are genuinely necessary, isolate them in separate Git worktrees and integrate them sequentially through one implementation owner.

Before creating a worktree:

```bash
git status --short --branch
git worktree list --porcelain
git branch --all --list '*candidate-name*'
```

Create from an explicit clean base and verify ancestry:

```bash
git worktree add -b feat/example ../TechiesTools-example develop
git -C ../TechiesTools-example status --short --branch
git -C ../TechiesTools-example merge-base HEAD develop
```

The version 1 graph has no worktree field and does not create or delete worktrees. Record worktree ownership in the linked issue or a recoverable evidence artifact.

## Files and commands

- Schema: `agent-graphs/schema.v1.json`
- Full example: `agent-graphs/adaptive-feature.example.json`
- Runtime model and validator: `src/agent-graph/index.ts`
- CLI: `scripts/agent-graph.mjs`

Validate a graph:

```bash
npm run --silent agent-graph:validate -- agent-graphs/adaptive-feature.example.json
```

Inspect the current ready frontier:

```bash
npm run --silent agent-graph:ready -- agent-graphs/adaptive-feature.example.json
```

Both documented commands suppress npm's banner, so their complete standard output is one JSON document. Exit code `0` means the command succeeded, `1` means the graph or input is invalid, and `2` means CLI usage is invalid.

## Status and gate updates

Version 1 intentionally has no mutation command. Update graph files through normal reviewed repository edits so status, evidence, decisions, and ownership remain visible in the diff.

A work node is ready when it is `pending` and every dependency is satisfied. Completed work satisfies a dependency only when it has at least one recoverable evidence reference. A completed human gate satisfies a dependency only when its decision outcome is `approved`.

The ready frontier contains at most one production-writing node. If a production writer is already `in_progress`, no other production writer is ready. If several pending writers become eligible together, graph order deterministically selects the first; later writers become eligible after that owner completes.

Version 1 enforces the completed-work evidence reference, dependency state, and human decision. It does not machine-verify individual deliverables or acceptance checks; operators and reviewers must execute those checks and preserve their results in evidence.

Before marking a work node `completed`:

1. Store each required deliverable.
2. Run every acceptance check.
3. Add recoverable evidence.
4. Confirm changed write scopes.
5. Validate the graph again.

Before approving a human gate, record the human decision-maker and rationale. Agents may prepare a recommendation but cannot approve a human gate.
