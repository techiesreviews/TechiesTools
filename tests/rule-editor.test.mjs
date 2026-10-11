import assert from "node:assert/strict";
import test from "node:test";
import { ruleEditorUpdate } from "../src/framework/rule-editor/index.ts";

const target = { elementId: "button", ruleId: "button/hover" };
const state = (reason, source, diagnostics = []) => ({
  reason,
  sources: { button: { "button/hover": source } },
  diagnostics,
  tokens: [
    { id: "semantic.action", cssName: "--semantic-action", value: "#2563eb", type: "color", swatch: "#2563eb" },
    { id: "spacing.m", cssName: "--space-m", value: "1rem", type: "dimension", swatch: "1rem" },
  ],
  elements: [],
});

test("unsent typing is never overwritten, whatever caused the update", () => {
  for (const reason of ["edit", "external", "state", "accessibility-repair"]) {
    assert.equal(ruleEditorUpdate(state(reason, "color: red;"), target, { value: "color: re", dirty: true }).source, null, reason);
  }
});

test("reset replaces even unsent typing", () => {
  assert.equal(ruleEditorUpdate(state("reset", "color: red;"), target, { value: "color: re", dirty: true }).source, "color: red;");
});

test("a clean editor follows canonical source but is untouched when nothing changed", () => {
  assert.equal(ruleEditorUpdate(state("external", "color: blue;"), target, { value: "color: red;", dirty: false }).source, "color: blue;");
  assert.equal(ruleEditorUpdate(state("external", "color: red;"), target, { value: "color: red;", dirty: false }).source, null);
  assert.equal(ruleEditorUpdate(state("state", undefined), target, { value: "x", dirty: false }).source, null);
});

test("errors win over warnings and only this rule's diagnostics count", () => {
  const diagnostics = [
    { code: "w", message: "Warn", repair: "R", channels: [], elementId: "button", ruleId: "button/hover", severity: "warning" },
    { code: "e", message: "Broken", repair: "Fix", channels: [], elementId: "button", ruleId: "button/hover", checklist: ["One"] },
    { code: "o", message: "Other", repair: "R", channels: [], elementId: "a", ruleId: "a/hover" },
  ];
  const update = ruleEditorUpdate(state("edit", "x", diagnostics), target, { value: "x", dirty: false });
  assert.deepEqual(update.issue, { message: "Broken", repair: "Fix", severity: "error", checklist: ["One"] });
  const warningOnly = ruleEditorUpdate(state("edit", "x", diagnostics.slice(0, 1)), target, { value: "x", dirty: false });
  assert.equal(warningOnly.issue.severity, "warning");
  assert.equal(ruleEditorUpdate(state("edit", "x"), target, { value: "x", dirty: false }).issue, null);
});

test("swatches cover color tokens only", () => {
  const { swatches } = ruleEditorUpdate(state("edit", "x"), target, { value: "x", dirty: false });
  assert.deepEqual([...swatches], [["--semantic-action", "#2563eb"]]);
});
