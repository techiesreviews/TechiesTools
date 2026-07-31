import assert from "node:assert/strict";
import test from "node:test";
import { evaluateContrastChecks, prepareAccessibilityRepair } from "../src/framework/accessibility/index.ts";

const framework = {
  identity: { id: "test", name: "Test" },
  primitives: [
    { id: "semantic.muted", cssName: "--muted", value: "#777777", type: "color" },
    { id: "semantic.black", cssName: "--black", value: "#000000", type: "color" },
    { id: "semantic.text", cssName: "--text", value: "#111827", type: "color" },
    { id: "semantic.surface", cssName: "--surface", value: "#ffffff", type: "color" },
    { id: "semantic.primary", cssName: "--primary", value: "#1d4ed8", type: "color" },
  ],
  elements: [{
    id: "button",
    title: "Button",
    group: "Actions",
    order: 1,
    version: "1.0.0",
    purpose: "Act.",
    treatment: "Treat.",
    use: ["Use."],
    avoid: "Avoid.",
    constraints: ["Keep semantics."],
    accessibility: ["Keep focus."],
    semanticHtml: "<button>Save</button>",
    variants: [],
    rules: [{
      id: "disabled",
      sourceId: "disabled",
      kind: "state",
      selector: ":where(button:disabled)",
      state: "disabled",
      declarations: [
        { property: "color", value: { kind: "token", family: "semantic", name: "muted" }, cssValue: "var(--muted)", tokenId: "semantic.muted", cssVariable: "--muted" },
        { property: "background-color", value: { kind: "token", family: "semantic", name: "surface" }, cssValue: "var(--surface)", tokenId: "semantic.surface", cssVariable: "--surface" },
      ],
    }],
  }],
};

const checks = [{
  id: "button-disabled-text",
  elementId: "button",
  kind: "normal-text",
  subject: { rulePath: "button/disabled", property: "color", editable: true, compatibleTokenIds: ["semantic.muted", "semantic.text", "semantic.primary"] },
  comparison: { rulePath: "button/disabled", property: "background-color", editable: false, compatibleTokenIds: ["semantic.surface", "semantic.black"] },
}];

test("contrast evaluation warns without blocking and offers at most two existing-token AA repairs", () => {
  const result = evaluateContrastChecks({ framework, checks });
  assert.equal(result.length, 1);
  assert.equal(result[0].message, "Contrast can be improved.");
  assert.equal(result[0].ratio.toFixed(2), "4.48");
  assert.ok(result[0].repairs.length > 0 && result[0].repairs.length <= 2);
  assert.equal(result[0].repairs[0].value.kind, "token");
  assert.ok(result[0].repairs[0].ratio >= 4.5);
  assert.match(result[0].repairs[0].rating, /AA/);
});

test("repair preparation revalidates one existing-token declaration without mutating Framework state", () => {
  const advisory = evaluateContrastChecks({ framework, checks })[0];
  const before = structuredClone(framework);
  const prepared = prepareAccessibilityRepair({ framework, repair: advisory.repairs[0] });
  assert.equal(prepared.success, true);
  assert.equal(prepared.data.rulePath, "button/disabled");
  assert.equal(prepared.data.property, "color");
  assert.deepEqual(framework, before);
});

test("repair preparation rejects a stale proposal after either measured declaration changes", () => {
  const repair = evaluateContrastChecks({ framework, checks })[0].repairs[0];
  const changed = structuredClone(framework);
  const target = changed.elements[0].rules[0].declarations.find((item) => item.property === repair.property);
  target.tokenId = "semantic.text";
  target.value = { kind: "token", family: "semantic", name: "text" };
  target.cssValue = "var(--text)";
  assert.equal(prepareAccessibilityRepair({ framework: changed, repair }).success, false);
});

test("contrast evaluation may repair the compatible comparison side", () => {
  const result = evaluateContrastChecks({
    framework,
    checks: [{
      ...checks[0],
      subject: { ...checks[0].subject, editable: false },
      comparison: { ...checks[0].comparison, editable: true },
    }],
  });
  assert.equal(result.length, 1);
  assert.ok(result[0].repairs.some((repair) => repair.property === "background-color"));
  assert.ok(result[0].repairs.every((repair) => ["semantic.surface", "semantic.black"].includes(repair.tokenId)));
});

test("configured contrast checks warn instead of disappearing when measurement or repair is unavailable", () => {
  const unresolved = structuredClone(framework);
  unresolved.primitives.find((token) => token.id === "semantic.surface").value = "currentcolor";
  const measurement = evaluateContrastChecks({ framework: unresolved, checks });
  assert.equal(measurement.length, 1);
  assert.equal(measurement[0].ratio, null);
  assert.match(measurement[0].reason, /could not be measured/);

  const noRepair = evaluateContrastChecks({
    framework,
    checks: [{ ...checks[0], subject: { ...checks[0].subject, compatibleTokenIds: ["semantic.muted"] } }],
  });
  assert.equal(noRepair.length, 1);
  assert.equal(noRepair[0].repairs.length, 0);
  assert.match(noRepair[0].reason, /No compatible existing Token/);
});
