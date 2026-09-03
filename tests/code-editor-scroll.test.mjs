import assert from "node:assert/strict";
import test from "node:test";

import { syncCodeEditorScroll } from "../src/code-editor/scroll-sync.ts";

const clampedViewport = (maxTop, maxLeft) => {
	let top = 0;
	let left = 0;
	return {
		get scrollTop() { return top; },
		set scrollTop(value) { top = Math.min(value, maxTop); },
		get scrollLeft() { return left; },
		set scrollLeft(value) { left = Math.min(value, maxLeft); },
		style: { translate:"" },
	};
};

test("editor overlays compensate when hidden scroll viewports clamp before the textarea", () => {
	const source = { scrollTop:120, scrollLeft:45 };
	const syntaxViewport = clampedViewport(105, 29);
	const lineViewport = clampedViewport(105, 0);
	const caretViewport = clampedViewport(105, 29);

	syncCodeEditorScroll({ source, syntaxViewport, lineViewport, caretViewport });

	assert.equal(syntaxViewport.style.translate, "-16px -15px");
	assert.equal(lineViewport.style.translate, "0 -15px");
	assert.equal(caretViewport.style.translate, "-16px -15px");
});
