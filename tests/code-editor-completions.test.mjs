import assert from "node:assert/strict";
import test from "node:test";

import { codeCompletions, completionTarget } from "../src/code-editor/completions.ts";

test("CSS completion suggests declarations without constraining free-form source", () => {
	const source = ".card {\n\tdis\n}";
	const offset = source.indexOf("dis") + 3;
	assert.deepEqual(completionTarget({ language:"css", source, offset }), {
		start:source.indexOf("dis"),
		end:offset,
		query:"dis",
		kind:"css-property",
	});
	assert.ok(codeCompletions({ language:"css", source, offset }).some(({ label, insertText }) => label === "display" && insertText === "display: ;"));
	assert.equal(codeCompletions({ language:"css", source:".card {\n\tmade-up: value;\n}", offset:18 }).length, 0);
	const inlineSource = ".btn:hover { color:red; dis";
	assert.equal(completionTarget({ language:"css", source:inlineSource, offset:inlineSource.length })?.kind, "css-property");
	assert.ok(codeCompletions({ language:"css", source:inlineSource, offset:inlineSource.length }).some(({ label }) => label === "display"));
	const quotedDelimiter = '.card { content:"x; dis';
	assert.equal(completionTarget({ language:"css", source:quotedDelimiter, offset:quotedDelimiter.length }), null);
	const multilineValue = ".card { background: linear-gradient(\n re";
	assert.equal(completionTarget({ language:"css", source:multilineValue, offset:multilineValue.length })?.kind, "css-value");
	const cssComment = ".card { color:red; /* dis";
	assert.equal(completionTarget({ language:"css", source:cssComment, offset:cssComment.length }), null);
	const existingProperty = ".card { display: block; }";
	const partialOffset = existingProperty.indexOf("display") + 3;
	assert.equal(completionTarget({ language:"css", source:existingProperty, offset:partialOffset })?.end, existingProperty.indexOf("display") + "display".length);
	assert.equal(codeCompletions({ language:"css", source:existingProperty, offset:partialOffset }).find(({ label }) => label === "display")?.insertText, "display");
});

test("CSS value completion includes Framework variables", () => {
	const source = ".btn {\n\tcolor: var(--semantic-a\n}";
	const offset = source.indexOf("--semantic-a") + "--semantic-a".length;
	const target = completionTarget({ language:"css", source, offset });
	assert.equal(target?.kind, "css-value");
	assert.ok(codeCompletions({ language:"css", source, offset }).some(({ insertText }) => insertText === "var(--semantic-action)"));
	const customSource = ".card {\n\t--card-accent: red;\n\tcolor: var(--card-a\n}";
	const customOffset = customSource.indexOf("--card-a", customSource.indexOf("color")) + "--card-a".length;
	assert.ok(codeCompletions({ language:"css", source:customSource, offset:customOffset, additionalValues:["var(--card-accent)"] }).some(({ insertText }) => insertText === "var(--card-accent)"));
});

test("HTML completion suggests tags and attributes while keeping arbitrary markup editable", () => {
	const tagSource = "<art";
	assert.deepEqual(completionTarget({ language:"html", source:tagSource, offset:tagSource.length }), {
		start:1,
		end:4,
		query:"art",
		kind:"html-tag",
	});
	assert.ok(codeCompletions({ language:"html", source:tagSource, offset:tagSource.length }).some(({ insertText }) => insertText === "article"));
	for (const tag of ["input", "table", "textarea", "pre", "video"]) {
		const source = `<${tag.slice(0, 2)}`;
		assert.ok(codeCompletions({ language:"html", source, offset:source.length }).some(({ insertText }) => insertText === tag));
	}
	for (const tag of ["iframe", "link", "meta", "script", "style"]) {
		const source = `<${tag}`;
		assert.ok(!codeCompletions({ language:"html", source, offset:source.length }).some(({ insertText }) => insertText === tag));
	}

	const attributeSource = '<article cla>';
	const offset = attributeSource.indexOf("cla") + 3;
	assert.ok(codeCompletions({ language:"html", source:attributeSource, offset }).some(({ insertText }) => insertText === 'class=""'));
	const quotedSource = '<a href="cla';
	assert.equal(completionTarget({ language:"html", source:quotedSource, offset:quotedSource.length }), null);
	assert.equal(codeCompletions({ language:"html", source:quotedSource, offset:quotedSource.length }).length, 0);
	const htmlComment = "<!-- <di";
	assert.equal(completionTarget({ language:"html", source:htmlComment, offset:htmlComment.length }), null);
	assert.equal(codeCompletions({ language:"html", source:"plain text", offset:5 }).length, 0);
});
