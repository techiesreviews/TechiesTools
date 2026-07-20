import assert from "node:assert/strict";
import test from "node:test";
import { caretScrollPosition } from "../src/components/dashboard/treatment-caret-scroll.ts";

test("caret scroll geometry reveals a caret below the visible editor by the minimum distance", () => {
  const next = caretScrollPosition({
    scrollTop: 40,
    scrollLeft: 30,
    scrollHeight: 600,
    scrollWidth: 800,
    clientHeight: 100,
    clientWidth: 180,
    caretTop: 190,
    caretBottom: 205,
    caretLeft: 80,
    caretRight: 80,
    viewportTop: 100,
    viewportBottom: 200,
    viewportLeft: 20,
    viewportRight: 200,
  });

  assert.deepEqual(next, { scrollTop: 45, scrollLeft: 30 });
});

test("caret scroll geometry reveals each offscreen edge, clamps at content limits, and leaves a visible caret alone", () => {
  const base = {
    scrollTop: 40,
    scrollLeft: 30,
    scrollHeight: 300,
    scrollWidth: 400,
    clientHeight: 100,
    clientWidth: 180,
    viewportTop: 100,
    viewportBottom: 200,
    viewportLeft: 20,
    viewportRight: 200,
  };

  assert.deepEqual(caretScrollPosition({ ...base, caretTop: 90, caretBottom: 105, caretLeft: 10, caretRight: 10 }), { scrollTop: 30, scrollLeft: 20 });
  assert.deepEqual(caretScrollPosition({ ...base, caretTop: 140, caretBottom: 155, caretLeft: 240, caretRight: 240 }), { scrollTop: 40, scrollLeft: 70 });
  assert.deepEqual(caretScrollPosition({ ...base, scrollTop: 195, scrollLeft: 215, caretTop: 250, caretBottom: 320, caretLeft: 250, caretRight: 250 }), { scrollTop: 200, scrollLeft: 220 });
  assert.deepEqual(caretScrollPosition({ ...base, caretTop: 140, caretBottom: 155, caretLeft: 80, caretRight: 80 }), { scrollTop: 40, scrollLeft: 30 });
});
