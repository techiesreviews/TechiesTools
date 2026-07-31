#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  readyAgentNodes,
  validateAgentGraph,
} from "../src/agent-graph/index.ts";

const args = process.argv.slice(2);
const [command, inputPath] = args;
const usage = "Usage: agent-graph <validate|ready> <graph.json>";

if (args.length !== 2 || (command !== "validate" && command !== "ready")) {
  process.stdout.write(`${JSON.stringify({ valid: false, issues: [usage] }, null, 2)}\n`);
  process.exitCode = 2;
} else {
  try {
    const input = JSON.parse(await readFile(resolve(inputPath), "utf8"));
    const result = validateAgentGraph(input);

    if (!result.valid || !result.graph) {
      process.stdout.write(`${JSON.stringify({ valid: false, issues: result.issues }, null, 2)}\n`);
      process.exitCode = 1;
    } else if (command === "validate") {
      process.stdout.write(`${JSON.stringify({ valid: true, graphId: result.graph.id, issues: [] }, null, 2)}\n`);
    } else {
      const ready = readyAgentNodes(result.graph).map((node) => ({
        id: node.id,
        kind: node.kind,
        capabilities: node.capabilities,
        risk: node.risk,
        writesProduction: node.writesProduction,
      }));
      process.stdout.write(`${JSON.stringify({ valid: true, graphId: result.graph.id, ready }, null, 2)}\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`${JSON.stringify({ valid: false, issues: [message] }, null, 2)}\n`);
    process.exitCode = 1;
  }
}
