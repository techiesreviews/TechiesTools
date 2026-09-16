import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compilePattern, defaultPatternState, setPatternExportName, serializePatternState, patternStorageKey } from '../../src/patterns/engine.ts';
import { compilePatternArtifacts } from '../../src/patterns/package-artifacts.ts';
import { patternDefinitions } from '../../src/patterns/registry.ts';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, args: ['--no-sandbox'] });
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const tokenCss = await readFile('src/styles/tokens.css', 'utf8');
const directory = await mkdtemp(join(tmpdir(), 'pattern-export-'));
const openExport = async (page, html, css) => {
  const cssName = html.match(/href="\.\/(.*?)"/)[1];
  await writeFile(join(directory, cssName), css);
  await writeFile(join(directory, 'index.html'), html);
  await page.goto(pathToFileURL(join(directory, 'index.html')).href, { waitUntil: 'load' });
};
const results = { standalone: [], ui: {} };
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const width of [1100, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const definition of patternDefinitions) {
      const bundle = compilePatternArtifacts(compilePattern(definition), { tokenCss });
      await openExport(page, bundle.html, bundle.css);
      const state = await page.evaluate(selector => {
        const root = document.querySelector(selector);
        const style = getComputedStyle(root);
        const grid = root.querySelector('.layout-grid');
        const button = root.matches('.button_component') ? root : root.querySelector('.button_component');
        return { root: !!root, bodyMargin: getComputedStyle(document.body).margin,
          token: style.getPropertyValue('--semantic-text').trim(), boxSizing: style.boxSizing,
          grid: grid ? getComputedStyle(grid).display : null,
          button: button ? getComputedStyle(button).display : null,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      }, definition.selector);
      assert(state.root && state.token, `${definition.id} root and tokens`);
      assert.equal(state.bodyMargin, '0px');
      assert.equal(state.boxSizing, 'border-box');
      if (state.button) assert.ok(['inline-flex', 'flex'].includes(state.button), `${definition.id} button dependency`);
      assert(!state.overflow, `${definition.id} overflow at ${width}`);
      results.standalone.push({ id: definition.id, width, ...state });
      if (['stacked-scroll-panel', 'listing-card'].includes(definition.id)) await page.screenshot({ path: `evidence/pattern-export-bundle/renders/${definition.id}-${width}.jpg`, quality: 80 });
    }
  }
  await context.close();
  const ui = await browser.newPage();
  await ui.goto(`${base}/patterns/stacked-scroll-panel`);
  await ui.evaluate(() => { window.__copied = ''; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copied = text; } } }); });
  await ui.locator('[data-pattern-export-open]').click();
  const exportCode = ui.locator('[data-pattern-export-code]');
  const initial = await exportCode.textContent();
  assert.match(initial, /@layer tokens, elements, utilities, components, patterns;/);
  const theme = { version: 1, contentHash: 'export-browser', variables: { '--brand-accent': '#123456', '--semantic-action': 'var(--brand-accent)', '--space-xl': 'clamp(1rem, 2vw, 3rem)' } };
  // Live theme must work even when writing to storage fails.
  await ui.evaluate(theme => { Storage.prototype.setItem = () => { throw new Error('storage unavailable'); }; window.dispatchEvent(new CustomEvent('framework-site-theme:update', { detail: theme })); }, theme);
  await ui.waitForFunction(() => document.querySelector('[data-pattern-export-code]').textContent.includes('--brand-accent: #123456;'));
  const css = await exportCode.textContent();
  assert.match(css, /--space-xl: clamp\(1rem, 2vw, 3rem\);/);
  await ui.locator('[data-pattern-export-copy="css"]').click();
  assert.equal(await ui.evaluate(() => window.__copied), css);
  await ui.locator('[data-pattern-export-close]').click();
  await ui.locator('[data-pattern-export-direct-copy]').click();
  await ui.locator('[data-pattern-export-open]').click();
  assert.equal(await ui.evaluate(() => window.__copied), css);
  const save = async selector => {
    const pending = ui.waitForEvent('download');
    await ui.locator(selector).click();
    const download = await pending;
    return readFile(await download.path());
  };
  assert.equal((await save('[data-pattern-export-save="css"]')).toString(), css);
  await ui.locator('[data-pattern-export-file="html"]').click();
  const html = await exportCode.textContent();
  assert.equal((await save('[data-pattern-export-save="html"]')).toString(), html);
  const archive = await save('[data-pattern-export-all]');
  let offset = 0;
  for (const expected of [css, html]) {
    assert.equal(archive.readUInt32LE(offset), 0x04034b50);
    const size = archive.readUInt32LE(offset + 18);
    const start = offset + 30 + archive.readUInt16LE(offset + 26) + archive.readUInt16LE(offset + 28);
    assert.equal(archive.subarray(start, start + size).toString(), expected);
    offset = start + size;
  }
  await ui.locator('[data-pattern-export-file="css"]').click();
  await ui.evaluate(() => window.dispatchEvent(new CustomEvent('framework-site-theme:reset')));
  assert.equal(await exportCode.textContent(), initial);
  await ui.evaluate(theme => window.dispatchEvent(new StorageEvent('storage', { key: 'techies-tools:framework:site-theme:v1', newValue: JSON.stringify(theme) })), theme);
  assert.equal(await exportCode.textContent(), css);
  await ui.screenshot({ path: 'evidence/pattern-export-bundle/renders/export-dialog.jpg', quality: 82 });
  const definition = patternDefinitions.find(d => d.id === 'stacked-scroll-panel');
  const renamedState = setPatternExportName(definition, defaultPatternState(definition), 'custom-stack');
  await ui.evaluate(({ key, newValue }) => window.dispatchEvent(new StorageEvent('storage', { key, newValue })), {
    key: patternStorageKey(definition), newValue: serializePatternState(definition, renamedState),
  });
  assert.match(await exportCode.textContent(), /@scope \(\.custom-stack_component\)/);
  await ui.locator('[data-pattern-export-file="html"]').click();
  assert.match(await exportCode.textContent(), /href="\.\/custom-stack_component\.css"/);
  results.ui = { copyDownloadZipIdentical: true, liveThemeWithoutStorage: true, resetAndCrossTabTheme: true, crossTabPatternRename: true };
  const standalone = await browser.newPage();
  await openExport(standalone, html, css);
  assert.equal(await standalone.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--brand-accent').trim()), '#123456');
  assert.equal(await standalone.locator('script').count(), 0);
} finally { await browser.close(); await rm(directory, { recursive: true, force: true }); }
await writeFile('evidence/pattern-export-bundle/browser-results.json', JSON.stringify(results, null, 2));
console.log('26 standalone renders; live theme, reset, cross-tab, copy/download/ZIP parity passed.');
