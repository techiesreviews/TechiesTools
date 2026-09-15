const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE ?? 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto(`${process.env.QA_BASE_URL ?? 'http://127.0.0.1:4321'}/patterns/stacked-scroll-panel`);
await page.getByRole('button',{name:'Advanced HTML & CSS',exact:true}).click();
const editor=page.locator('#pattern-css-source');
const failures=[];
for (const [name,source,needle] of [
 ['literal','.pattern-stacked-scroll-panel {\n  color: red\n}', 'red'],
 ['token','.pattern-stacked-scroll-panel {\n  color: var(--semantic-text)\n}', 'var(--semantic-text)'],
 ['existing semicolon','.pattern-stacked-scroll-panel {\n  color: red;\n}', 'red'],
 ['mid document','.pattern-stacked-scroll-panel {\n  color: red\n  background: blue;\n}', 'red']
]) {
 await editor.fill(source);await page.waitForTimeout(100);
 const before=await editor.evaluate((e,needle)=>{const at=e.value.indexOf(needle)+needle.length;e.focus();e.setSelectionRange(at,at);return {value:e.value,at};},needle);
 await page.keyboard.type(';');await page.waitForTimeout(100);
 const after=await editor.evaluate(e=>({value:e.value,at:e.selectionStart,overlay:[...e.closest('[data-code-editor-surface]').querySelectorAll('.code-editor-source-line')].map(l=>l.textContent.replace(/\u200b/g,'')).join('\n')}));
 const expected=before.value.slice(0,before.at)+';'+before.value.slice(before.at);
 try{assert.equal(after.value,expected);assert.equal(after.at,before.at+1);assert.equal(after.overlay,after.value);}catch(e){failures.push({name,before,after,expected});}
}
// Live CSS still compiles, invalid drafts retain the previous valid Preview.
const valid='.pattern-stacked-scroll-panel {\n  color: rgb(255, 0, 0);\n}';
await editor.fill(valid);
assert.equal(await editor.inputValue(),valid);
assert.equal(await page.locator('[data-pattern-specimen] > *').evaluate(e=>getComputedStyle(e).color),'rgb(255, 0, 0)');
await editor.fill('body { color: blue; }');
assert.equal(await editor.getAttribute('aria-invalid'),'true');
assert.equal(await page.locator('[data-pattern-specimen] > *').evaluate(e=>getComputedStyle(e).color),'rgb(255, 0, 0)');
await editor.fill(valid);
assert.equal(await editor.getAttribute('aria-invalid'),'false');

// Color previews resolve against the selected Pattern element, including local tokens.
const colorSource=`.pattern-stacked-scroll-panel {
  --local-color: #663399;
  --local-number: 12px;
  --cycle: var(--cycle);

  color: var(--local-color);
  background: color-mix(
    in srgb, var(--local-color) 50%, white
  );
  border-color: var(--missing, rgb(0, 128, 0));
  outline-color: VAR(--semantic-primary);
  caret-color: transparent;
  fill: VAR(--unknown);
  stroke: var(--cycle);
  width: var(--local-number);
  height: inherit;
}`;
await editor.fill(colorSource);
await page.waitForTimeout(100);
const colorMarkers=await editor.evaluate(e=>[...e.closest('[data-code-editor-surface]').querySelectorAll('.code-editor-color-marker')].map(m=>({value:m.dataset.colorValue,fill:m.querySelector('rect').getAttribute('fill'),line:m.closest('.code-editor-source-line').textContent.replace(/\u200b/g,''),position:getComputedStyle(m).position})));
const expectedColors=['#663399','var(--local-color)','color-mix(\n    in srgb, var(--local-color) 50%, white\n  )','var(--missing, rgb(0, 128, 0))','VAR(--semantic-primary)','transparent'];
assert.deepEqual(colorMarkers.map(m=>m.value),expectedColors);
assert(colorMarkers.every(m=>m.position==='absolute'));
assert(colorMarkers.every(m=>m.line.includes(m.value.split('\n')[0])),'Markers align with their own source line');
assert.equal(await editor.inputValue(),colorSource,'Markers preserve authored text');
const beforeMarkerGeometry=await editor.evaluate(e=>[...e.closest('[data-code-editor-surface]').querySelectorAll('.code-editor-source-line')].map(l=>{const r=l.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
await page.locator('.code-editor-color-marker').evaluateAll(ms=>ms.forEach(m=>m.remove()));
assert.deepEqual(await editor.evaluate(e=>[...e.closest('[data-code-editor-surface]').querySelectorAll('.code-editor-source-line')].map(l=>{const r=l.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})),beforeMarkerGeometry,'Swatches do not shift overlay geometry');
await editor.evaluate(e=>e.dispatchEvent(new Event('code-editor:refresh')));
await page.locator('#pattern-css-source').evaluate(e=>e.scrollTop=0);
await page.screenshot({path:'evidence/pattern-editor/color-fixture.png',fullPage:true});

// HTML uses the same selection restoration path; preserve its authored whitespace too.
const html=page.locator('#pattern-html-source');
const markup='<section class="pattern-stacked-scroll-panel">\n  <h2>Original title</h2>\n</section>';
await html.fill(markup);
assert.equal(await html.inputValue(),markup);
const offset=markup.indexOf('Original')+'Original'.length;
await html.evaluate((e,at)=>{e.focus();e.setSelectionRange(at,at);},offset);
await page.keyboard.type(';');
assert.equal(await html.inputValue(),markup.slice(0,offset)+';'+markup.slice(offset));
assert.equal(await html.evaluate(e=>e.selectionStart),offset+1);
assert.equal(await page.locator('[data-pattern-specimen] h2').textContent(),'Original; title');

console.log(JSON.stringify({failures,livePreview:true,invalidDraft:true,htmlTyping:true,colorMarkers},null,2));
await page.getByRole('button',{name:'Reset',exact:true}).click();
await page.waitForTimeout(100);
assert((await page.locator('.code-editor-color-marker').count())>0);
await page.screenshot({path:'evidence/pattern-editor/desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.waitForTimeout(150);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page overflow on mobile');
const mobileSource=await editor.inputValue();
const mobileAt=mobileSource.indexOf('var(--semantic-surface)')+'var(--semantic-surface)'.length;
await editor.evaluate((e,at)=>{e.focus();e.setSelectionRange(at,at);},mobileAt);
await page.keyboard.type(';');
assert.equal(await editor.inputValue(),mobileSource.slice(0,mobileAt)+';'+mobileSource.slice(mobileAt));
assert.equal(await editor.evaluate(e=>e.selectionStart),mobileAt+1);
await page.screenshot({path:'evidence/pattern-editor/mobile.png',fullPage:true});
// Reopening saved CSS keeps a terminator on the last declaration of nested rules.
await page.reload();
await page.getByRole('button',{name:'Advanced HTML & CSS',exact:true}).click();
const reopened=await editor.inputValue();
const reopenedLines=reopened.split('\n');
const unterminated=reopenedLines.filter((line,i)=>/^\s*(?:--[\w-]+|[a-z-]+)\s*:/.test(line)&&!line.trimEnd().endsWith(';')&&/^\s*}/.test(reopenedLines[i+1]??''));
assert.deepEqual(unterminated,[],'Reloaded CSS includes final declaration semicolons');
await browser.close();assert.equal(failures.length,0,'Semicolon must remain visible at the insertion point without moving the caret to another line');
