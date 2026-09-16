import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compilePattern, defaultPatternState, setPatternExportName } from "../src/patterns/engine.ts";
import { patternDefinitions } from "../src/patterns/registry.ts";
import { compilePatternArtifacts, packagePatternArtifacts, patternArtifactFiles } from "../src/patterns/package-artifacts.ts";
import { utilityCss } from "../src/utilities/index.ts";
import { getComponentDefinition } from "../src/framework/component-catalog/index.ts";
import { formatCss } from "../src/code-editor/format.ts";

const context = { tokenCss: readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8") };
const normalize = value => formatCss(value).replace(/\s+/g, " ").trim();

test("all Pattern bundles contain canonical tokens, defaults, dependencies, local CSS, and runnable markup", () => {
  for (const definition of patternDefinitions) {
    const compilation = compilePattern(definition);
    const { css, html } = compilePatternArtifacts(compilation, context);
    assert.match(css, /@layer tokens, elements, utilities, components, patterns;/);
    for (const source of [context.tokenCss, utilityCss, compilation.css,
      ...(definition.dependencies ?? []).map(id => getComponentDefinition(id).css)]) {
      assert.ok(normalize(css).includes(normalize(source)), `${definition.id} shared source preserved`);
    }
    assert.ok(css.indexOf("@layer tokens {") < css.indexOf("@layer utilities {"));
    assert.ok(css.indexOf("@layer utilities {") < css.indexOf("@layer patterns {"));
    assert.ok(!css.includes(compilation.html));
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /<body class="pattern-document">/);
    assert.ok(html.includes(compilation.html));
    assert.ok(html.includes(`href="./${compilation.state.exportName}.css"`));
    assert.doesNotMatch(html, /<script|<style/);
    assert.doesNotMatch(compilation.css, /@layer tokens|--color-primary-lightest:/);
  }
});

test("exports preserve configured aliases, fluid values, validated fonts, and renamed roots", () => {
  const definition = patternDefinitions.find(d => d.id === "listing-card");
  const compilation = compilePattern(definition, setPatternExportName(definition, defaultPatternState(definition), "my-card"));
  const theme = { version: 1, contentHash: "export-test", variables: {
    "--brand-accent": "#123456", "--semantic-action": "var(--brand-accent)",
    "--space-xl": "clamp(1rem, 2vw, 3rem)", "--invalid": "red; background: blue",
  }, fontStylesheet: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" };
  const { css, html } = compilePatternArtifacts(compilation, { ...context, theme });
  assert.match(css, /--brand-accent: #123456;/);
  assert.match(css, /--semantic-action: var\(--brand-accent\);/);
  assert.match(css, /--space-xl: clamp\(1rem, 2vw, 3rem\);/);
  assert.doesNotMatch(css, /--invalid/);
  assert.ok(css.indexOf("@import") < css.indexOf("@layer tokens {"));
  assert.match(css, /@import url\("https:\/\/fonts.googleapis.com\/css2[^\n]+ layer\(tokens\);/);
  assert.match(css, /@scope \(\.my-card_component\)/);
  assert.match(html, /class="my-card_component/);
  assert.match(html, /href="\.\/my-card_component\.css"/);
  assert.doesNotMatch(compilePatternArtifacts(compilation, { ...context, theme: { ...theme, fontStylesheet: "https://example.com/font.css" } }).css, /@import/);
  assert.doesNotMatch(compilePatternArtifacts(compilation, context).css, /--brand-accent/);
});

test("separate CSS preserves authored strings and comparisons without entering the HTML document", () => {
  const base = compilePattern(patternDefinitions[0]);
  const compilation = { ...base, definition: { ...base.definition, title: '<Example> & "test"' },
    css: base.css + '\n@media (width < 50rem) { .example { content: "</style><script>alert(1)</script>"; } }' };
  const { css, html } = compilePatternArtifacts(compilation, context);
  assert.match(css, /@media \(width < 50rem\)/);
  assert.match(css, /content: "<\/style>/);
  assert.doesNotMatch(html, /<script|<style/);
  assert.match(html, /<title>&lt;Example&gt; &amp; &quot;test&quot;<\/title>/);
  assert.ok(html.includes(compilation.html));
});

test("ZIP entries preserve the exact same layered CSS and linked HTML bytes", () => {
  const compilation = compilePattern(patternDefinitions.find(d => d.id === "stacked-scroll-panel"));
  const expected = patternArtifactFiles(compilation, context);
  const archive = packagePatternArtifacts(compilation, context);
  const bytes = archive.value;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;
  for (const file of expected) {
    assert.equal(view.getUint32(offset, true), 0x04034b50);
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const start = offset + 30;
    const contentStart = start + nameLength + extraLength;
    assert.equal(decoder.decode(bytes.subarray(start, start + nameLength)), file.name);
    assert.equal(decoder.decode(bytes.subarray(contentStart, contentStart + size)), file.value);
    offset = contentStart + size;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50);
});
