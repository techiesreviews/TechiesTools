import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const output = `${process.cwd()}/evidence/dry-pattern-migration`;
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, headless: true, args: ['--no-sandbox'] });
const results = {};
try {
  for (const id of ['product-timeline', 'editorial-image-panels']) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 850 }, javaScriptEnabled: false });
    await page.setContent(await readFile(`${output}/renders/${id}.html`, 'utf8'));
    const image = page.locator('img').nth(1);
    const state = () => image.evaluate(e => ({ transform: getComputedStyle(e).transform, animation: getComputedStyle(e).animationName, timeline: getComputedStyle(e).animationTimeline, scroll: scrollY }));
    await page.waitForTimeout(100);
    const before = await state();
    await image.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(150);
    const middle = await state();
    await page.screenshot({ path: `${output}/renders/${id}-motion.jpg`, quality: 85 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(150);
    const reversed = await state();
    assert.notEqual(middle.transform, before.transform, `${id}: scroll changes the image transform`);
    assert.equal(reversed.transform, before.transform, `${id}: reverse scroll restores the initial transform`);
    results[id] = { before, middle, reversed };
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(`${output}/motion-results.json`, JSON.stringify(results, null, 2));
}
console.log('Both scroll effects respond and reverse without runtime JavaScript.');

const stackBrowser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, headless: true, args: ['--no-sandbox'] });
try {
  const page = await stackBrowser.newPage({ viewport: { width: 1100, height: 900 }, javaScriptEnabled: false });
  await page.setContent(await readFile(`${output}/renders/stacked-scroll-panel.html`, 'utf8'));
  const card = page.locator('.stacked-card_component').first();
  const state = () => card.evaluate(e => ({ position: getComputedStyle(e).position, scale: getComputedStyle(e).scale, animation: getComputedStyle(e).animationName, timeline: getComputedStyle(e).animationTimeline }));
  await page.waitForTimeout(100);
  const before = await state();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .4));
  await page.waitForTimeout(150);
  const middle = await state();
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(150);
  const reversed = await state();
  assert.equal(before.position, 'sticky');
  assert.notEqual(middle.scale, before.scale);
  assert.equal(reversed.scale, before.scale);
  results['stacked-scroll-panel'] = { before, middle, reversed };
  await writeFile(`${output}/motion-results.json`, JSON.stringify(results, null, 2));
} finally { await stackBrowser.close(); }
console.log('Nested stacked-card scopes preserve forward and reverse scroll animation.');
