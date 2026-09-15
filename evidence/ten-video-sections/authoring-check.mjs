import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const output = `${process.cwd()}/evidence/ten-video-sections`;
const references = JSON.parse(await readFile(`${output}/references.json`, 'utf8')).references;
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, headless: true, args: ['--no-sandbox'] });
const results = { sections: {}, errors: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', e => results.errors.push(e.message));
  await page.goto(`${base}/patterns`);
  assert.equal(await page.locator('[data-pattern-card]').count(), 13);
  await page.screenshot({ path: `${output}/renders/library.jpg`, quality: 85 });
  for (const { id } of references) {
    await page.goto(`${base}/patterns/${id}`);
    await page.locator('[data-pattern-specimen] > section').waitFor();
    await page.locator('[data-pattern-reset]').click();
    await page.waitForTimeout(300);
    const result = results.sections[id] = {};
    result.canvas = await page.evaluate(() => {
      const root = document.querySelector('[data-pattern-specimen]').firstElementChild;
      const viewport = document.querySelector('[data-preview-viewport]');
      return { root: root.getBoundingClientRect().width, viewport: viewport.clientWidth, padding: getComputedStyle(document.querySelector('[data-pattern-preview]')).padding };
    });
    assert(Math.abs(result.canvas.root - result.canvas.viewport) <= 1, `${id}: fills full Preview`);
    assert.equal(result.canvas.padding, '0px');
    const controls = page.locator('[data-settings-segmented^="pattern-control-"]');
    result.controls = [];
    for (const control of await controls.all()) {
      const name = await control.getAttribute('data-settings-segmented');
      const choice = control.locator('button').last();
      const value = await choice.getAttribute('data-settings-segmented-value');
      await choice.click();
      assert.equal(await choice.getAttribute('aria-pressed'), 'true');
      result.controls.push({ name, value });
    }
    await page.reload();
    for (const { name, value } of result.controls) assert.equal(await page.locator(`[data-settings-segmented="${name}"] [data-settings-segmented-value="${value}"]`).getAttribute('aria-pressed'), 'true', `${id}: control persists`);
    await page.locator('[data-pattern-reset]').click();
    await page.screenshot({ path: `${output}/renders/${id}-authoring.jpg`, quality: 82 });
    await page.getByRole('button', { name: 'Mobile preview', exact: true }).click();
    await page.waitForTimeout(150);
    result.mobile = await page.locator('[data-pattern-specimen]').evaluate(e => ({ width: e.clientWidth, scrollWidth: e.scrollWidth, rootWidth: e.firstElementChild.getBoundingClientRect().width }));
    assert(result.mobile.scrollWidth <= result.mobile.width + 1, `${id}: narrow Preview fits`);
    await page.screenshot({ path: `${output}/renders/${id}-authoring-mobile.jpg`, quality: 82 });
    // Exercise Advanced source without altering the user's canonical section.
    await page.locator('[data-pattern-advanced-open]').click();
    assert((await page.locator('#pattern-css-source').inputValue()).includes('{'));
    assert((await page.locator('#pattern-html-source').inputValue()).includes('<section'));
    console.log(`Verified authoring ${id}`);
  }
  assert.deepEqual(results.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/authoring-results.json`, JSON.stringify(results, null, 2));
}
