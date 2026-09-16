import assert from 'node:assert/strict';
import test from 'node:test';
import { patternDefinitions } from '../src/patterns/registry.ts';
import { compilePattern, defaultPatternState, parseStoredPatternState, serializePatternState, setPatternStylesheet, setPatternExportName } from '../src/patterns/engine.ts';
import { cssRuleRange } from '../src/patterns/inspector-source.ts';
import { formatCss } from '../src/code-editor/format.ts';

const listing = patternDefinitions.find(d => d.id === 'listing-card');

test('all migrated Patterns round-trip scoped overrides after export renaming', () => {
  for (const definition of patternDefinitions) {
    const renamed = setPatternExportName(definition, defaultPatternState(definition), 'Client section');
    const compiled = compilePattern(definition, renamed);
    assert.equal(compiled.state.exportName, 'client-section_component');
    const edited = setPatternStylesheet(definition, renamed, compiled.css.replace(':scope {', ':scope {\n--client-value: 17;'));
    assert.equal(edited.success, true, definition.id);
    assert.match(compilePattern(definition, edited.state).css, /--client-value: 17;/);
    const restored = parseStoredPatternState(definition, serializePatternState(definition, edited.state));
    assert.equal(compilePattern(definition, restored).css, compilePattern(definition, edited.state).css);
  }
});

test('scope validation rejects global rules, unrelated roots, missing limits, and resource loads', () => {
  const compiled = compilePattern(listing);
  for (const css of [
    compiled.css + '\nbody { display: none; }',
    compiled.css.replaceAll('to ([class*="_component"])', ''),
    compiled.css + '\n@scope (body) to ([class*="_component"]) { p { color: red; } }',
    compiled.css + '\n@scope (.listing-card_component + body) to ([class*="_component"]) { p { color: red; } }',
    compiled.css.replace(':scope {', ':scope { background: url(https://example.com/private);'),
    compiled.css + '\n@import "https://example.com/styles.css";',
  ]) assert.equal(setPatternStylesheet(listing, compiled.state, css).success, false, css.slice(-100));
  const edited = setPatternStylesheet(listing, compiled.state, compiled.css.replace('.media {', '.media {\n--_columns: 3;'));
  assert.equal(edited.success, true);
  assert.match(compilePattern(listing, edited.state).css, /--_columns: 3;/);
});

test('legacy drafts preserve authored markup, declarations, queries, and names', () => {
  const old = {
    source: '--custom: 17; padding: 3rem; container: pattern-listing-card / inline-size;',
    nestedSource: '& .pattern-listing-card__body { color: rebeccapurple; }',
    supportSource: '@container pattern-listing-card (width > 30rem) { .pattern-listing-card .pattern-listing-card__body { padding: 4rem; } }',
    htmlSource: '<article class="pattern-listing-card"><div class="pattern-listing-card__body">My saved copy</div></article>',
    attributes: { 'data-media': 'cover' }, exportName: 'my-property',
  };
  const state = parseStoredPatternState(listing, JSON.stringify({ version: 3, patternId: listing.id, state: old }));
  const compiled = compilePattern(listing, state);
  assert.match(compiled.html, /My saved copy/);
  assert.match(compiled.html, /class="my-property_component"/);
  assert.match(compiled.css, /--custom: 17;/);
  assert.match(compiled.css, /color: rebeccapurple;/);
  assert.match(compiled.css, /@container my-property_component/);
  assert.match(compiled.css, /padding: 4rem;/);
  assert.equal(setPatternStylesheet(listing, state, compiled.css).success, true);
  assert.deepEqual(parseStoredPatternState(listing, serializePatternState(listing, state)), state);
});

test('inspector finds the correct root declaration in independent component scopes', () => {
  const css = '@scope (.hero_component) to ([class*="_component"]) { :scope { padding: 1rem; } }\n@scope (.hero_component .button_component) to ([class*="_component"]) { :scope { --btn-radius: 0; } }';
  const range = cssRuleRange(css, [{ selector: ':scope', scope: '.hero_component .button_component' }]);
  assert.equal(css.slice(range.start, range.end), ':scope { --btn-radius: 0; }');
});

test('CSS formatting retains underscore custom property punctuation', () => {
  assert.equal(formatCss('@scope (.hero_component) { .layout-grid { --_columns:2 } }'), '@scope (.hero_component) {\n\t.layout-grid {\n\t\t--_columns: 2;\n\t}\n}');
});
