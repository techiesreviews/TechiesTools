import assert from "node:assert/strict";
import test from "node:test";
import { createPatternSession } from "../src/patterns/session.ts";
import { parseStoredPatternState, patternStorageKey } from "../src/patterns/engine.ts";
import { getPatternDefinition, patternDefinitions } from "../src/patterns/registry.ts";

const memoryStorage = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
};
const blockedStorage = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); },
  removeItem() { throw new Error("blocked"); },
};
const button = getPatternDefinition("button");
const listing = getPatternDefinition("listing-card");

test("a session restores, edits, and persists Pattern state through its storage", () => {
  const storage = memoryStorage();
  const session = createPatternSession(button, storage);
  assert.equal(session.storageKey, patternStorageKey(button));
  assert.equal(storage.values.size, 0, "loading does not write");

  session.setExportName("Hero Action");
  assert.equal(session.compilation.state.exportName, "hero-action_component");
  assert.equal(session.artifactName("css"), "hero-action_component.css");
  assert.equal(parseStoredPatternState(button, storage.values.get(session.storageKey)).exportName, "hero-action_component");

  const restored = createPatternSession(button, storage);
  assert.equal(restored.compilation.state.exportName, "hero-action_component");
});

test("rejected edits keep the last valid compilation and do not persist", () => {
  const storage = memoryStorage();
  const session = createPatternSession(listing, storage);
  const before = session.compilation;
  const css = session.editCss(".unrelated { color: red; }");
  assert.equal(css.success, false);
  assert.match(css.message, /invalid or unsafe|bounded/);
  const html = session.editHtml("<script>alert(1)</script>");
  assert.equal(html.success, false);
  assert.equal(session.compilation, before);
  assert.equal(storage.values.size, 0);
});

test("accepted CSS edits recompile once and round-trip through the full stylesheet", () => {
  const session = createPatternSession(listing, memoryStorage());
  const edited = session.compilation.css.replace(/:scope \{/, ":scope {\n    outline: 1px solid red;");
  assert.deepEqual(session.editCss(edited), { success: true });
  assert.match(session.compilation.css, /outline: 1px solid red/);
  assert.ok(session.previewCss.startsWith(`@scope ([data-pattern-scope="${listing.id}"])`));
  assert.ok(session.previewCss.includes(session.compilation.css));
});

test("inspected elements project and splice their own HTML fragment", () => {
  const session = createPatternSession(listing, memoryStorage());
  const source = session.elementSource(1, []);
  assert.ok(source.html);
  assert.ok(source.htmlFragment.startsWith("<"));
  assert.equal(source.cssOffset, 0);
  const marked = source.htmlFragment.replace(/^<([a-z0-9-]+)/, '<$1 data-edited="yes"');
  assert.deepEqual(session.editHtmlFragment(source.html, marked), { success: true });
  assert.match(session.compilation.html, /data-edited="yes"/);
  assert.equal(session.elementSource(10_000, []).html, null);
  assert.equal(session.elementSource(10_000, []).htmlFragment, "");
});

test("the matching CSS rule offset points at its selector", () => {
  const session = createPatternSession(listing, memoryStorage());
  const { cssOffset } = session.elementSource(0, [{ selector: ":scope", scope: ".listing-card_component" }]);
  assert.ok(cssOffset > 0);
  assert.ok(session.compilation.css.slice(cssOffset).startsWith(":scope"));
});

test("controls, reset, and adopted storage follow the session", () => {
  const storage = memoryStorage();
  const session = createPatternSession(button, storage);
  const control = button.controls[0];
  const option = control.options[1];
  session.setControl(control.id, option.id);
  assert.equal(session.selectedOption(control.id), option.id);
  const written = storage.values.get(session.storageKey);

  session.reset();
  assert.equal(storage.values.has(session.storageKey), false);
  assert.equal(session.selectedOption(control.id), control.options[0].id);

  session.adoptStored(written);
  assert.equal(session.selectedOption(control.id), option.id);
  assert.equal(storage.values.has(session.storageKey), false, "adopting another document's write does not echo it");
});

test("blocked storage leaves authoring available in memory", () => {
  const session = createPatternSession(button, blockedStorage);
  session.setExportName("offline");
  session.reset();
  assert.equal(session.compilation.state.exportName, "button_component");
});

test("every library Pattern exposes complete export artifacts from its session", () => {
  for (const definition of patternDefinitions) {
    const session = createPatternSession(definition);
    const artifacts = session.artifacts({ tokenCss: ":root {}" });
    assert.match(artifacts.css, /@layer patterns \{/);
    assert.ok(artifacts.html.includes(`href="./${session.artifactName("css")}"`));
    assert.equal(session.packageArtifacts({ tokenCss: ":root {}" }).name, `${session.compilation.state.exportName}.zip`);
  }
});
