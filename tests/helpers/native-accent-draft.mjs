import assert from "node:assert/strict";

export const assertNativeAccentDraft = (element, path, selector) => {
  assert.equal(element.lifecycle, "Draft");
  assert.ok(element.definition);
  assert.deepEqual(element.rules.map((item) => item.path), [path]);
  assert.equal(element.rules[0].rule.selector, selector);
  assert.deepEqual(Object.keys(element.rules[0].rule.declarations), ["accent-color"]);
  assert.deepEqual(element.rules[0].rule.declarations["accent-color"].starter, {
    kind: "token",
    family: "semantic",
    name: "action",
  });
};
