import assert from 'node:assert/strict';
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const repo=process.cwd();
const {getPatternDefinition}=await import(pathToFileURL(repo+'/src/patterns/registry.ts'));
const {compilePattern,setPatternExportName}=await import(pathToFileURL(repo+'/src/patterns/engine.ts'));
const {buttonComponentCss}=await import(pathToFileURL(repo+'/src/framework/component-catalog/index.ts'));
const definition=getPatternDefinition('stacked-scroll-panel');
const compiled=compilePattern(definition,setPatternExportName(definition,{},'feature-stack'));
const tokens=await readFile(repo+'/src/styles/tokens.css','utf8');
const document=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stacked panel portable verification</title><style>${tokens}\n${buttonComponentCss}\nbody{margin:0;background:var(--semantic-surface)}\n${compiled.css}</style><body>${compiled.html}</body></html>`;
await mkdir(repo+'/evidence/stacked-scroll-panel',{recursive:true});
await writeFile(repo+'/evidence/stacked-scroll-panel/portable.html',document);
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM,headless:true,args:['--no-sandbox']});
const results={};
async function metrics(page){return await page.evaluate(()=>{
 const root=document.querySelector('.feature-stack');
 const scroller=document.scrollingElement;
 const panels=[...root.querySelectorAll('article')];
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
 return {viewport:{width:innerWidth,height:innerHeight},root:rect(root),scroller:scroller?{class:scroller.className,scrollTop:scroller.scrollTop,scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight}:null,panels:panels.map(e=>({rect:rect(e),position:getComputedStyle(e).position,scale:getComputedStyle(e).scale,transform:getComputedStyle(e).transform,animation:getComputedStyle(e).animationName})),overflow:document.documentElement.scrollWidth>innerWidth,images:[...root.querySelectorAll('img')].map(e=>({loaded:e.complete&&e.naturalWidth>0,src:e.currentSrc})),scripts:document.scripts.length};
});}
for(const [name,options] of [['desktop',{viewport:{width:1000,height:800}}],['mobile',{viewport:{width:390,height:844}}],['small-mobile',{viewport:{width:320,height:700}}],['reduced-motion',{viewport:{width:1000,height:800},reducedMotion:'reduce'}]]){
 const context=await browser.newContext({...options,javaScriptEnabled:false});const page=await context.newPage();
 await page.setContent(document,{waitUntil:'networkidle'});await page.waitForTimeout(200);
 results[name]={initial:await metrics(page)};
 await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/'+name+'.png',fullPage:true});
 if(name==='desktop'){
  for(const fraction of [.35,.65,1,0]){
   await page.evaluate(f=>{const s=document.scrollingElement;s.scrollTop=(s.scrollHeight-s.clientHeight)*f},fraction);
   await page.waitForTimeout(120);results[name]['scroll-'+fraction]=await metrics(page);
   await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/desktop-scroll-'+fraction+'.png',fullPage:true});
  }
  await page.keyboard.press('Tab');await page.keyboard.press('PageDown');await page.waitForTimeout(400);
  results.keyboard={afterPageDown:await metrics(page),focus:await page.evaluate(()=>({tag:document.activeElement.tagName,label:document.activeElement.getAttribute("aria-label")}))};
  for(let i=0;i<5;i++){await page.keyboard.press('Tab');await page.waitForTimeout(100);results.keyboard['tab'+i]=await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return {tag:e.tagName,text:e.textContent,rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})}
 }
 if(name!=='desktop'){
  await page.locator('.feature-stack__action').first().focus();
  results[name].focused=await metrics(page);
  assert(results[name].focused.panels.every(p=>p.position==='relative'&&p.animation==='none'),'Fallback must remain static when focused');
 }
 await context.close();
}
const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4321/patterns/stacked-scroll-panel');await page.waitForTimeout(1500);
await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/authoring-desktop.png',fullPage:true});
results.authoring={title:await page.title(),errors,specimen:await page.locator('[data-pattern-specimen]').count()};
results.authoring.canvas=await page.evaluate(()=>{const p=document.querySelector('.pattern-stacked-scroll-panel'),v=document.querySelector('[data-preview-viewport]');return {patternWidth:p.clientWidth,previewWidth:v.clientWidth,patternOverflow:getComputedStyle(p).overflowY,wrapperPadding:getComputedStyle(document.querySelector('[data-pattern-preview]')).padding};});
assert.equal(results.authoring.canvas.patternWidth,results.authoring.canvas.previewWidth,'Pattern fills the Preview canvas');
assert.equal(results.authoring.canvas.wrapperPadding,'0px');
await page.getByRole('button',{name:'Flow',exact:true}).click();
assert.equal(await page.locator('.pattern-stacked-scroll-panel').getAttribute('data-motion'),'flow');
await page.reload();
assert.equal(await page.locator('.pattern-stacked-scroll-panel').getAttribute('data-motion'),'flow','Flow persists');
await page.getByRole('button',{name:'Stacked',exact:true}).click();
assert.equal(await page.locator('.pattern-stacked-scroll-panel').evaluate(e=>getComputedStyle(e).overflowY),'visible','No nested Pattern scrollport');
await page.locator('[data-preview-scroll]').evaluate(e=>e.scrollTop=e.scrollHeight);
await page.waitForTimeout(200);
results.authoring.endWidths=await page.locator('[data-pattern-specimen] article').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));
assert(results.authoring.endWidths[0]<results.authoring.endWidths[1]&&results.authoring.endWidths[1]<results.authoring.endWidths[2]);
await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/authoring-stack.png',fullPage:true});
await page.getByRole('button',{name:'Open',exact:true}).click();
assert.equal(await page.locator('.pattern-stacked-scroll-panel').evaluate(e=>getComputedStyle(e).getPropertyValue('--stacked-scroll-panel-reveal').trim()),'2rem');
await page.getByRole('button',{name:'Default',exact:true}).click();
await page.locator('[data-preview-scroll]').evaluate(e=>e.scrollTop=0);
results.authoring.controlsAndPersistence=true;
await page.getByRole('button',{name:'Mobile preview',exact:true}).click();await page.waitForTimeout(200);
results.authoring.narrowPreview=await page.locator('[data-pattern-specimen]').evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth,cards:[...e.querySelectorAll('article')].map(c=>({width:c.clientWidth,scrollWidth:c.scrollWidth,position:getComputedStyle(c).position}))}));
await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/authoring-narrow-preview.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
await page.screenshot({path:repo+'/evidence/stacked-scroll-panel/authoring-mobile.png',fullPage:true});
results.authoring.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
assert.equal(await page.locator('[data-pattern-preview]').evaluate(e=>getComputedStyle(e).padding),'0px','Mobile uses full canvas');
await page.setViewportSize({width:1440,height:1000});
results.otherPatterns={};
for(const id of ['button','listing-card']){
 await page.goto('http://127.0.0.1:4321/patterns/'+id);
 assert.equal(await page.locator('.pattern-preview--canvas').count(),0,'Compact Patterns retain specimen layout');
 results.otherPatterns[id]={title:await page.title(),compact:true};
}
await browser.close();
const end=results.desktop['scroll-1'].panels;
assert(end[0].rect.width<end[1].rect.width&&end[1].rect.width<end[2].rect.width,'Stack must recede in three widths');
assert(end[2].rect.y>=0&&end[2].rect.y+end[2].rect.height<=results.desktop['scroll-1'].viewport.height,'Last panel must fit');
assert.equal(results.desktop['scroll-0'].scroller.scrollTop,0);
assert.equal(results.desktop['scroll-0'].panels[0].rect.width,results.desktop.initial.panels[0].rect.width);
for(const name of ['mobile','small-mobile','reduced-motion']){
 assert.equal(results[name].initial.overflow,false,name+' must fit');
 assert(results[name].initial.panels.every(p=>p.position==='relative'&&p.animation==='none'),name+' must use normal flow without animation');
}
for(let i=0;i<3;i++)assert.equal(results.keyboard['tab'+i].hit,true,'Focused link must be exposed');
assert.equal(results.desktop.initial.scripts,0);
assert.equal(results.authoring.errors.length,0);
assert(results.authoring.narrowPreview.cards.every(c=>c.scrollWidth<=c.width&&c.position==='relative'),'Narrow Preview cards must fit');
await writeFile(repo+'/evidence/stacked-scroll-panel/browser-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
