import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM, args: ['--no-sandbox'] });
const page = await browser.newPage();
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const result = {};
try {
  await page.goto(`${base}/framework/homepage`);
  await page.locator('[data-export-open]').click();
  await page.locator('[data-export-file="utilities"]').click();
  result.utilities = await page.locator('[data-export-code]').innerText();
  assert.match(result.utilities, /Artifact: utilities.css/);
  assert.match(result.utilities, /--_columns: 1/);
  await page.locator('[data-export-file="context"]').click();
  const context = await page.locator('[data-export-code]').innerText();
  result.contextHasUtilities = context.includes(result.utilities.trim());
  assert(result.contextHasUtilities);
  result.loadOrder = context.match(/loadOrder:[\s\S]*?---/)?.[0];
  assert.match(result.loadOrder, /tokens.css[\s\S]*elements.css[\s\S]*utilities.css[\s\S]*components.css/);
  await page.screenshot({ path: 'evidence/dry-pattern-migration/renders/framework-export.jpg', quality: 82 });
} finally { await browser.close(); }
await writeFile('evidence/dry-pattern-migration/export-results.json', JSON.stringify(result, null, 2));
console.log('Framework utilities selection and self-contained Context export passed.');
