import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { definePattern } from '../../src/patterns/definition.ts';
import { compilePattern, scopePatternPreviewCss, parseStoredPatternState } from '../../src/patterns/engine.ts';
import { getPatternDefinition } from '../../src/patterns/registry.ts';
import { utilityCss } from '../../src/utilities/index.ts';
import { buttonComponentCss } from '../../src/framework/component-catalog/index.ts';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, args: ['--no-sandbox'] });
const page = await browser.newPage();
const definition = definePattern({
  id: 'scope-check', title: 'Scope check', category: 'Evidence', description: 'Nested isolation fixture',
  selector: '.outer_component', scoped: true, previewScale: 1,
  html: '<section class="outer_component layout-grid"><div class="content">Outer</div><div class="layout-grid" id="grid"><span>A</span><span>B</span></div><article class="inner_component"><h2 class="heading-style-h2">Nested title</h2><div class="content">Inner</div></article></section>',
  defaultCss: '--_columns: 2; color: rgb(1, 2, 3);',
  nestedCss: '.content { color: rgb(255, 0, 0); } .heading-style-h2 { text-transform: uppercase; }',
  supportCss: '@scope (.outer_component .inner_component) to ([class*="_component"]) { :scope { color: rgb(0, 0, 255); } .content { padding: 7px; } }', controls: [],
});
const compiled = compilePattern(definition);
const modes = {};
try {
  for (const mode of ['portable', 'preview']) {
    const css = mode === 'portable' ? `@layer utilities {${utilityCss}}\n${compiled.css}` : scopePatternPreviewCss(definition, compiled.css);
    await page.setContent(`<style>:root{--space-xl:16px} ${css}</style><div data-pattern-scope="scope-check">${compiled.html}</div><p class="content" id="outside">Unrelated</p>`);
    const result = await page.evaluate(() => {
      const style = selector => getComputedStyle(document.querySelector(selector));
      return { outer: style('.outer_component > .content').color, inner: style('.inner_component .content').color, padding: style('.inner_component .content').padding, heading: style('.inner_component h2').textTransform, grid: style('#grid').gridTemplateColumns.split(' ').length, outerGrid: style('.outer_component').gridTemplateColumns.split(' ').length, outside: style('#outside').color };
    });
    assert.equal(result.outer, 'rgb(255, 0, 0)');
    assert.equal(result.inner, 'rgb(0, 0, 255)');
    assert.equal(result.padding, '7px');
    assert.equal(result.heading, 'none');
    assert.equal(result.grid, 1);
    assert.equal(result.outerGrid, 2);
    assert.notEqual(result.outside, 'rgb(255, 0, 0)');
    modes[mode] = result;
  }
  assert.deepEqual(modes.preview, modes.portable);
  const listing = getPatternDefinition('listing-card');
  const saved = { source: '--semantic-action: blue; --semantic-surface: white; --semantic-text: black;', nestedSource: '& .pattern-listing-card__action { --btn-background: rgb(14, 42, 86); --btn-font-size: 19px; }', supportSource: '', htmlSource: '<article class="pattern-listing-card"><a href="#saved" class="btn pattern-listing-card__action">Saved action</a></article>', attributes: {}, exportName: 'saved-card' };
  const migrated = compilePattern(listing, parseStoredPatternState(listing, JSON.stringify({ version: 3, patternId: listing.id, state: saved })));
  await page.setContent(`<style>@layer components {${buttonComponentCss}} ${migrated.css}</style>${migrated.html}`);
  modes.legacyButton = await page.locator('a').evaluate(e => ({ color: getComputedStyle(e).backgroundColor, font: getComputedStyle(e).fontSize }));
  assert.deepEqual(modes.legacyButton, { color: 'rgb(14, 42, 86)', font: '19px' });
} finally {
  await browser.close();
}
await writeFile('evidence/dry-pattern-migration/scope-results.json', JSON.stringify(modes, null, 2));
console.log('Nested scope boundaries, inheritance, grid defaults, Preview/export parity, and legacy Button hooks passed.');
