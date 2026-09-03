import assert from "node:assert/strict";
import test from "node:test";
import {
  clampDrawerHeight,
  editorSplitFromPointer,
  nextDrawerHeight,
  nextEditorSplit,
} from "../src/patterns/advanced-layout.ts";

test("drawer height stays usable while preserving visible Preview space", () => {
  assert.equal(clampDrawerHeight(80, 900), 160);
  assert.equal(clampDrawerHeight(1200, 900), 740);
  assert.equal(clampDrawerHeight(420, 900), 420);
  assert.equal(clampDrawerHeight(220, 300), 160);
});

test("drawer keyboard resizing follows the top handle direction", () => {
  assert.equal(nextDrawerHeight(400, "ArrowUp", 900), 424);
  assert.equal(nextDrawerHeight(400, "ArrowDown", 900), 376);
  assert.equal(nextDrawerHeight(400, "Home", 900), 160);
  assert.equal(nextDrawerHeight(400, "End", 900), 740);
  assert.equal(nextDrawerHeight(400, "Enter", 900), undefined);
});

test("editor split supports pointer and keyboard resizing on both axes", () => {
  assert.equal(editorSplitFromPointer(10, 0, 100), 20);
  assert.equal(editorSplitFromPointer(55, 0, 100), 55);
  assert.equal(editorSplitFromPointer(95, 0, 100), 80);
  assert.equal(nextEditorSplit(50, "ArrowLeft", "vertical"), 45);
  assert.equal(nextEditorSplit(50, "ArrowRight", "vertical"), 55);
  assert.equal(nextEditorSplit(50, "ArrowUp", "horizontal"), 45);
  assert.equal(nextEditorSplit(50, "ArrowDown", "horizontal"), 55);
  assert.equal(nextEditorSplit(50, "End", "horizontal"), 80);
  assert.equal(nextEditorSplit(50, "Enter", "horizontal"), undefined);
});
