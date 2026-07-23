import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { deriveElementReferenceState, isSemanticVersion, isStableTreatment } from "../src/framework/element-lifecycle.ts";

const expectedActive = ["a", "abbr", "blockquote", "button", "cite", "code", "em", "fieldset", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "input", "input-email", "input-password", "input-search", "input-tel", "input-text", "input-url", "kbd", "label", "legend", "mark", "output", "p", "pre", "select", "small", "strong", "textarea"];

test("accepts strict Semantic Versions", () => {
  for (const version of ["0.1.0", "1.0.0", "2.3.4-beta.1+build.7"]) assert.equal(isSemanticVersion(version), true);
  for (const version of ["1.0", "01.0.0", "1.0.0-01", "v1.0.0"]) assert.equal(isSemanticVersion(version), false);
  assert.equal(isStableTreatment("1.0.0-beta"), false);
});

test("derives Native, Draft, and Active from Treatment Version plus Activation Evidence", () => {
  const base = { version: "1.0.0", baseline: { status: "widely-available", source: "mdn", sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a", checkedAt: "2026-07-16" }, deprecated: false, activationEvidence: { definition: { status: "pass" } } };
  assert.equal(deriveElementReferenceState({ ...base, version: "0.0.0", activationEvidence: undefined }), "Native");
  assert.equal(deriveElementReferenceState({ ...base, version: "0.1.0" }), "Draft");
  assert.equal(deriveElementReferenceState({ ...base, activationEvidence: undefined }), "Native");
  assert.equal(deriveElementReferenceState({ ...base, baseline: { ...base.baseline, status: "limited-availability" } }), "Native");
  assert.equal(deriveElementReferenceState(base), "Active");
  assert.equal(deriveElementReferenceState({ ...base, deprecated: true }), "Active");
});

test("inventory has complete independent lifecycle metadata and no legacy visual status", () => {
  const directory = join(process.cwd(), "src", "content", "elements");
  const files = readdirSync(directory).filter((file) => file.endsWith(".md"));
  const baselineStatusByFile = new Map();
  const versionByFile = new Map();
  const referenceStateByFile = new Map();
  assert.equal(files.length, 92);
  for (const file of files) {
    const content = readFileSync(join(directory, file), "utf8");
    assert.match(content, /^version: "(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"$/m);
    assert.match(content, /^baseline: \{ status: "(?:widely-available|limited-availability|unknown\/not-applicable)", source: "mdn", sourceUrl: "https:\/\/developer\.mozilla\.org\/.+", checkedAt: "2026-07-(?:16|23)"(?:, note: ".+")? \}$/m);
    assert.match(content, /^deprecated: false$/m);
    assert.doesNotMatch(content, /^status:/m);
    const baseline = content.match(/^baseline: \{ status: "([^"]+)", source: "mdn", sourceUrl: "([^"]+)", checkedAt: "2026-07-(?:16|23)"(?:, note: "([^"]+)")? \}$/m);
    const sourceUrl = content.match(/^sourceUrl: "([^"]+)"$/m);
    const version = content.match(/^version: "([^"]+)"$/m);
    assert.ok(baseline);
    assert.ok(sourceUrl);
    assert.ok(version);
    assert.equal(baseline[2], sourceUrl[1]);
    baselineStatusByFile.set(file.replace(/\.md$/, ""), baseline[1]);
    versionByFile.set(file.replace(/\.md$/, ""), version[1]);
    referenceStateByFile.set(file.replace(/\.md$/, ""), deriveElementReferenceState({
      version: version[1],
      baseline: { status: baseline[1], source: "mdn", sourceUrl: baseline[2], checkedAt: "2026-07-16", ...(baseline[3] ? { note: baseline[3] } : {}) },
      deprecated: false,
      activationEvidence: content.includes("activationEvidence:") ? {} : undefined,
    }));
    if (baseline[1] === "unknown/not-applicable") assert.ok(baseline[3]);
  }
  assert.equal([...baselineStatusByFile.values()].filter((status) => status === "widely-available").length, 87);
  assert.deepEqual([...baselineStatusByFile].filter(([, status]) => status === "limited-availability").map(([file]) => file).sort(), ["datalist", "input-month", "input-week"]);
  assert.deepEqual([...baselineStatusByFile].filter(([, status]) => status === "unknown/not-applicable").map(([file]) => file).sort(), ["input-checkbox", "input-color"]);
  assert.equal([...versionByFile.values()].filter((version) => version === "1.0.0").length, expectedActive.length);
  assert.equal([...versionByFile.values()].filter((version) => version === "0.0.0").length, files.length - expectedActive.length);
  assert.deepEqual([...versionByFile].filter(([, version]) => version === "1.0.0").map(([file]) => file).sort(), expectedActive);
  assert.equal([...referenceStateByFile.values()].filter((state) => state === "Draft").length, 0);
  assert.equal([...referenceStateByFile.values()].filter((state) => state === "Native").length, files.length - expectedActive.length);
  assert.equal([...referenceStateByFile.values()].filter((state) => state === "Active").length, expectedActive.length);
});

test("Element Reference source keeps Draft and Native visual guidance native", () => {
  const source = readFileSync(join(process.cwd(), "src", "components", "dashboard", "ElementReference.astro"), "utf8");
  assert.match(source, /referenceState\(entry\) === "Active" \? <p><strong>Default treatment/);
  assert.match(source, /Native Fallback/);
  assert.doesNotMatch(source, /data-status|entry\.data\.status/);
  assert.doesNotMatch(source, /data-element-search-value=.*entry\.data\.treatment/);
});
