import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const repo = process.cwd();
const output = `${repo}/evidence/ten-video-sections`;
const references = JSON.parse(await readFile(`${output}/references.json`, 'utf8')).references.filter(r => !process.env.QA_IDS || process.env.QA_IDS.split(',').includes(r.id));
const { getPatternDefinition } = await import(pathToFileURL(`${repo}/src/patterns/registry.ts`));
const { compilePattern, defaultPatternState, setPatternExportName, setPatternStylesheet, setPatternHtml } = await import(pathToFileURL(`${repo}/src/patterns/engine.ts`));
const { buttonComponentCss } = await import(pathToFileURL(`${repo}/src/framework/component-catalog/index.ts`));
const tokens = await readFile(`${repo}/src/styles/tokens.css`, 'utf8');
await mkdir(`${output}/renders`, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, headless: true, args: ['--no-sandbox'] });
const results = process.env.QA_IDS
  ? JSON.parse(await readFile(`${output}/browser-results.json`, 'utf8'))
  : { sections: {}, failures: [] };
results.failures = [];
const record = (condition, message) => { if (!condition) results.failures.push(message); };
const metrics = page => page.evaluate(() => {
  const root = document.body.firstElementChild;
  return {
    width: innerWidth, height: innerHeight,
    pageWidth: document.documentElement.scrollWidth,
    rootWidth: root.getBoundingClientRect().width,
    pageHeight: document.documentElement.scrollHeight,
    scripts: document.scripts.length,
    text: root.innerText,
    images: [...root.querySelectorAll('img')].map(e => ({ src: e.currentSrc || e.src, loaded: e.complete && e.naturalWidth > 0, alt: e.getAttribute('alt') })),
    animations: [...root.querySelectorAll('*'), root].flatMap(e => {
      const s = getComputedStyle(e);
      return s.animationName === 'none' ? [] : [{ className: e.className, name: s.animationName, duration: s.animationDuration, timeline: s.animationTimeline }];
    }),
    headings: [...root.querySelectorAll('h1,h2,h3')].map(e => ({ text: e.textContent.trim(), childTags: [...e.children].map(c => c.tagName) })),
  };
});
try {
  for (const reference of references) {
    const id = reference.id;
    const definition = getPatternDefinition(id);
    assert(definition, `Missing ${id}`);
    const state = setPatternExportName(definition, defaultPatternState(definition), `review-${id}`);
    const compiled = compilePattern(definition, state);
    record(setPatternStylesheet(definition, state, compiled.css).success, `${id}: CSS edit roundtrip`);
    record(setPatternHtml(definition, state, compiled.html).success, `${id}: HTML edit roundtrip`);
    record(!compiled.css.includes(definition.selector), `${id}: namespace rename`);
    record(definition.previewLayout === 'canvas', `${id}: full canvas`);
    const document = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${definition.title} — portable verification</title><style>${tokens}\n${buttonComponentCss}\nbody { margin: 0; background: var(--semantic-surface); }\n${compiled.css}</style><body>${compiled.html}</body></html>`;
    await writeFile(`${output}/renders/${id}.html`, document);
    const section = results.sections[id] = {};
    for (const [mode, options] of [
      ['desktop', { viewport: { width: 1100, height: 850 } }],
      ['mobile', { viewport: { width: 390, height: 844 } }],
      ['small-mobile', { viewport: { width: 320, height: 700 } }],
      ['reduced-motion', { viewport: { width: 1100, height: 850 }, reducedMotion: 'reduce' }],
    ]) {
      const context = await browser.newContext({ ...options, javaScriptEnabled: false });
      const page = await context.newPage();
      await page.setContent(document, { waitUntil: 'load' });
      // Decode all evidence images, including offscreen decorative portraits.
      // This is harness setup; the exported document contains no script.
      await page.locator('img').evaluateAll(async images => {
        images.forEach(image => image.loading = 'eager');
        await Promise.all(images.map(image => image.decode().catch(() => {})));
      });
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(mode === 'reduced-motion' ? 150 : 1000);
      section[mode] = await metrics(page);
      record(section[mode].pageWidth <= options.viewport.width + 1, `${id}/${mode}: horizontal page overflow (${section[mode].pageWidth})`);
      record(section[mode].scripts === 0, `${id}/${mode}: no scripts`);
      record(section[mode].headings.every(h => h.childTags.length === 0), `${id}/${mode}: unsplit headings`);
      if (mode === 'desktop') record(section[mode].images.every(i => i.loaded), `${id}: images load`);
      if (mode === 'reduced-motion') record(section[mode].animations.every(a => parseFloat(a.duration) <= 0.01), `${id}: reduced-motion animations disabled`);
      if (mode === 'desktop' || mode === 'mobile') await page.screenshot({ path: `${output}/renders/${id}-${mode}.jpg`, fullPage: true, quality: 82 });
      if (mode === 'desktop') {
        section.radioStates = [];
        for (const input of await page.locator('input[type="radio"]').all()) {
          const before = await page.locator('body').innerText();
          const wasChecked = await input.isChecked();
          await input.focus();
          await page.keyboard.press('Space');
          await page.waitForTimeout(100);
          const after = await page.locator('body').innerText();
          const checked = await input.isChecked();
          section.radioStates.push({ name: await input.getAttribute('name'), value: await input.getAttribute('value'), wasChecked, checked, contentChanged: before !== after, text: after });
          record(checked, `${id}: radio works with keyboard`);
          if (!wasChecked) record(before !== after, `${id}: radio changes visible content`);
        }
        section.disclosures = [];
        for (const details of await page.locator('details').all()) {
          const summary = details.locator('summary');
          const before = await details.getAttribute('open') !== null;
          await summary.focus(); await page.keyboard.press('Enter');
          const after = await details.getAttribute('open') !== null;
          section.disclosures.push({ label: await summary.innerText(), before, after });
          record(before !== after, `${id}: disclosure keyboard activation`);
        }
        section.horizontalScroll = [];
        for (const region of await page.locator('[tabindex="0"]').all()) {
          const before = await region.evaluate(e => ({ width: e.clientWidth, scrollWidth: e.scrollWidth, left: e.scrollLeft }));
          if (before.scrollWidth <= before.width + 1) continue;
          await region.focus();
          for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(450);
          const left = await region.evaluate(e => e.scrollLeft);
          section.horizontalScroll.push({ before, left });
          record(left > before.left, `${id}: horizontal rail keyboard scroll`);
        }
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${output}/renders/${id}-interaction.jpg`, quality: 82 });
      }
      await context.close();
    }
    console.log(`Verified ${id}`);
  }
} finally {
  await browser.close();
  await writeFile(`${output}/browser-results.json`, JSON.stringify(results, null, 2));
}
assert.deepEqual(results.failures, []);
console.log(`${references.length} portable sections passed.`);
