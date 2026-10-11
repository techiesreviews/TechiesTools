import assert from "node:assert/strict";
import test from "node:test";
import { elementSelectionView, noElementSelection, restoreElementSelection, selectElement, selectTreatmentRule } from "../src/framework/element-selection.ts";

const catalog = {
  elements: { button: { title: "Button", intent: "Actions" }, time: { title: "Time", intent: "Text" } },
  treatmentIds: ["button"],
  referencePath: "/framework/elements",
};

test("Treatment Elements start on their base rule; native Elements have no rule", () => {
  assert.deepEqual(selectElement(catalog, noElementSelection, "button"), { selectedElement: "button", treatmentRule: "base" });
  assert.deepEqual(selectElement(catalog, noElementSelection, "button", "hover"), { selectedElement: "button", treatmentRule: "hover" });
  assert.deepEqual(selectElement(catalog, noElementSelection, "time", "hover"), { selectedElement: "time", treatmentRule: null });
});

test("unknown Elements keep the current selection", () => {
  const current = selectElement(catalog, noElementSelection, "button");
  assert.equal(selectElement(catalog, current, "marquee"), current);
});

test("rule changes apply only to a Treatment selection", () => {
  const button = selectElement(catalog, noElementSelection, "button");
  assert.equal(selectTreatmentRule(button, "hover").treatmentRule, "hover");
  const time = selectElement(catalog, noElementSelection, "time");
  assert.equal(selectTreatmentRule(time, "hover"), time);
  assert.equal(selectTreatmentRule(noElementSelection, "hover"), noElementSelection);
});

test("restoring drops Elements that no longer exist", () => {
  assert.deepEqual(restoreElementSelection(catalog, { selectedElement: "button", treatmentRule: "active" }), { selectedElement: "button", treatmentRule: "active" });
  assert.equal(restoreElementSelection(catalog, { selectedElement: "gone", treatmentRule: null }), noElementSelection);
  assert.equal(restoreElementSelection(catalog, undefined), noElementSelection);
});

test("the view deep-links to the Element Reference and labels the picker", () => {
  const view = elementSelectionView(catalog, selectElement(catalog, noElementSelection, "button"));
  assert.deepEqual(view, {
    selected: "button",
    hasTreatment: true,
    treatmentRule: "base",
    pickerLabel: "Button",
    pickerMeta: "Actions › <button>",
    link: { href: "/framework/elements#button", label: "Open <button>" },
  });
  assert.equal(elementSelectionView(catalog, noElementSelection).link, null);
  assert.equal(elementSelectionView(catalog, selectElement(catalog, noElementSelection, "time"), "Time element").pickerLabel, "Time element");
});
